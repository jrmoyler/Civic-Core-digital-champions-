// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Projectile Entity
// ============================================================

import Phaser from 'phaser';
import { DEPTH } from '../game/constants';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public damage: number;
  public isPlayerOwned: boolean;
  private lifetime: number;

  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string, damage: number, isPlayerOwned: boolean) {
    super(scene, x, y, textureKey);
    this.damage = damage;
    this.isPlayerOwned = isPlayerOwned;
    this.lifetime = 2500;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.PROJECTILES);

    // Auto-destroy after lifetime
    scene.time.delayedCall(this.lifetime, () => {
      if (this.active) this.destroy();
    });
  }

  launch(velX: number, velY: number = 0): void {
    this.setVelocity(velX, velY);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    // Destroy when off-camera bounds
    if (
      this.x < this.scene.cameras.main.scrollX - 200 ||
      this.x > this.scene.cameras.main.scrollX + this.scene.cameras.main.width + 200
    ) {
      this.destroy();
    }
  }
}
