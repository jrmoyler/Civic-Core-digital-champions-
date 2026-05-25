// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Checkpoint Entity
// ============================================================

import Phaser from 'phaser';
import { DEPTH } from '../game/constants';

export class Checkpoint extends Phaser.Physics.Arcade.Sprite {
  public activated: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'checkpoint_idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.COLLECTIBLES + 1);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(30, 72);
  }

  activate(): void {
    if (this.activated) return;
    this.activated = true;

    if (this.scene.textures.exists('checkpoint_active')) {
      this.setTexture('checkpoint_active');
    }

    // Glow pulse
    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 1, to: 1.15, yoyo: true },
      scaleY: { from: 1, to: 1.15, yoyo: true },
      duration: 300,
      repeat: 2,
    });
  }
}
