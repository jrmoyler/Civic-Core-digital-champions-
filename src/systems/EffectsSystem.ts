// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Effects System
// Particles, screen shake, damage text, flashes.
// ============================================================

import Phaser from 'phaser';
import { COLORS, DEPTH } from '../game/constants';

export class EffectsSystem {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Floating damage number */
  spawnDamageText(x: number, y: number, amount: number, type: 'normal' | 'crit' | 'ability' = 'normal'): void {
    const colors: Record<string, string> = {
      normal: '#ffffff',
      crit: '#ffd700',
      ability: '#4ac8ff',
    };
    const prefixes: Record<string, string> = {
      normal: '',
      crit: '★ ',
      ability: '⬡ ',
    };
    const sizes: Record<string, number> = {
      normal: 16,
      crit: 20,
      ability: 18,
    };

    const text = this.scene.add.text(x, y, `${prefixes[type]}${amount}`, {
      fontSize: `${sizes[type]}px`,
      color: colors[type],
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    });
    text.setOrigin(0.5, 0.5);
    text.setDepth(DEPTH.EFFECTS + 5);

    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 900,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  /** Camera shake */
  shakeCamera(intensity: number = 0.005, duration: number = 150): void {
    this.scene.cameras.main.shake(duration, intensity);
  }

  /** Flash the camera briefly */
  flashCamera(color: number = 0xffffff, duration: number = 80): void {
    this.scene.cameras.main.flash(duration, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff, true);
  }

  /** Spawn spark particles at location */
  spawnHitParticles(x: number, y: number, color: number = 0xffffff, count: number = 6): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 60 + Math.random() * 80;
      const g = this.scene.add.graphics();
      const c = color;
      g.fillStyle(c, 1);
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

  /** Ring pulse effect */
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

  /** Collect sparkle */
  spawnCollectEffect(x: number, y: number, color: number = COLORS.TOKEN_COLOR): void {
    this.spawnHitParticles(x, y, color, 8);
    this.spawnRingPulse(x, y, color, 30);
  }

  /** Ability pulse */
  spawnAbilityEffect(x: number, y: number, color: number, range: number = 100): void {
    this.spawnRingPulse(x, y, color, range);
    this.spawnHitParticles(x, y, color, 12);
    this.shakeCamera(0.008, 250);
  }

  /** Banner text in center screen */
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

    // Animate
    banner.setAlpha(0);
    banner.setScale(0.8);
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

  /** White flash on a sprite to indicate hit */
  hitFlash(gameObject: Phaser.GameObjects.Components.Tint & Phaser.GameObjects.Components.Alpha): void {
    (gameObject as unknown as Phaser.GameObjects.Sprite).setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => {
      (gameObject as unknown as Phaser.GameObjects.Sprite).clearTint();
    });
  }

  /** Invulnerability flicker */
  startInvulnFlicker(sprite: Phaser.GameObjects.Sprite, duration: number): void {
    const timer = this.scene.time.addEvent({
      delay: 100,
      repeat: Math.floor(duration / 100),
      callback: () => {
        sprite.setAlpha(sprite.alpha > 0.5 ? 0.2 : 1);
      },
    });
    this.scene.time.delayedCall(duration, () => {
      timer.destroy();
      sprite.setAlpha(1);
    });
  }
}
