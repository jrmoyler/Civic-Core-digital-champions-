// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Boss Entity
// ============================================================

import Phaser from 'phaser';
import type { BossData, BossPhase } from '../game/types';
import { DEPTH } from '../game/constants';
import { HealthBar } from '../ui/HealthBar';
import { Projectile } from './Projectile';
import { AudioSystem } from '../systems/AudioSystem';
import { EffectsSystem } from '../systems/EffectsSystem';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  public readonly bossData: BossData;
  public hp: number;
  public phase: BossPhase = 'idle';
  public isDefeated: boolean = false;
  private activated: boolean = false;

  // AI timing
  private attackTimer: number = 3500; // time until first attack
  private attackCooldown: number = 0;
  private phaseTimer: number = 0;
  private currentAttack: number = 0;

  // Visual
  private healthBar: HealthBar;
  private nameText: Phaser.GameObjects.Text;
  private effects: EffectsSystem;

  // Projectile group
  private projectileGroup?: Phaser.Physics.Arcade.Group;
  private playerRef: Phaser.Physics.Arcade.Sprite | null = null;

  // Phase 2 threshold
  private readonly PHASE2_HP_RATIO = 0.45;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    data: BossData,
    projectileGroup?: Phaser.Physics.Arcade.Group
  ) {
    const textureKey = `${data.type}_idle`;
    super(scene, x, y, textureKey);
    this.bossData = data;
    this.hp = data.hp;
    this.projectileGroup = projectileGroup;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.ENEMIES + 2);
    this.setScale(1.4);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(data.width, data.height);
    body.setCollideWorldBounds(true);
    body.setEnable(false); // inactive until triggered

    // Large health bar above boss
    this.healthBar = new HealthBar(
      scene,
      x - data.width * 0.7,
      y - data.height - 30,
      data.width * 1.4,
      12,
      data.hp,
      true
    );
    this.healthBar.setDepth(DEPTH.ENEMIES + 3);
    this.healthBar.setVisible(false);

    // Boss name text
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

  setPlayerRef(player: Phaser.Physics.Arcade.Sprite): void {
    this.playerRef = player;
  }

  /** Trigger boss activation (called when player enters arena) */
  activate(): void {
    if (this.activated) return;
    this.activated = true;
    this.phase = 'phase1';

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setEnable(true);

    this.healthBar.setVisible(true);
    this.nameText.setVisible(true);
    this.setAlpha(1);

    // Entrance animation
    this.scene.cameras.main.shake(600, 0.01);
    this.effects.flashCamera(0xff0000, 150);
    AudioSystem.playBossHit();

    // Flash in
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

    // Check phase transition
    if (this.phase === 'phase1' && this.hp / this.bossData.hp < this.PHASE2_HP_RATIO) {
      this.enterPhase2();
    }

    // AI behavior
    if (this.attackTimer <= 0 && this.attackCooldown <= 0) {
      this.performAttack();
      this.attackTimer = this.phase === 'phase2' ? 1800 : 2400;
      this.attackCooldown = 600;
    }

    // Move toward player
    if (this.playerRef && this.phase !== 'hurt') {
      this.moveTowardPlayer(delta);
    }

    // Update HP bar and name position
    this.healthBar.update(this.hp, this.bossData.hp);
    this.healthBar.setPosition(
      this.x - this.bossData.width * 0.7,
      this.y - this.bossData.height * this.scaleY - 30
    );
    this.nameText.setPosition(this.x, this.y - this.bossData.height * this.scaleY - 50);

    // Update texture
    this.updateTexture();
  }

  private moveTowardPlayer(delta: number): void {
    if (!this.playerRef) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const dx = this.playerRef.x - this.x;
    const speed = this.bossData.speed * (this.phase === 'phase2' ? 1.4 : 1);

    // Float toward player (horizontal only for ground bosses)
    if (this.bossData.type === 'algorithmicGatekeeper') {
      const dy = this.playerRef.y - this.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 80) {
        body.setVelocityX((dx / len) * speed);
        body.setVelocityY((dy / len) * speed * 0.5);
      } else {
        body.setVelocity(0, 0);
      }
    } else {
      if (Math.abs(dx) > 60) {
        body.setVelocityX(dx > 0 ? speed : -speed);
      } else {
        body.setVelocityX(0);
      }
      this.setFlipX(dx < 0);
    }
  }

  private performAttack(): void {
    if (!this.playerRef || this.isDefeated) return;
    this.currentAttack = (this.currentAttack + 1) % 3;

    switch (this.bossData.type) {
      case 'accessDenier':
        this.accessDenierAttack();
        break;
      case 'algorithmicGatekeeper':
        this.gateKeeperAttack();
        break;
      case 'blackoutWarden':
        this.wardenAttack();
        break;
    }
  }

  private accessDenierAttack(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.currentAttack === 0) {
      // Charge attack
      const dir = this.playerRef!.x > this.x ? 1 : -1;
      body.setVelocityX(dir * 350);
      this.setTexture(`${this.bossData.type}_attack1`);
      this.scene.time.delayedCall(500, () => { if (!this.isDefeated) body.setVelocityX(0); });
    } else if (this.currentAttack === 1) {
      // Shoot barricade bolts
      this.shootSpread(3, 220);
    } else {
      // Stomp
      body.setVelocityY(-400);
      this.setTexture(`${this.bossData.type}_attack2`);
      AudioSystem.playBossHit();
      this.effects.shakeCamera(0.015, 400);
    }
  }

  private gateKeeperAttack(): void {
    if (this.currentAttack === 0) {
      // Rotating lock beams - shoot radial burst
      this.shootSpread(6, 200);
    } else if (this.currentAttack === 1) {
      // Beam attack toward player
      if (this.playerRef && this.projectileGroup) {
        const dx = this.playerRef.x - this.x;
        const dy = this.playerRef.y - this.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        // Rapid 3-shot burst
        for (let i = 0; i < 3; i++) {
          this.scene.time.delayedCall(i * 120, () => {
            if (this.isDefeated || !this.projectileGroup) return;
            const proj = new Projectile(this.scene, this.x, this.y, 'proj_enemy', this.bossData.damage, false);
            proj.launch((dx / len) * 300, (dy / len) * 300);
            this.projectileGroup.add(proj);
          });
        }
      }
    } else {
      // Code ring - expand ring of projectiles
      this.shootSpread(8, 180);
      this.effects.spawnRingPulse(this.x, this.y, 0x00FF88, 120);
    }
  }

  private wardenAttack(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.currentAttack === 0) {
      // Hammer slam
      body.setVelocityY(-500);
      this.setTexture(`${this.bossData.type}_attack2`);
      this.scene.time.delayedCall(600, () => {
        if (!this.isDefeated) {
          this.effects.shakeCamera(0.02, 500);
          AudioSystem.playBossHit();
          this.shootSpread(4, 160);
        }
      });
    } else if (this.currentAttack === 1) {
      // Blackout pulse
      this.effects.flashCamera(0x000000, 400);
      this.effects.shakeCamera(0.01, 300);
      this.shootSpread(5, 200);
    } else {
      // Charge
      const dir = this.playerRef!.x > this.x ? 1 : -1;
      body.setVelocityX(dir * 400);
      this.setTexture(`${this.bossData.type}_attack1`);
      this.scene.time.delayedCall(600, () => { if (!this.isDefeated) body.setVelocityX(0); });
    }
  }

  private shootSpread(count: number, speed: number): void {
    if (!this.projectileGroup) return;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const proj = new Projectile(this.scene, this.x, this.y, 'proj_enemy', this.bossData.damage, false);
      proj.launch(Math.cos(angle) * speed, Math.sin(angle) * speed);
      this.projectileGroup.add(proj);
    }
  }

  private enterPhase2(): void {
    this.phase = 'phase2';
    this.effects.flashCamera(this.bossData.accentColor, 300);
    this.effects.shakeCamera(0.015, 600);
    AudioSystem.playBossHit();

    // Visual pulse
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

  /** Take damage, return true if defeated */
  takeDamage(amount: number): boolean {
    if (this.isDefeated) return false;
    this.hp -= amount;

    // Flash
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (!this.isDefeated) this.clearTint();
    });

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

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setEnable(false);
    body.setVelocity(0, 0);

    this.healthBar.setVisible(false);
    this.nameText.setVisible(false);

    // Dramatic defeat sequence
    this.effects.shakeCamera(0.02, 1000);
    this.effects.flashCamera(0xffffff, 200);
    AudioSystem.playVictory();

    // Explode particles
    for (let i = 0; i < 12; i++) {
      this.scene.time.delayedCall(i * 80, () => {
        this.effects.spawnHitParticles(
          this.x + Phaser.Math.Between(-40, 40),
          this.y + Phaser.Math.Between(-40, 40),
          this.bossData.accentColor,
          8
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

  private updateTexture(): void {
    if (this.isDefeated) return;
    const key = `${this.bossData.type}_${this.phase === 'hurt' ? 'hurt' : 'idle'}`;
    if (this.scene.textures.exists(key)) {
      this.setTexture(key);
    }
  }

  destroy(fromScene?: boolean): void {
    if (this.healthBar) {
      try { this.healthBar.destroy(); } catch {}
    }
    if (this.nameText) {
      try { this.nameText.destroy(); } catch {}
    }
    super.destroy(fromScene);
  }
}
