// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Exit Beacon Entity
// Physics: Matter.js static sensor
// ============================================================

import Phaser from 'phaser';
import { DEPTH, COLLISION_CATEGORIES } from '../game/constants';

export class ExitBeacon extends Phaser.Physics.Matter.Sprite {
  public active_beacon: boolean = false;
  private pulseTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'exitBeacon_idle', 0, {
      label: 'exitBeacon',
      isSensor: true,
      isStatic: true,
      collisionFilter: {
        category: COLLISION_CATEGORIES.COLLECTIBLE,
        mask: COLLISION_CATEGORIES.PLAYER,
      },
    });

    scene.add.existing(this);
    this.setDepth(DEPTH.COLLECTIBLES + 2);
  }

  activateBeacon(): void {
    this.active_beacon = true;

    if (this.scene.textures.exists('exitBeacon_active')) {
      this.setTexture('exitBeacon_active');
    }

    // Phaser FX persistent glow (WebGL only)
    if (this.scene.game.renderer.type === Phaser.WEBGL) {
      this.postFX.addGlow(0xffffaa, 6, 0, false, 0.1, 16);
    }

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
