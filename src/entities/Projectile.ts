// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Projectile Entity
// Physics: Phaser.Physics.Matter.Sprite sensor (no physics response, overlap only)
// ============================================================

import Phaser from 'phaser';
import { DEPTH, COLLISION_CATEGORIES } from '../game/constants';

export class Projectile extends Phaser.Physics.Matter.Sprite {
  public damage: number;
  public isPlayerOwned: boolean;
  private lifetime: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    damage: number,
    isPlayerOwned: boolean,
  ) {
    super(scene.matter.world, x, y, textureKey);
    this.damage = damage;
    this.isPlayerOwned = isPlayerOwned;
    this.lifetime = 2500;

    scene.add.existing(this);
    this.setDepth(DEPTH.PROJECTILES);

    // Projectiles are sensors: they detect overlaps without applying physics forces
    const category = isPlayerOwned ? COLLISION_CATEGORIES.PLAYER_PROJ : COLLISION_CATEGORIES.ENEMY_PROJ;
    const mask = isPlayerOwned
      ? (COLLISION_CATEGORIES.ENEMY | COLLISION_CATEGORIES.BOSS)
      : COLLISION_CATEGORIES.PLAYER;

    this.setRectangle(12, 12, {
      label: isPlayerOwned ? 'playerProjectile' : 'enemyProjectile',
      isSensor: true,
      frictionAir: 0,
      collisionFilter: { category, mask },
    });

    // Add WebGL bloom glow on player projectiles
    if (isPlayerOwned && scene.game.renderer.type === Phaser.WEBGL) {
      this.postFX.addGlow(0x4ac8ff, 3, 0, false, 0.1, 8);
    }

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

    // Destroy when well off-camera bounds
    const cam = this.scene.cameras.main;
    if (
      this.x < cam.scrollX - 200 ||
      this.x > cam.scrollX + cam.width + 200
    ) {
      this.destroy();
    }
  }
}
