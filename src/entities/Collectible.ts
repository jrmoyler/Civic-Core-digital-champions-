// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Collectible Entity
// Uses real sprite sheets (base + sparkle frames) when available,
// falls back to procedural TextureFactory sprites.
// ============================================================

import Phaser from 'phaser';
import type { CollectibleType } from '../game/types';
import { DEPTH } from '../game/constants';

// Collectible type → spritesheet file key
const SPRITE_KEY_MAP: Partial<Record<CollectibleType, string>> = {
  accessToken:       'coll_token',
  healthPack:        'coll_health_pack',
  aiLiteracyScroll:  'coll_ai_scroll',
  patchBattery:      'coll_patch_battery',
  signalShield:      'coll_signal_shield',
  empowermentShard:  'coll_empowerment_shard',
  extraLife:         'coll_extra_life',
  hiddenLorePage:    'coll_hidden_lore',
  challengeRoomKey:  'coll_challenge_key',
};

// Fallback procedural texture keys (from TextureFactory)
const FALLBACK_MAP: Record<CollectibleType, string> = {
  accessToken:       'token_idle',
  healthPack:        'healthPack_idle',
  aiLiteracyScroll:  'aiLiteracyScroll_idle',
  patchBattery:      'patchBattery_idle',
  signalShield:      'signalShield_idle',
  empowermentShard:  'empowermentShard_idle',
  extraLife:         'extraLife_idle',
  hiddenLorePage:    'hiddenLorePage_idle',
  challengeRoomKey:  'challengeRoomKey_idle',
};

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  public readonly collectibleType: CollectibleType;
  public collected: boolean = false;
  private bobTimer: number = 0;
  private baseY: number;
  private usesRealSprite: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, type: CollectibleType) {
    const spriteKey = SPRITE_KEY_MAP[type];
    const fallbackKey = FALLBACK_MAP[type] ?? 'token_idle';
    const useReal = !!spriteKey && scene.textures.exists(spriteKey);
    const key = useReal ? spriteKey! : fallbackKey;

    super(scene, x, y, key, 0);
    this.collectibleType = type;
    this.baseY = y;
    this.usesRealSprite = useReal;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.COLLECTIBLES);
    // Scale down the large spritesheet frames to a gameplay-appropriate size
    if (useReal) {
      this.setScale(0.35); // 128px → ~45px visual size
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    // Collision body is independent of display scale
    body.setSize(32, 32);

    // Play sparkle animation if available
    if (useReal) {
      const animKey = spriteKey!;
      if (scene.anims.exists(animKey)) {
        this.anims.play(animKey, true);
      }
    } else if (type === 'accessToken') {
      // Legacy procedural token shimmer
      scene.time.addEvent({
        delay: 400,
        loop: true,
        callback: () => {
          if (this.active) {
            const alt = this.texture.key === 'token_idle' ? 'token_shine' : 'token_idle';
            if (scene.textures.exists(alt)) this.setTexture(alt);
          }
        },
      });
    }
  }

  update(delta: number): void {
    if (this.collected) return;
    // Gentle bob
    this.bobTimer += delta;
    this.y = this.baseY + Math.sin(this.bobTimer / 400) * 4;
  }

  collect(): void {
    if (this.collected) return;
    this.collected = true;

    this.scene.tweens.add({
      targets: this,
      scaleX: this.usesRealSprite ? 0.6 : 1.8,
      scaleY: this.usesRealSprite ? 0.6 : 1.8,
      alpha: 0,
      duration: 250,
      ease: 'Power2',
      onComplete: () => this.destroy(),
    });
  }
}
