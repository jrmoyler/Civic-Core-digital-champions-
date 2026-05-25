// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Enemy Entity
// ============================================================

import Phaser from 'phaser';
import type { EnemyData, EnemyState } from '../game/types';
import { DEPTH } from '../game/constants';
import { HealthBar } from '../ui/HealthBar';
import { Projectile } from './Projectile';
import { AudioSystem } from '../systems/AudioSystem';

const TEXTURE_MAP: Record<string, string> = {
  misinformerDrone: 'drone',
  bandwidthLeech: 'leech',
  firewallBruiser: 'bruiser',
  darkScreenWisp: 'wisp',
  gatekeeperBot: 'gatekeeper',
  signalSaboteur: 'saboteur',
  glitchTurret: 'turret',
};

export class Enemy extends Phaser.Physics.Arcade.Sprite {
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
  private projectileGroup?: Phaser.Physics.Arcade.Group;

  // Track player reference for AI
  private playerRef: Phaser.Physics.Arcade.Sprite | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    data: EnemyData,
    projectileGroup?: Phaser.Physics.Arcade.Group
  ) {
    const prefix = TEXTURE_MAP[data.type] ?? 'drone';
    super(scene, x, y, `${prefix}_idle`);
    this.enemyData = data;
    this.hp = data.hp;
    this.spawnX = x;
    this.spawnY = y;
    this.projectileGroup = projectileGroup;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.ENEMIES);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(data.width, data.height);
    body.setCollideWorldBounds(true);

    if (data.isFlying) {
      body.setAllowGravity(false);
      body.setGravityY(-650); // override world gravity for fliers
    }

    this.healthBar = new HealthBar(scene, x - data.width / 2, y - data.height / 2 - 14, data.width, 6, data.hp, false);
    this.healthBar.setDepth(DEPTH.ENEMIES + 1);

    this.patrolTimer = Math.random() * 2000; // stagger patrol
    this.shootTimer = (data.shootInterval ?? 2000) * Math.random();
  }

  setPlayerRef(player: Phaser.Physics.Arcade.Sprite): void {
    this.playerRef = player;
  }

  update(delta: number): void {
    if (this.isDead) return;

    this.updateTimers(delta);
    this.updateAI(delta);
    this.updateHealthBar();
    this.updateTexture();
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

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Stationary turret AI
    if (this.enemyData.type === 'glitchTurret') {
      this.turretAI();
      return;
    }

    // Range to player
    const pDist = this.playerRef
      ? Phaser.Math.Distance.Between(this.x, this.y, this.playerRef.x, this.playerRef.y)
      : Infinity;

    // Aggro / de-aggro
    if (pDist < this.aggroRange && this.enemyState === 'patrol') {
      this.enemyState = 'chase';
    } else if (pDist > this.aggroRange * 1.5 && this.enemyState === 'chase') {
      this.enemyState = 'patrol';
    }

    if (this.enemyState === 'patrol') {
      this.patrolBehavior(body, delta);
    } else if (this.enemyState === 'chase') {
      this.chaseBehavior(body, pDist);
    }

    // Shooting enemies
    if (this.enemyData.shootInterval && this.shootTimer <= 0) {
      this.tryShoot();
      this.shootTimer = this.enemyData.shootInterval;
    }
  }

  private patrolBehavior(body: Phaser.Physics.Arcade.Body, delta: number): void {
    const speed = this.enemyData.speed * 0.6;

    if (this.enemyData.isFlying) {
      body.setVelocityX(this.patrolDir * speed);
      // Gentle hover
      body.setVelocityY(Math.sin(Date.now() / 600) * 30);
    } else {
      body.setVelocityX(this.patrolDir * speed);
    }

    // Turn around at patrol boundaries
    const distFromSpawn = Math.abs(this.x - this.spawnX);
    if (distFromSpawn > this.enemyData.patrolRange || body.blocked.right || body.blocked.left) {
      this.patrolDir *= -1;
      this.setFlipX(this.patrolDir < 0);
    }
  }

  private chaseBehavior(body: Phaser.Physics.Arcade.Body, dist: number): void {
    if (!this.playerRef) return;
    const speed = this.enemyData.speed;
    const dx = this.playerRef.x - this.x;

    if (this.enemyData.isFlying) {
      const dy = this.playerRef.y - this.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        body.setVelocityX((dx / len) * speed);
        body.setVelocityY((dy / len) * speed * 0.7);
      }
    } else {
      body.setVelocityX(dx > 0 ? speed : -speed);
    }

    this.setFlipX(dx < 0);

    // Melee attack range
    if (dist < this.enemyData.attackRange && this.attackCooldown <= 0) {
      this.enemyState = 'attack';
      this.attackCooldown = 1200;
      this.scene.time.delayedCall(300, () => {
        if (!this.isDead) this.enemyState = 'chase';
      });
    }
  }

  private turretAI(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    if (this.shootTimer <= 0 && this.playerRef) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
      if (dist < this.enemyData.attackRange) {
        this.tryShoot();
        this.shootTimer = this.enemyData.shootInterval ?? 1800;
      }
    }
  }

  private tryShoot(): void {
    if (!this.projectileGroup || !this.playerRef || !this.active) return;

    const dx = this.playerRef.x - this.x;
    const dy = this.playerRef.y - this.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    const speed = 280;
    const proj = new Projectile(
      this.scene,
      this.x,
      this.y,
      'proj_enemy',
      this.enemyData.damage,
      false
    );
    proj.launch((dx / len) * speed, (dy / len) * speed);
    this.projectileGroup.add(proj);
  }

  /** Take damage, return true if killed */
  takeDamage(amount: number): boolean {
    if (this.isDead) return false;
    this.hp -= amount;
    this.enemyState = 'hurt';
    this.hurtTimer = 200;

    // Flash white
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

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setEnable(false);

    this.healthBar.setVisible(false);

    // Death animation: flash and fade
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
    this.healthBar.update(this.hp, this.enemyData.hp);
    this.healthBar.setPosition(this.x - this.enemyData.width / 2, this.y - this.enemyData.height / 2 - 14);
  }

  private updateTexture(): void {
    const prefix = TEXTURE_MAP[this.enemyData.type] ?? 'drone';
    let suffix = 'idle';

    if (this.enemyState === 'hurt') suffix = 'hurt';
    else if (this.enemyState === 'attack') suffix = 'attack';
    else if (this.enemyData.isFlying) suffix = 'fly';
    else if (this.enemyState === 'chase') suffix = this.enemyData.type === 'signalSaboteur' ? 'dash' : 'move';
    else if (this.enemyData.speed === 0) {
      suffix = this.shootTimer < 400 ? 'shoot' : 'activate';
    }

    const key = `${prefix}_${suffix}`;
    if (this.scene.textures.exists(key)) {
      this.setTexture(key);
    }
  }

  destroy(fromScene?: boolean): void {
    if (this.healthBar) this.healthBar.destroy();
    super.destroy(fromScene);
  }
}
