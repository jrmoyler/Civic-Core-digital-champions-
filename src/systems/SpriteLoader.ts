// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Sprite Loader System
// Loads all hero, enemy, and boss spritesheets and creates
// Phaser animations for each entity type.
// ============================================================

import Phaser from 'phaser';

// ── Hero configuration ──────────────────────────────────────

const HERO_IDS = ['communityCreator', 'civicCoder', 'digitalEquityAdvocate'] as const;
type HeroId = typeof HERO_IDS[number];

// Maps hero ID (camelCase) → sprite file prefix (snake_case)
const HERO_FILE_PREFIX: Record<HeroId, string> = {
  communityCreator:       'creator',
  civicCoder:             'coder',
  digitalEquityAdvocate:  'advocate',
};

interface HeroAnimDef {
  suffix: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameRate: number;
  repeat: number;
}

const HERO_ANIMS: HeroAnimDef[] = [
  { suffix: 'idle',    frameWidth: 104, frameHeight: 120, frameCount: 4, frameRate: 8,  repeat: -1 },
  { suffix: 'run',     frameWidth:  69, frameHeight:  88, frameCount: 6, frameRate: 12, repeat: -1 },
  { suffix: 'jump',    frameWidth: 208, frameHeight:  89, frameCount: 2, frameRate: 8,  repeat: -1 },
  { suffix: 'attack',  frameWidth: 104, frameHeight:  90, frameCount: 4, frameRate: 14, repeat:  0 },
  { suffix: 'ability', frameWidth: 104, frameHeight:  96, frameCount: 4, frameRate: 10, repeat:  0 },
  { suffix: 'hurt',    frameWidth: 208, frameHeight:  79, frameCount: 2, frameRate: 10, repeat:  0 },
];

// ── Enemy configuration ─────────────────────────────────────

const ENEMY_TYPES = [
  'drone', 'leech', 'bruiser', 'wisp',
  'gatekeeper', 'saboteur', 'turret', 'spike_trap',
] as const;

interface EnemyAnimDef {
  suffix: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameRate: number;
  repeat: number;
}

const ENEMY_ANIMS: EnemyAnimDef[] = [
  { suffix: 'idle',    frameWidth: 81, frameHeight: 44, frameCount: 2, frameRate:  6, repeat: -1 },
  { suffix: 'move',    frameWidth: 81, frameHeight: 46, frameCount: 4, frameRate: 10, repeat: -1 },
  { suffix: 'attack',  frameWidth: 81, frameHeight: 46, frameCount: 4, frameRate: 12, repeat:  0 },
  { suffix: 'hurt',    frameWidth: 81, frameHeight: 42, frameCount: 2, frameRate: 10, repeat:  0 },
  { suffix: 'defeat',  frameWidth: 81, frameHeight: 43, frameCount: 2, frameRate:  8, repeat:  0 },
];

// ── Boss configuration ──────────────────────────────────────

interface BossEntry {
  id: string;          // animation key prefix (camelCase)
  filePrefix: string;  // spritesheet filename prefix (snake_case)
}

const BOSSES: BossEntry[] = [
  { id: 'accessDenier',          filePrefix: 'access_denier' },
  { id: 'algorithmicGatekeeper', filePrefix: 'algorithmic_gatekeeper' },
  { id: 'blackoutWarden',        filePrefix: 'blackout_warden' },
];

interface BossAnimDef {
  suffix: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameRate: number;
  repeat: number;
}

const BOSS_ANIMS: BossAnimDef[] = [
  { suffix: 'idle',    frameWidth:  96, frameHeight: 65, frameCount: 2, frameRate:  4, repeat: -1 },
  { suffix: 'move',    frameWidth: 100, frameHeight: 52, frameCount: 4, frameRate:  8, repeat: -1 },
  { suffix: 'attack',  frameWidth: 100, frameHeight: 52, frameCount: 4, frameRate: 10, repeat:  0 },
  { suffix: 'special', frameWidth: 200, frameHeight: 52, frameCount: 2, frameRate:  8, repeat:  0 },
  { suffix: 'hurt',    frameWidth: 100, frameHeight: 52, frameCount: 2, frameRate: 10, repeat:  0 },
];

// ── Collectible configuration ───────────────────────────────

const COLLECTIBLE_TYPES = [
  'token', 'token_stack', 'ai_scroll', 'creator_badge', 'patch_battery', 'beacon_ember',
  'health_pack', 'signal_shield', 'library_pass', 'community_key', 'broadband_chip', 'hidden_lore',
  'empowerment_shard', 'extra_life', 'checkpoint_orb', 'challenge_key',
] as const;

// ── SpriteLoader ────────────────────────────────────────────

export class SpriteLoader {
  /**
   * Queue all hero, enemy, and boss spritesheets for loading.
   * Call this inside your scene's preload() phase.
   */
  static preload(scene: Phaser.Scene): void {
    // Heroes — texture key uses camelCase id, file path uses short snake_case prefix
    for (const heroId of HERO_IDS) {
      const filePrefix = HERO_FILE_PREFIX[heroId];
      for (const anim of HERO_ANIMS) {
        const textureKey = `hero_${heroId}_${anim.suffix}`;
        const path = `assets/sprites/heroes/${filePrefix}_${anim.suffix}.png`;
        try {
          scene.load.spritesheet(textureKey, path, {
            frameWidth: anim.frameWidth,
            frameHeight: anim.frameHeight,
          });
        } catch (err) {
          console.warn(`[SpriteLoader] Failed to queue hero spritesheet: ${textureKey}`, err);
        }
      }
    }

    // Enemies
    for (const type of ENEMY_TYPES) {
      for (const anim of ENEMY_ANIMS) {
        const textureKey = `enemy_${type}_${anim.suffix}`;
        const path = `assets/sprites/enemies/${type}_${anim.suffix}.png`;
        try {
          scene.load.spritesheet(textureKey, path, {
            frameWidth: anim.frameWidth,
            frameHeight: anim.frameHeight,
          });
        } catch (err) {
          console.warn(`[SpriteLoader] Failed to queue enemy spritesheet: ${textureKey}`, err);
        }
      }
    }

    // Bosses
    for (const boss of BOSSES) {
      for (const anim of BOSS_ANIMS) {
        const textureKey = `boss_${boss.filePrefix}_${anim.suffix}`;
        const path = `assets/sprites/bosses/${boss.filePrefix}_${anim.suffix}.png`;
        try {
          scene.load.spritesheet(textureKey, path, {
            frameWidth: anim.frameWidth,
            frameHeight: anim.frameHeight,
          });
        } catch (err) {
          console.warn(`[SpriteLoader] Failed to queue boss spritesheet: ${textureKey}`, err);
        }
      }
    }

    // Collectibles (2 frames: base + sparkle, 128x110 each)
    for (const type of COLLECTIBLE_TYPES) {
      const textureKey = `coll_${type}`;
      const path = `assets/sprites/collectibles/${type}.png`;
      try {
        scene.load.spritesheet(textureKey, path, { frameWidth: 128, frameHeight: 110 });
      } catch (err) {
        console.warn(`[SpriteLoader] Failed to queue collectible: ${textureKey}`, err);
      }
    }
  }

  /**
   * Create all Phaser animations from the loaded spritesheets.
   * Call this inside your scene's create() phase, after textures are ready.
   */
  static createAnimations(scene: Phaser.Scene): void {
    // Heroes
    for (const heroId of HERO_IDS) {
      for (const anim of HERO_ANIMS) {
        const animKey = `${heroId}_${anim.suffix}`;
        const textureKey = `hero_${heroId}_${anim.suffix}`;
        try {
          if (!scene.anims.exists(animKey)) {
            scene.anims.create({
              key: animKey,
              frames: scene.anims.generateFrameNumbers(textureKey, {
                start: 0,
                end: anim.frameCount - 1,
              }),
              frameRate: anim.frameRate,
              repeat: anim.repeat,
            });
          }
        } catch (err) {
          console.warn(`[SpriteLoader] Failed to create hero animation: ${animKey}`, err);
        }
      }
    }

    // Enemies
    for (const type of ENEMY_TYPES) {
      for (const anim of ENEMY_ANIMS) {
        const animKey = `${type}_${anim.suffix}`;
        const textureKey = `enemy_${type}_${anim.suffix}`;
        try {
          if (!scene.anims.exists(animKey)) {
            scene.anims.create({
              key: animKey,
              frames: scene.anims.generateFrameNumbers(textureKey, {
                start: 0,
                end: anim.frameCount - 1,
              }),
              frameRate: anim.frameRate,
              repeat: anim.repeat,
            });
          }
        } catch (err) {
          console.warn(`[SpriteLoader] Failed to create enemy animation: ${animKey}`, err);
        }
      }
    }

    // Bosses — animation key uses camelCase id, texture key uses snake_case filePrefix
    for (const boss of BOSSES) {
      for (const anim of BOSS_ANIMS) {
        const animKey = `${boss.id}_${anim.suffix}`;
        const textureKey = `boss_${boss.filePrefix}_${anim.suffix}`;
        try {
          if (!scene.anims.exists(animKey)) {
            scene.anims.create({
              key: animKey,
              frames: scene.anims.generateFrameNumbers(textureKey, {
                start: 0,
                end: anim.frameCount - 1,
              }),
              frameRate: anim.frameRate,
              repeat: anim.repeat,
            });
          }
        } catch (err) {
          console.warn(`[SpriteLoader] Failed to create boss animation: ${animKey}`, err);
        }
      }
    }

    // Collectibles
    for (const type of COLLECTIBLE_TYPES) {
      const animKey = `coll_${type}`;
      const textureKey = `coll_${type}`;
      try {
        if (!scene.anims.exists(animKey)) {
          scene.anims.create({
            key: animKey,
            frames: scene.anims.generateFrameNumbers(textureKey, { start: 0, end: 1 }),
            frameRate: 4,
            repeat: -1,
          });
        }
      } catch (err) {
        console.warn(`[SpriteLoader] Failed to create collectible animation: ${animKey}`, err);
      }
    }
  }
}
