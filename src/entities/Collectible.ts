// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Collectible Entity
// ============================================================

import Phaser from 'phaser';
import type { CollectibleType } from '../game/types';
import { DEPTH } from '../game/constants';

const TEXTURE_MAP: Record<CollectibleType, string> = {
  accessToken: 'token_idle',
  healthPack: 'healthPack_idle',
  aiLiteracyScroll: 'aiLiteracyScroll_idle',
  patchBattery: 'patchBattery_idle',
  signalShield: 'signalShield_idle',
  empowermentShard: 'empowermentShard_idle',
  extraLife: 'extraLife_idle',
  hiddenLorePage: 'hiddenLorePage_idle',
  challengeRoomKey: 'challengeRoomKey_idle',
};

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  public readonly collectibleType: CollectibleType;
  public collected: boolean = false;
  private bobTimer: number = 0;
  private baseY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: CollectibleType) {
    const key = TEXTURE_MAP[type] ?? 'token_idle';
    super(scene, x, y, key);
    this.collectibleType = type;
    this.baseY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.COLLECTIBLES);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);

    // Animated tokens: alternate textures
    if (type === 'accessToken') {
      this.scene.time.addEvent({
        delay: 400,
        loop: true,
        callback: () => {
          if (this.active) {
            const alt = this.texture.key === 'token_idle' ? 'token_shine' : 'token_idle';
            if (this.scene.textures.exists(alt)) this.setTexture(alt);
          }
        },
      });
    }
  }

  update(delta: number): void {
    if (this.collected) return;

    // Bob animation
    this.bobTimer += delta;
    this.y = this.baseY + Math.sin(this.bobTimer / 400) * 4;
  }

  collect(): void {
    if (this.collected) return;
    this.collected = true;

    // Collect animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 250,
      ease: 'Power2',
      onComplete: () => this.destroy(),
    });
  }
}
