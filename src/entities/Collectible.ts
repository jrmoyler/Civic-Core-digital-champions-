// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Collectible Entity
// Physics: Matter.js sensor (overlap detection, no physics response)
// ============================================================

import Phaser from 'phaser';
import type { CollectibleType } from '../game/types';
import { DEPTH, COLLISION_CATEGORIES } from '../game/constants';

const SPRITE_KEY_MAP: Partial<Record<CollectibleType, string>> = {
  accessToken:      'coll_token',
  healthPack:       'coll_health_pack',
  aiLiteracyScroll: 'coll_ai_scroll',
  patchBattery:     'coll_patch_battery',
  signalShield:     'coll_signal_shield',
  empowermentShard: 'coll_empowerment_shard',
  extraLife:        'coll_extra_life',
  hiddenLorePage:   'coll_hidden_lore',
  challengeRoomKey: 'coll_challenge_key',
};

const FALLBACK_MAP: Record<CollectibleType, string> = {
  accessToken:      'token_idle',
  healthPack:       'healthPack_idle',
  aiLiteracyScroll: 'aiLiteracyScroll_idle',
  patchBattery:     'patchBattery_idle',
  signalShield:     'signalShield_idle',
  empowermentShard: 'empowermentShard_idle',
  extraLife:        'extraLife_idle',
  hiddenLorePage:   'hiddenLorePage_idle',
  challengeRoomKey: 'challengeRoomKey_idle',
};

export class Collectible extends Phaser.Physics.Matter.Sprite {
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

    super(scene.matter.world, x, y, key, 0, {
      label: 'collectible',
      isSensor: true,
      isStatic: true,
      collisionFilter: {
        category: COLLISION_CATEGORIES.COLLECTIBLE,
        mask: COLLISION_CATEGORIES.PLAYER,
      },
    });

    this.collectibleType = type;
    this.baseY = y;
    this.usesRealSprite = useReal;

    scene.add.existing(this);
    this.setDepth(DEPTH.COLLECTIBLES);

    if (useReal) this.setScale(0.35);

    // Glow on collectibles (WebGL only)
    if (scene.game.renderer.type === Phaser.WEBGL) {
      this.postFX.addGlow(0xffd700, 2, 0, false, 0.1, 8);
    }

    if (useReal) {
      const animKey = spriteKey!;
      if (scene.anims.exists(animKey)) this.anims.play(animKey, true);
    } else if (type === 'accessToken') {
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
