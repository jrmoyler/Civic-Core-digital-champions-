// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Checkpoint Entity
// Physics: Matter.js static sensor
// ============================================================

import Phaser from 'phaser';
import { DEPTH, COLLISION_CATEGORIES } from '../game/constants';

export class Checkpoint extends Phaser.Physics.Matter.Sprite {
  public activated: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'checkpoint_idle', 0, {
      label: 'checkpoint',
      isSensor: true,
      isStatic: true,
      collisionFilter: {
        category: COLLISION_CATEGORIES.COLLECTIBLE,
        mask: COLLISION_CATEGORIES.PLAYER,
      },
    });

    scene.add.existing(this);
    this.setDepth(DEPTH.COLLECTIBLES + 1);
  }

  activate(): void {
    if (this.activated) return;
    this.activated = true;

    if (this.scene.textures.exists('checkpoint_active')) {
      this.setTexture('checkpoint_active');
    }

    // Phaser FX glow burst (WebGL only)
    if (this.scene.game.renderer.type === Phaser.WEBGL) {
      const glow = this.postFX.addGlow(0x00ffff, 8, 0, false, 0.1, 16);
      this.scene.time.delayedCall(600, () => this.postFX.remove(glow));
    }

    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 1, to: 1.15, yoyo: true },
      scaleY: { from: 1, to: 1.15, yoyo: true },
      duration: 300,
      repeat: 2,
    });
  }
}
