// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Exit Beacon Entity
// ============================================================

import Phaser from 'phaser';
import { DEPTH } from '../game/constants';

export class ExitBeacon extends Phaser.Physics.Arcade.Sprite {
  public active_beacon: boolean = false;
  private pulseTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'exitBeacon_idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.COLLECTIBLES + 2);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(36, 82);
  }

  activateBeacon(): void {
    this.active_beacon = true;
    if (this.scene.textures.exists('exitBeacon_active')) {
      this.setTexture('exitBeacon_active');
    }

    // Pulsing glow animation
    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 1, to: 1.1, yoyo: true },
      scaleY: { from: 1, to: 1.1, yoyo: true },
      alpha: { from: 1, to: 0.8, yoyo: true },
      duration: 600,
      repeat: -1,
    });
  }

  update(delta: number): void {
    this.pulseTimer += delta;
  }
}
