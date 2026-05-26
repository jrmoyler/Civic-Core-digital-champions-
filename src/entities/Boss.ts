// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Boss Entity
// Physics: Phaser.Physics.Matter.Sprite (rigid-body)
// ============================================================

import Phaser from 'phaser';
import type { BossData, BossPhase } from '../game/types';
import { DEPTH, COLLISION_CATEGORIES, MATTER_VELOCITY_SCALE } from '../game/constants';
import { HealthBar } from '../ui/HealthBar';
import { Projectile } from './Projectile';
import { AudioSystem } from '../systems/AudioSystem';
import { EffectsSystem } from '../systems/EffectsSystem';
import type { Player } from './Player';

export class Boss extends Phaser.Physics.Matter.Sprite {
  public readonly bossData: BossData;
  public hp: number;
  public phase: BossPhase = 'idle';
  public isDefeated: boolean = false;
  private activated: boolean = false;

  private attackTimer: number = 3500;
  private attackCooldown: number = 0;
  private currentAttack: number = 0;
  private actionAnimTimer: number = 0;

  private healthBar: HealthBar;
  private nameText: Phaser.GameObjects.Text;
  private effects: EffectsSystem;

  private projectileList?: Projectile[];
  private playerRef: Player | null = null;

  private readonly PHASE2_HP_RATIO = 0.45;

  private static readonly FILE_PREFIX: Record<string, string> = {
    accessDenier: 'access_denier',
    algorithmicGatekeeper: 'algorithmic_gatekeeper',
    blackoutWarden: 'blackout_warden',
  };

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    data: BossData,
    projectileList?: Projectile[],
  ) {
    const filePrefix = Boss.FILE_PREFIX[data.type] ?? data.type;
    const spritesheetKey = `boss_${filePrefix}_idle`;
    const fallbackKey = `${data.type}_idle`;
    const textureKey = scene.textures.exists(spritesheetKey) ? spritesheetKey : fallbackKey;

    super(scene.matter.world, x, y, textureKey, 0);
    this.bossData = data;
    this.hp = data.hp;
    this.projectileList = projectileList;

    scene.add.existing(this);
    this.setDepth(DEPTH.ENEMIES + 2);
    this.setScale(1.4);

    this.setRectangle(data.width, data.height, {
      label: 'boss',
      frictionAir: 0.03,
      friction: 0.08,
      restitution: 0,
      collisionFilter: {
        category: COLLISION_CATEGORIES.BOSS,
        mask: COLLISION_CATEGORIES.PLATFORM
             | COLLISION_CATEGORIES.ONE_WAY_PLATFORM
             | COLLISION_CATEGORIES.PLAYER_PROJ,
      },
    });

    this.setFixedRotation();

    // Disable collision until activated (boss is transparent/dormant)
    this.setCollisionCategory(0);
    this.setCollidesWith([]);

    // Large health bar
    this.healthBar = new HealthBar(
      scene,
      x - data.width * 0.7,
      y - data.height - 30,
      data.width * 1.4,
      12,
      data.hp,
      true,
    );
    this.healthBar.setDepth(DEPTH.ENEMIES + 3);
    this.healthBar.setVisible(false);

    this.nameText = scene.add.text(x, y - data.height - 50, data.name.toUpperCase(), {
      fontSize: '14px',
      color: '#ff4444',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.nameText.setOrigin(0.5, 1);
    this.nameText.setDepth(DEPTH.ENEMIES + 4);
    this.nameText.setVisible(false);

    this.effects = new EffectsSystem(scene);
    this.setAlpha(0.5);
  }

  setPlayerRef(player: Player): void {
    this.playerRef = player;
  }

  activate(): void {
    if (this.activated) return;
    this.activated = true;
    this.phase = 'phase1';

    // Re-enable collision
    this.setCollisionCategory(COLLISION_CATEGORIES.BOSS);
    this.setCollidesWith(
      COLLISION_CATEGORIES.PLATFORM
      | COLLISION_CATEGORIES.ONE_WAY_PLATFORM
      | COLLISION_CATEGORIES.PLAYER_PROJ,
    );

    this.healthBar.setVisible(true);
    this.nameText.setVisible(true);
    this.setAlpha(1);

    this.scene.cameras.main.shake(600, 0.01);
    this.effects.flashCamera(0xff0000, 150);
    AudioSystem.playBossHit();

    // Phaser FX bloom burst on boss entrance (WebGL only)
    if (this.scene.game.renderer.type === Phaser.WEBGL) {
      const glow = this.postFX.addGlow(this.bossData.accentColor, 8, 0, false, 0.1, 16);
      this.scene.time.delayedCall(1200, () => this.postFX.remove(glow));
    }

    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 0.5, to: 1.4 },
      scaleY: { from: 0.5, to: 1.4 },
      duration: 600,
      ease: 'Back',
    });
  }

  update(delta: number): void {
    if (this.isDefeated || !this.activated) return;

    this.attackTimer -= delta;
    if (this.attackCooldown > 0) this.attackCooldown -= delta;

    if (this.phase === 'phase1' && this.hp / this.bossData.hp < this.PHASE2_HP_RATIO) {
      this.enterPhase2();
    }

    if (this.attackTimer <= 0 && this.attackCooldown <= 0) {
      this.performAttack();
      this.attackTimer = this.phase === 'phase2' ? 1800 : 2400;
      this.attackCooldown = 600;
    }

    if (this.playerRef && this.phase !== 'hurt') {
      this.moveTowardPlayer();
    }

    this.healthBar.update(this.hp, this.bossData.hp);
    this.healthBar.setPosition(
      this.x - this.bossData.width * 0.7,
      this.y - this.bossData.height * this.scaleY - 30,
    );
    this.nameText.setPosition(this.x, this.y - this.bossData.height * this.scaleY - 50);

    this.updateTexture(delta);
  }

  private moveTowardPlayer(): void {
    if (!this.playerRef) return;
    const dx = this.playerRef.x - this.x;
    const speed = this.bossData.speed * (this.phase === 'phase2' ? 1.4 : 1) * MATTER_VELOCITY_SCALE;

    if (this.bossData.type === 'algorithmicGatekeeper') {
      const dy = this.playerRef.y - this.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 80) {
        this.setVelocityX((dx / len) * speed);
        this.setVelocityY((dy / len) * speed * 0.5);
      } else {
        this.setVelocity(0, 0);
      }
    } else {
      if (Math.abs(dx) > 60) {
        this.setVelocityX(dx > 0 ? speed : -speed);
      } else {
        this.setVelocityX(0);
      }
      this.setFlipX(dx < 0);
    }
  }

  private performAttack(): void {
    if (!this.playerRef || this.isDefeated) return;
    this.currentAttack = (this.currentAttack + 1) % 3;

    switch (this.bossData.type) {
      case 'accessDenier': this.accessDenierAttack(); break;
      case 'algorithmicGatekeeper': this.gateKeeperAttack(); break;
      case 'blackoutWarden': this.wardenAttack(); break;
    }
  }

  private accessDenierAttack(): void {
    if (this.currentAttack === 0) {
      const dir = this.playerRef!.x > this.x ? 1 : -1;
      this.setVelocityX(dir * 350 * MATTER_VELOCITY_SCALE);
      this.playBossAnim('attack');
      this.scene.time.delayedCall(500, () => { if (!this.isDefeated) { this.setVelocityX(0); this.playBossAnim('idle'); } });
    } else if (this.currentAttack === 1) {
      this.playBossAnim('attack');
      this.shootSpread(3, 220);
    } else {
      this.setVelocityY(-400 * MATTER_VELOCITY_SCALE);
      this.playBossAnim('special');
      AudioSystem.playBossHit();
      this.effects.shakeCamera(0.015, 400);
    }
  }

  private gateKeeperAttack(): void {
    if (this.currentAttack === 0) {
      this.playBossAnim('attack');
      this.shootSpread(6, 200);
    } else if (this.currentAttack === 1) {
      if (this.playerRef && this.projectileList) {
        const dx = this.playerRef.x - this.x;
        const dy = this.playerRef.y - this.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        for (let i = 0; i < 3; i++) {
          this.scene.time.delayedCall(i * 120, () => {
            if (this.isDefeated || !this.projectileList) return;
            const proj = new Projectile(this.scene, this.x, this.y, 'proj_enemy', this.bossData.damage, false);
            proj.launch((dx / len) * 300 * MATTER_VELOCITY_SCALE, (dy / len) * 300 * MATTER_VELOCITY_SCALE);
            this.projectileList.push(proj);
          });
        }
      }
    } else {
      this.playBossAnim('special');
      this.shootSpread(8, 180);
      this.effects.spawnRingPulse(this.x, this.y, 0x00FF88, 120);
    }
  }

  private wardenAttack(): void {
    if (this.currentAttack === 0) {
      this.setVelocityY(-500 * MATTER_VELOCITY_SCALE);
      this.playBossAnim('special');
      this.scene.time.delayedCall(600, () => {
        if (!this.isDefeated) {
          this.effects.shakeCamera(0.02, 500);
          AudioSystem.playBossHit();
          this.shootSpread(4, 160);
        }
      });
    } else if (this.currentAttack === 1) {
      this.playBossAnim('attack');
      this.effects.flashCamera(0x000000, 400);
      this.effects.shakeCamera(0.01, 300);
      this.shootSpread(5, 200);
    } else {
      const dir = this.playerRef!.x > this.x ? 1 : -1;
      this.setVelocityX(dir * 400 * MATTER_VELOCITY_SCALE);
      this.playBossAnim('attack');
      this.scene.time.delayedCall(600, () => { if (!this.isDefeated) { this.setVelocityX(0); this.playBossAnim('idle'); } });
    }
  }

  private shootSpread(count: number, speed: number): void {
    if (!this.projectileList) return;
    const scaledSpeed = speed * MATTER_VELOCITY_SCALE;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const proj = new Projectile(this.scene, this.x, this.y, 'proj_enemy', this.bossData.damage, false);
      proj.launch(Math.cos(angle) * scaledSpeed, Math.sin(angle) * scaledSpeed);
      this.projectileList.push(proj);
    }
  }

  private enterPhase2(): void {
    this.phase = 'phase2';
    this.effects.flashCamera(this.bossData.accentColor, 300);
    this.effects.shakeCamera(0.015, 600);
    AudioSystem.playBossHit();

    // Phaser FX: pulsing glow for phase 2 (WebGL only)
    if (this.scene.game.renderer.type === Phaser.WEBGL) {
      this.postFX.addGlow(this.bossData.accentColor, 6, 0, false, 0.1, 16);
    }

    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 1.4, to: 1.7, yoyo: true },
      scaleY: { from: 1.4, to: 1.7, yoyo: true },
      duration: 400,
      repeat: 2,
    });

    this.setTint(this.bossData.accentColor);
    this.scene.time.delayedCall(500, () => { if (!this.isDefeated) this.clearTint(); });
  }

  takeDamage(amount: number): boolean {
    if (this.isDefeated) return false;
    this.hp -= amount;
    this.playBossAnim('hurt', 220);

    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => { if (!this.isDefeated) this.clearTint(); });
    AudioSystem.playBossHit();

    if (this.hp <= 0) {
      this.hp = 0;
      this.defeat();
      return true;
    }
    return false;
  }

  private defeat(): void {
    this.isDefeated = true;
    this.phase = 'defeated';

    // Disable collision
    this.setCollisionCategory(0);
    this.setCollidesWith([]);
    this.setVelocity(0, 0);

    this.healthBar.setVisible(false);
    this.nameText.setVisible(false);

    this.effects.shakeCamera(0.02, 1000);
    this.effects.flashCamera(0xffffff, 200);
    AudioSystem.playVictory();

    for (let i = 0; i < 12; i++) {
      this.scene.time.delayedCall(i * 80, () => {
        this.effects.spawnHitParticles(
          this.x + Phaser.Math.Between(-40, 40),
          this.y + Phaser.Math.Between(-40, 40),
          this.bossData.accentColor,
          8,
        );
      });
    }

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.2,
      scaleY: 0.2,
      duration: 1200,
      delay: 400,
      ease: 'Power3',
      onComplete: () => {
        this.healthBar.destroy();
        this.nameText.destroy();
        this.destroy();
      },
    });
  }

  private updateTexture(delta: number): void {
    if (this.isDefeated) return;

    // Don't interrupt a one-shot attack/special animation that's still playing
    const current = this.anims.currentAnim;
    if (current) {
      const key = current.key;
      const isAttackAnim = key.endsWith('_attack') || key.endsWith('_special');
      if (isAttackAnim && this.anims.isPlaying) return;
    }

    // Drain action timer — no animation change until it expires
    if (this.actionAnimTimer > 0) {
      this.actionAnimTimer -= delta;
      return;
    }

    // Choose base state
    const body = this.body as Phaser.Physics.Arcade.Body;
    const isMoving = Math.abs(body.velocity.x) > 10 || Math.abs(body.velocity.y) > 10;
    let suffix = 'idle';
    if (this.phase === 'hurt') {
      suffix = 'hurt';
    } else if (isMoving) {
      suffix = 'move';
    }
    const animKey = `${this.bossData.type}_${suffix}`;
    if (this.scene.anims.exists(animKey)) {
      if (this.anims.currentAnim?.key !== animKey) {
        this.anims.play(animKey, true);
      }
    } else {
      // Fallback to single-frame TextureFactory texture
      const legacyKey = `${this.bossData.type}_${suffix === 'move' ? 'idle' : suffix}`;
      if (this.scene.textures.exists(legacyKey)) {
        this.setTexture(legacyKey);
      }
      if (this.scene.textures.exists(animKey)) this.setTexture(animKey);
    }
  }

  private playBossAnim(suffix: string, duration: number = suffix === 'special' ? 700 : 450): void {
    this.actionAnimTimer = duration;
    const animKey = `${this.bossData.type}_${suffix}`;
    if (this.scene.anims.exists(animKey)) {
      this.anims.play(animKey, false); // false = restart even if already playing
      this.anims.play(animKey, true);
    } else if (this.scene.textures.exists(animKey)) {
      this.setTexture(animKey);
    }
  }

  destroy(fromScene?: boolean): void {
    try { this.healthBar?.destroy(); } catch {}
    try { this.nameText?.destroy(); } catch {}
    super.destroy(fromScene);
  }
}
