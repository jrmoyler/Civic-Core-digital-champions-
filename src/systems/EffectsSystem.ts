// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Effects System
// Particles, screen shake, damage text (pooled), flashes.
// WebGL: Phaser FX pipeline for bloom, vignette, glow, chroma.
// ============================================================

import Phaser from 'phaser';
import { COLORS, DEPTH } from '../game/constants';
import { ObjectPool } from './ObjectPool';

// ── Damage text pool item ─────────────────────────────────────
interface DmgTextItem {
  text: Phaser.GameObjects.Text;
  tween: Phaser.Tweens.Tween | null;
  inUse: boolean;
}

export class EffectsSystem {
  private scene: Phaser.Scene;

  /** Pool for floating damage numbers — avoids GC churn */
  private dmgTextPool!: ObjectPool<DmgTextItem>;
  private chromaFxActive: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initDamageTextPool();
  }

  private initDamageTextPool(): void {
    this.dmgTextPool = new ObjectPool<DmgTextItem>(
      // Factory — create off-screen, invisible
      () => {
        const text = this.scene.add.text(-9999, -9999, '', {
          fontSize: '16px',
          color: '#ffffff',
          fontFamily: 'monospace',
          stroke: '#000000',
          strokeThickness: 3,
        });
        text.setOrigin(0.5, 0.5);
        text.setDepth(DEPTH.EFFECTS + 5);
        text.setVisible(false);
        return { text, tween: null, inUse: false };
      },
      // onAcquire — make visible
      (item) => { item.inUse = true; item.text.setVisible(true); },
      // onRelease — hide and move off screen
      (item) => {
        item.inUse = false;
        item.text.setVisible(false);
        item.text.setPosition(-9999, -9999);
        item.text.setAlpha(1);
        item.text.setScale(1);
        if (item.tween) { item.tween.stop(); item.tween = null; }
      },
      20, // pre-warm 20 text objects
    );
  }

  // ── Floating damage number ────────────────────────────────────
  spawnDamageText(
    x: number,
    y: number,
    amount: number,
    type: 'normal' | 'crit' | 'ability' = 'normal',
  ): void {
    const colors   = { normal: '#ffffff', crit: '#ffd700', ability: '#4ac8ff' } as const;
    const prefixes = { normal: '',        crit: '★ ',      ability: '⬡ '      } as const;
    const sizes    = { normal: 16,        crit: 20,         ability: 18        } as const;

    const item = this.dmgTextPool.acquire();
    item.text.setPosition(x, y);
    item.text.setFontSize(sizes[type]);
    item.text.setColor(colors[type]);
    item.text.setText(`${prefixes[type]}${amount}`);
    item.text.setAlpha(1);

    // Animate upward then release back to pool
    item.tween = this.scene.tweens.add({
      targets: item.text,
      y: y - 60,
      alpha: 0,
      duration: 900,
      ease: 'Power2',
      onComplete: () => {
        if (item.inUse) this.dmgTextPool.release(item);
      },
    });
  }

  // ── Camera shake ──────────────────────────────────────────────
  shakeCamera(intensity: number = 0.005, duration: number = 150): void {
    this.scene.cameras.main.shake(duration, intensity);
  }

  // ── Camera flash ──────────────────────────────────────────────
  flashCamera(color: number = 0xffffff, duration: number = 80): void {
    this.scene.cameras.main.flash(
      duration,
      (color >> 16) & 0xff,
      (color >> 8) & 0xff,
      color & 0xff,
      true,
    );
  }

  // ── Chromatic aberration on damage (WebGL FX) ─────────────────
  triggerDamageFX(duration: number = 180): void {
    if (!this.isWebGL() || this.chromaFxActive) return;
    this.chromaFxActive = true;
    const cam = this.scene.cameras.main;
    // Barrel distortion + quick shake
    const barrel = cam.postFX?.addBarrel(0.04);
    this.shakeCamera(0.008, duration);
    this.scene.time.delayedCall(duration, () => {
      if (barrel) cam.postFX?.remove(barrel);
      this.chromaFxActive = false;
    });
  }

  // ── Hit particle sparks ───────────────────────────────────────
  spawnHitParticles(x: number, y: number, color: number = 0xffffff, count: number = 6): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 60 + Math.random() * 80;
      const g = this.scene.add.graphics();
      g.fillStyle(color, 1);
      g.fillCircle(0, 0, 3 + Math.random() * 2);
      g.x = x;
      g.y = y;
      g.setDepth(DEPTH.EFFECTS);

      this.scene.tweens.add({
        targets: g,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        duration: 300 + Math.random() * 200,
        onComplete: () => g.destroy(),
      });
    }
  }

  // ── Ring pulse ────────────────────────────────────────────────
  spawnRingPulse(x: number, y: number, color: number, radius: number = 40): void {
    const g = this.scene.add.graphics();
    g.lineStyle(3, color, 1);
    g.strokeCircle(0, 0, 10);
    g.x = x;
    g.y = y;
    g.setDepth(DEPTH.EFFECTS);

    this.scene.tweens.add({
      targets: g,
      scaleX: radius / 10,
      scaleY: radius / 10,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => g.destroy(),
    });
  }

  // ── Collect sparkle ───────────────────────────────────────────
  spawnCollectEffect(x: number, y: number, color: number = COLORS.TOKEN_COLOR): void {
    this.spawnHitParticles(x, y, color, 8);
    this.spawnRingPulse(x, y, color, 30);
  }

  // ── Ability pulse ─────────────────────────────────────────────
  spawnAbilityEffect(x: number, y: number, color: number, range: number = 100): void {
    this.spawnRingPulse(x, y, color, range);
    this.spawnHitParticles(x, y, color, 12);
    this.shakeCamera(0.008, 250);

    // Bloom burst on the ability origin (WebGL only)
    if (this.isWebGL()) {
      const cam = this.scene.cameras.main;
      const bloom = cam.postFX?.addBloom(0.5, 1, 1, 1.5);
      this.scene.time.delayedCall(350, () => {
        if (bloom) cam.postFX?.remove(bloom);
      });
    }
  }

  // ── Banner text ───────────────────────────────────────────────
  spawnBanner(text: string, color: string = '#00ffcc', duration: number = 2200): void {
    const cam = this.scene.cameras.main;
    const bx = cam.scrollX + cam.width / 2;
    const by = cam.scrollY + cam.height * 0.3;

    const banner = this.scene.add.text(bx, by, text, {
      fontSize: '26px',
      color,
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    });
    banner.setOrigin(0.5, 0.5);
    banner.setDepth(DEPTH.OVERLAY);
    banner.setScrollFactor(0);
    banner.setAlpha(0);
    banner.setScale(0.8);

    // Add glow on banners (WebGL only)
    if (this.isWebGL()) {
      const hexColor = parseInt(color.replace('#', ''), 16);
      banner.postFX.addGlow(hexColor, 4, 0, false, 0.1, 8);
    }

    this.scene.tweens.add({
      targets: banner,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back',
      onComplete: () => {
        this.scene.time.delayedCall(duration - 600, () => {
          this.scene.tweens.add({
            targets: banner,
            alpha: 0,
            y: by - 30,
            duration: 400,
            onComplete: () => banner.destroy(),
          });
        });
      },
    });
  }

  // ── Sprite hit flash ──────────────────────────────────────────
  hitFlash(gameObject: Phaser.GameObjects.Components.Tint & Phaser.GameObjects.Components.Alpha): void {
    (gameObject as unknown as Phaser.GameObjects.Sprite).setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => {
      (gameObject as unknown as Phaser.GameObjects.Sprite).clearTint();
    });
  }

  // ── Invuln flicker ────────────────────────────────────────────
  startInvulnFlicker(sprite: Phaser.GameObjects.Sprite, duration: number): void {
    const timer = this.scene.time.addEvent({
      delay: 100,
      repeat: Math.floor(duration / 100),
      callback: () => { sprite.setAlpha(sprite.alpha > 0.5 ? 0.2 : 1); },
    });
    this.scene.time.delayedCall(duration, () => {
      timer.destroy();
      sprite.setAlpha(1);
    });
  }

  // ── Add glow FX to a sprite (WebGL only) ─────────────────────
  addGlowFX(
    sprite: Phaser.GameObjects.Sprite,
    color: number = 0xffffff,
    strength: number = 4,
  ): void {
    if (!this.isWebGL()) return;
    sprite.postFX.addGlow(color, strength, 0, false, 0.1, 16);
  }

  // ── Persistent camera vignette (call once in LevelScene) ─────
  setupLevelCameraFX(camera: Phaser.Cameras.Scene2D.Camera): void {
    if (!this.isWebGL()) return;
    camera.postFX.addVignette(0.5, 0.5, 0.28, 0.65);
  }

  private isWebGL(): boolean {
    return this.scene.game.renderer.type === Phaser.WEBGL;
  }
}
