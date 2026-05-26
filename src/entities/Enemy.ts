// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Enemy Entity
// Physics: Phaser.Physics.Matter.Sprite (rigid-body)
// ============================================================

import Phaser from 'phaser';
import type { EnemyData, EnemyState } from '../game/types';
import { DEPTH, COLLISION_CATEGORIES, MATTER_VELOCITY_SCALE } from '../game/constants';
import { HealthBar } from '../ui/HealthBar';
import { Projectile } from './Projectile';
import { AudioSystem } from '../systems/AudioSystem';
import type { Player } from './Player';

const TEXTURE_MAP: Record<string, string> = {
  misinformerDrone: 'drone',
  bandwidthLeech: 'leech',
  firewallBruiser: 'bruiser',
  darkScreenWisp: 'wisp',
  gatekeeperBot: 'gatekeeper',
  signalSaboteur: 'saboteur',
  glitchTurret: 'turret',
  dataSpikeHazard: 'spike_trap',
};

export class Enemy extends Phaser.Physics.Matter.Sprite {
  public readonly enemyData: EnemyData;
  public hp: number;
  public enemyState: EnemyState = 'patrol';
  public isDead: boolean = false;

  private spawnX: number;
  private spawnY: number;
  private patrolDir: number = 1;
  private patrolTimer: number = 0;
  private shootTimer: number = 0;
  private aggroRange: number = 320;
  private attackCooldown: number = 0;
  private hurtTimer: number = 0;

  private healthBar: HealthBar;
  // Reference to the shared projectile list in LevelScene
  private projectileList?: Projectile[];

  private playerRef: Player | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    data: EnemyData,
    projectileList?: Projectile[],
  ) {
    const prefix = TEXTURE_MAP[data.type] ?? 'drone';
    const spritesheetKey = `enemy_${prefix}_idle`;
    const initialTexture = scene.textures.exists(spritesheetKey) ? spritesheetKey : `${prefix}_idle`;
    super(scene.matter.world, x, y, initialTexture, 0);

    this.enemyData = data;
    this.hp = data.hp;
    this.spawnX = x;
    this.spawnY = y;
    this.projectileList = projectileList;

    scene.add.existing(this);
    this.setDepth(DEPTH.ENEMIES);

    // Compute body dimensions from actual frame size
    const eFrame = (this.texture as Phaser.Textures.Texture).get(0) as Phaser.Textures.Frame;
    const eFrameW = (eFrame && eFrame.realWidth > 0) ? eFrame.realWidth : (data.width > 0 ? data.width : 60);
    const eFrameH = (eFrame && eFrame.realHeight > 0) ? eFrame.realHeight : (data.height > 0 ? data.height : 34);
    const bodyW = Math.max(20, Math.floor(eFrameW * 0.70));
    const bodyH = Math.max(20, Math.floor(eFrameH * 0.80));

    this.setRectangle(bodyW, bodyH, {
      label: 'enemy',
      frictionAir: 0.04,
      friction: 0.08,
      restitution: 0,
      collisionFilter: {
        category: COLLISION_CATEGORIES.ENEMY,
        mask: COLLISION_CATEGORIES.PLATFORM
             | COLLISION_CATEGORIES.ONE_WAY_PLATFORM
             | COLLISION_CATEGORIES.PLAYER_PROJ,
      },
    });

    this.setFixedRotation();

    // Flying enemies ignore world gravity
    if (data.isFlying) {
      this.setIgnoreGravity(true);
    }

    this.healthBar = new HealthBar(scene, x - bodyW / 2, y - bodyH / 2 - 14, bodyW, 6, data.hp, false);
    this.healthBar.setDepth(DEPTH.ENEMIES + 1);

    this.patrolTimer = Math.random() * 2000;
    this.shootTimer = (data.shootInterval ?? 2000) * Math.random();
  }

  private updateOneWayMask(): void {
    if (this.enemyData.isFlying) return; // flying enemies don't need one-way logic
    const body = this.body as MatterJS.BodyType;
    const movingUp = body.velocity.y < -0.3;
    const base = COLLISION_CATEGORIES.PLATFORM | COLLISION_CATEGORIES.PLAYER_PROJ;
    body.collisionFilter.mask = movingUp
      ? base
      : base | COLLISION_CATEGORIES.ONE_WAY_PLATFORM;
  }

  setPlayerRef(player: Player): void {
    this.playerRef = player;
  }

  update(delta: number): void {
    if (this.isDead) return;
    this.updateOneWayMask();
    this.updateTimers(delta);
    this.updateAI(delta);
    this.updateHealthBar();
    this.updateAnimation(this.enemyState);
  }

  private updateTimers(delta: number): void {
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      if (this.hurtTimer <= 0 && this.enemyState === 'hurt') {
        this.enemyState = 'patrol';
      }
    }
    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.patrolTimer > 0) this.patrolTimer -= delta;
    if (this.shootTimer > 0) this.shootTimer -= delta;
  }

  private updateAI(delta: number): void {
    if (this.enemyState === 'hurt') return;

    // Stationary turret
    if (this.enemyData.type === 'glitchTurret') {
      this.turretAI();
      return;
    }

    const pDist = this.playerRef
      ? Phaser.Math.Distance.Between(this.x, this.y, this.playerRef.x, this.playerRef.y)
      : Infinity;

    if (pDist < this.aggroRange && this.enemyState === 'patrol') {
      this.enemyState = 'chase';
    } else if (pDist > this.aggroRange * 1.5 && this.enemyState === 'chase') {
      this.enemyState = 'patrol';
    }

    if (this.enemyState === 'patrol') {
      this.patrolBehavior(delta);
    } else if (this.enemyState === 'chase') {
      this.chaseBehavior(pDist);
    }

    if (this.enemyData.shootInterval && this.shootTimer <= 0) {
      this.tryShoot();
      this.shootTimer = this.enemyData.shootInterval;
    }
  }

  private patrolBehavior(_delta: number): void {
    const speed = this.enemyData.speed * 0.6 * MATTER_VELOCITY_SCALE;

    if (this.enemyData.isFlying) {
      this.setVelocityX(this.patrolDir * speed);
      // Gentle hover sine wave (in Matter px/frame units)
      this.setVelocityY(Math.sin(Date.now() / 600) * 30 * MATTER_VELOCITY_SCALE);
    } else {
      this.setVelocityX(this.patrolDir * speed);
    }

    // Turn around at patrol distance boundary
    const distFromSpawn = Math.abs(this.x - this.spawnX);
    if (distFromSpawn > this.enemyData.patrolRange) {
      this.patrolDir *= -1;
      this.setFlipX(this.patrolDir < 0);
    }
  }

  private chaseBehavior(dist: number): void {
    if (!this.playerRef) return;
    const speed = this.enemyData.speed * MATTER_VELOCITY_SCALE;
    const dx = this.playerRef.x - this.x;

    if (this.enemyData.isFlying) {
      const dy = this.playerRef.y - this.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        this.setVelocityX((dx / len) * speed);
        this.setVelocityY((dy / len) * speed * 0.7);
      }
    } else {
      this.setVelocityX(dx > 0 ? speed : -speed);
    }

    this.setFlipX(dx < 0);

    if (dist < this.enemyData.attackRange && this.attackCooldown <= 0) {
      this.enemyState = 'attack';
      this.attackCooldown = 1200;
      this.scene.time.delayedCall(300, () => {
        if (!this.isDead) this.enemyState = 'chase';
      });
    }
  }

  private turretAI(): void {
    this.setVelocity(0, 0);
    if (this.shootTimer <= 0 && this.playerRef) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
      if (dist < this.enemyData.attackRange) {
        this.tryShoot();
        this.shootTimer = this.enemyData.shootInterval ?? 1800;
      }
    }
  }

  private tryShoot(): void {
    if (!this.projectileList || !this.playerRef || !this.active) return;

    const dx = this.playerRef.x - this.x;
    const dy = this.playerRef.y - this.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    const speed = 280 * MATTER_VELOCITY_SCALE;
    const proj = new Projectile(this.scene, this.x, this.y, 'proj_enemy', this.enemyData.damage, false);
    proj.launch((dx / len) * speed, (dy / len) * speed);
    this.projectileList.push(proj);
  }

  takeDamage(amount: number): boolean {
    if (this.isDead) return false;
    this.hp -= amount;
    this.enemyState = 'hurt';
    this.hurtTimer = 200;

    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (!this.isDead) this.clearTint();
    });

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
      return true;
    }
    return false;
  }

  private die(): void {
    this.isDead = true;
    this.enemyState = 'dead';
    AudioSystem.playEnemyDeath();

    // Disable the physics body without destroying it immediately
    this.setCollisionCategory(0);
    this.setVelocity(0, 0);
    this.healthBar.setVisible(false);

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 0.3,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.healthBar.destroy();
        this.destroy();
      },
    });
  }

  private updateHealthBar(): void {
    const body = this.body as MatterJS.BodyType;
    const hw = (body.bounds.max.x - body.bounds.min.x) / 2;
    const hh = (body.bounds.max.y - body.bounds.min.y) / 2;
    this.healthBar.update(this.hp, this.enemyData.hp);
    this.healthBar.setPosition(this.x - hw, this.y - hh - 14);
  }

  private updateAnimation(state: EnemyState): void {
    const prefix = TEXTURE_MAP[this.enemyData.type] ?? 'drone';
    let suffix = 'idle';

    if (state === 'hurt') {
      suffix = 'hurt';
    } else if (state === 'attack') {
      suffix = 'attack';
    } else if (state === 'dead') {
      suffix = 'defeat';
    } else {
      const body = this.body as MatterJS.BodyType;
      const moving = Math.abs(body.velocity.x) > 0.05 || Math.abs(body.velocity.y) > 0.05;
      suffix = moving ? 'move' : 'idle';
    }

    const animKey = `${prefix}_${suffix}`;
    if (this.scene.anims.exists(animKey)) {
      this.anims.play(animKey, true);
    } else {
      this.updateTexture();
    }
  }

  private updateTexture(): void {
    const prefix = TEXTURE_MAP[this.enemyData.type] ?? 'drone';
    let suffix = 'idle';
    if (this.enemyState === 'hurt') suffix = 'hurt';
    else if (this.enemyState === 'attack') suffix = 'attack';
    else if (this.enemyData.isFlying) suffix = 'fly';
    else if (this.enemyState === 'chase') suffix = this.enemyData.type === 'signalSaboteur' ? 'dash' : 'move';
    else if (this.enemyData.speed === 0) suffix = this.shootTimer < 400 ? 'shoot' : 'activate';
    const key = `${prefix}_${suffix}`;
    if (this.scene.textures.exists(key)) this.setTexture(key);
  }

  destroy(fromScene?: boolean): void {
    if (this.healthBar) this.healthBar.destroy();
    super.destroy(fromScene);
  }
}
