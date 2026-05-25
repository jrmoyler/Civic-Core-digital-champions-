// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Texture Factory
// Generates all game sprites programmatically using Phaser
// Graphics, converted to textures. Called in PreloadScene.
// Colors match the visual reference sheets.
// ============================================================

import Phaser from 'phaser';
import { COLORS } from '../game/constants';

const SCALE = 1; // overall pixel scale multiplier

function px(n: number): number { return n * SCALE; }

export class TextureFactory {

  /**
   * Generate all game textures. Call once during Preload.
   * Each entity gets multiple frames for simple animation.
   */
  static generateAll(scene: Phaser.Scene): void {
    // Heroes
    TextureFactory.genHero(scene, 'creator', COLORS.CREATOR_PRIMARY, COLORS.CREATOR_SECONDARY);
    TextureFactory.genHero(scene, 'coder', COLORS.CODER_PRIMARY, COLORS.CODER_SECONDARY);
    TextureFactory.genHero(scene, 'advocate', COLORS.ADVOCATE_PRIMARY, COLORS.ADVOCATE_SECONDARY);

    // Enemies
    TextureFactory.genDrone(scene);
    TextureFactory.genLeech(scene);
    TextureFactory.genBruiser(scene);
    TextureFactory.genWisp(scene);
    TextureFactory.genGatekeeper(scene);
    TextureFactory.genSaboteur(scene);
    TextureFactory.genTurret(scene);

    // Bosses
    TextureFactory.genBoss(scene, 'accessDenier', COLORS.BOSS1_COLOR, 0xFF2222, 80, 88);
    TextureFactory.genBoss(scene, 'algorithmicGatekeeper', COLORS.BOSS2_COLOR, 0x00FF88, 80, 80);
    TextureFactory.genBoss(scene, 'blackoutWarden', COLORS.BOSS3_COLOR, 0xCC44FF, 88, 96);

    // Collectibles
    TextureFactory.genToken(scene);
    TextureFactory.genHealthPack(scene);
    TextureFactory.genScroll(scene);
    TextureFactory.genBattery(scene);
    TextureFactory.genShield(scene);
    TextureFactory.genShard(scene);
    TextureFactory.genExtraLife(scene);
    TextureFactory.genLorePage(scene);
    TextureFactory.genChallengeKey(scene);

    // Interactive objects
    TextureFactory.genCheckpoint(scene);
    TextureFactory.genExitBeacon(scene);

    // Projectiles
    TextureFactory.genProjectile(scene, 'proj_basic', 0x88CCFF, 6, 6);
    TextureFactory.genProjectile(scene, 'proj_enemy', 0xFF6644, 5, 5);
    TextureFactory.genProjectile(scene, 'proj_ability', 0x44FFCC, 8, 8);

    // Ability effects
    TextureFactory.genAbilityEffect(scene, 'creator', COLORS.CREATOR_PRIMARY);
    TextureFactory.genAbilityEffect(scene, 'coder', COLORS.CODER_PRIMARY);
    TextureFactory.genAbilityEffect(scene, 'advocate', COLORS.ADVOCATE_PRIMARY);
  }

  // ── Hero generation ────────────────────────────────────────
  private static genHero(scene: Phaser.Scene, id: string, primary: number, accent: number): void {
    const w = 40, h = 56;
    const frames = ['idle', 'run1', 'run2', 'jump', 'attack', 'ability', 'hurt'];
    frames.forEach(frame => {
      const key = `${id}_${frame}`;
      if (scene.textures.exists(key)) return;
      const g = scene.add.graphics();

      // Body
      g.fillStyle(primary, 1);
      g.fillRect(px(10), px(18), px(20), px(24)); // torso

      // Head
      g.fillStyle(0x8B5E3C, 1); // skin tone
      g.fillRect(px(12), px(4), px(16), px(14)); // head

      // Hair/hat
      g.fillStyle(primary, 1);
      g.fillRect(px(11), px(2), px(18), px(6));

      // Legs
      g.fillStyle(0x1A1A2E, 1);
      if (frame === 'run1') {
        g.fillRect(px(10), px(42), px(8), px(12));
        g.fillRect(px(22), px(46), px(8), px(8));
      } else if (frame === 'run2') {
        g.fillRect(px(10), px(46), px(8), px(8));
        g.fillRect(px(22), px(42), px(8), px(12));
      } else if (frame === 'jump') {
        g.fillRect(px(8), px(44), px(8), px(8));
        g.fillRect(px(24), px(44), px(8), px(8));
      } else {
        g.fillRect(px(10), px(42), px(8), px(14));
        g.fillRect(px(22), px(42), px(8), px(14));
      }

      // Arms
      g.fillStyle(primary, 1);
      if (frame === 'attack') {
        g.fillRect(px(30), px(20), px(10), px(6)); // extended arm
        // Weapon glow
        g.fillStyle(accent, 0.9);
        g.fillRect(px(34), px(18), px(12), px(8));
      } else if (frame === 'ability') {
        g.fillRect(px(2), px(18), px(10), px(6));
        g.fillRect(px(28), px(18), px(10), px(6));
        // Ability aura
        g.lineStyle(2, accent, 0.8);
        g.strokeCircle(px(20), px(30), px(22));
      } else if (frame === 'hurt') {
        g.fillRect(px(0), px(20), px(8), px(6));
        g.fillRect(px(32), px(20), px(8), px(6));
        g.fillStyle(0xFF4444, 0.5);
        g.fillRect(px(8), px(18), px(24), px(24));
      } else {
        g.fillRect(px(4), px(20), px(8), px(6));
        g.fillRect(px(28), px(20), px(8), px(6));
      }

      // Eyes
      g.fillStyle(0xFFFFFF, 1);
      g.fillRect(px(15), px(8), px(5), px(4));
      g.fillRect(px(21), px(8), px(5), px(4));
      g.fillStyle(0x000088, 1);
      g.fillRect(px(16), px(9), px(3), px(3));
      g.fillRect(px(22), px(9), px(3), px(3));

      // Accent detail (weapon/tool indicator)
      g.fillStyle(accent, 0.9);
      g.fillRect(px(12), px(24), px(4), px(10));

      g.generateTexture(key, w, h);
      g.destroy();
    });
  }

  // ── Drone enemy ───────────────────────────────────────────
  private static genDrone(scene: Phaser.Scene): void {
    ['idle', 'fly', 'attack', 'hurt', 'death'].forEach(frame => {
      const key = `drone_${frame}`;
      if (scene.textures.exists(key)) return;
      const g = scene.add.graphics();

      // Main body
      g.fillStyle(COLORS.DRONE_COLOR, 1);
      g.fillRect(px(6), px(8), px(24), px(16));

      // Antenna dish / sensor
      g.fillStyle(0xFF4444, 1);
      g.fillCircle(px(18), px(8), px(6));
      g.fillStyle(0xFFFFFF, 0.9);
      g.fillCircle(px(18), px(7), px(3));

      // Wing rotors
      g.fillStyle(0x2A4A6A, 1);
      g.fillRect(px(0), px(6), px(8), px(4));
      g.fillRect(px(28), px(6), px(8), px(4));

      if (frame === 'fly') {
        g.fillStyle(0x88AACC, 0.6);
        g.fillRect(px(0), px(5), px(10), px(2));
        g.fillRect(px(26), px(5), px(10), px(2));
      }

      if (frame === 'attack') {
        g.fillStyle(0xFF4444, 0.8);
        g.fillRect(px(30), px(14), px(16), px(4)); // projectile
      }

      if (frame === 'hurt') {
        g.fillStyle(0xFF8888, 0.5);
        g.fillRect(px(4), px(6), px(28), px(18));
      }

      if (frame === 'death') {
        g.fillStyle(0x886644, 0.5);
        g.fillRect(px(4), px(12), px(28), px(12));
      }

      g.generateTexture(key, px(36), px(28));
      g.destroy();
    });
  }

  // ── Bandwidth Leech ───────────────────────────────────────
  private static genLeech(scene: Phaser.Scene): void {
    ['idle', 'move', 'attack', 'hurt', 'death'].forEach(frame => {
      const key = `leech_${frame}`;
      if (scene.textures.exists(key)) return;
      const g = scene.add.graphics();

      g.fillStyle(COLORS.LEECH_COLOR, 1);
      g.fillEllipse(px(16), px(12), px(28), px(20));

      // Tentacles
      g.lineStyle(2, 0x336622, 1);
      if (frame === 'move') {
        g.strokeRect(px(2), px(20), px(4), px(8));
        g.strokeRect(px(10), px(22), px(4), px(8));
        g.strokeRect(px(18), px(22), px(4), px(8));
        g.strokeRect(px(26), px(20), px(4), px(8));
      } else {
        g.strokeRect(px(4), px(20), px(4), px(6));
        g.strokeRect(px(12), px(22), px(4), px(6));
        g.strokeRect(px(20), px(22), px(4), px(6));
        g.strokeRect(px(28), px(20), px(4), px(6));
      }

      // Eyes
      g.fillStyle(0xFF4444, 1);
      g.fillCircle(px(10), px(10), px(4));
      g.fillCircle(px(22), px(10), px(4));
      g.fillStyle(0x000000, 1);
      g.fillCircle(px(10), px(10), px(2));
      g.fillCircle(px(22), px(10), px(2));

      if (frame === 'hurt') {
        g.fillStyle(0xFFFFFF, 0.5);
        g.fillRect(0, 0, px(32), px(28));
      }

      g.generateTexture(key, px(32), px(28));
      g.destroy();
    });
  }

  // ── Firewall Bruiser ──────────────────────────────────────
  private static genBruiser(scene: Phaser.Scene): void {
    ['idle', 'walk', 'attack', 'hurt', 'death'].forEach(frame => {
      const key = `bruiser_${frame}`;
      if (scene.textures.exists(key)) return;
      const g = scene.add.graphics();

      // Large body
      g.fillStyle(COLORS.BRUISER_COLOR, 1);
      g.fillRect(px(8), px(12), px(32), px(32));

      // Shield
      g.fillStyle(0x884400, 1);
      g.fillRect(px(0), px(8), px(12), px(32));

      // Head
      g.fillStyle(0xCC5500, 1);
      g.fillRect(px(14), px(2), px(20), px(16));

      // Glowing eyes
      g.fillStyle(0xFF8800, 1);
      g.fillCircle(px(18), px(8), px(4));
      g.fillCircle(px(28), px(8), px(4));

      if (frame === 'attack') {
        // Shield slam extension
        g.fillStyle(0xFFAA00, 0.8);
        g.fillRect(px(-8), px(6), px(14), px(36));
      }

      if (frame === 'hurt') {
        g.fillStyle(0xFF8888, 0.4);
        g.fillRect(0, 0, px(48), px(52));
      }

      g.generateTexture(key, px(48), px(52));
      g.destroy();
    });
  }

  // ── Dark Screen Wisp ─────────────────────────────────────
  private static genWisp(scene: Phaser.Scene): void {
    ['idle', 'float', 'attack', 'phase', 'hurt', 'death'].forEach(frame => {
      const key = `wisp_${frame}`;
      if (scene.textures.exists(key)) return;
      const g = scene.add.graphics();

      const alpha = frame === 'phase' ? 0.3 : 0.9;

      // Outer glow
      g.fillStyle(COLORS.WISP_COLOR, alpha * 0.3);
      g.fillCircle(px(15), px(15), px(15));

      // Core
      g.fillStyle(0x4B0082, alpha);
      g.fillCircle(px(15), px(15), px(11));

      // Inner glow
      g.fillStyle(0xCC88FF, alpha * 0.8);
      g.fillCircle(px(15), px(13), px(7));

      // Eyes
      g.fillStyle(0xFFFFFF, alpha);
      g.fillCircle(px(11), px(13), px(3));
      g.fillCircle(px(19), px(13), px(3));
      g.fillStyle(0x440044, alpha);
      g.fillCircle(px(11), px(13), px(1.5));
      g.fillCircle(px(19), px(13), px(1.5));

      if (frame === 'attack') {
        g.lineStyle(2, 0xFF88FF, 0.9);
        g.strokeCircle(px(15), px(15), px(14));
      }

      g.generateTexture(key, px(30), px(30));
      g.destroy();
    });
  }

  // ── Gatekeeper Bot ────────────────────────────────────────
  private static genGatekeeper(scene: Phaser.Scene): void {
    ['idle', 'patrol', 'attack', 'hurt', 'death'].forEach(frame => {
      const key = `gatekeeper_${frame}`;
      if (scene.textures.exists(key)) return;
      const g = scene.add.graphics();

      // Chassis
      g.fillStyle(COLORS.GATEKEEPER_COLOR, 1);
      g.fillRect(px(6), px(10), px(26), px(30));

      // Head
      g.fillStyle(0x0066CC, 1);
      g.fillRect(px(9), px(2), px(20), px(14));

      // Visor
      g.fillStyle(0xFFFF00, 1);
      g.fillRect(px(11), px(5), px(16), px(6));

      // Barrier projector
      if (frame === 'attack') {
        g.fillStyle(0x4488FF, 0.6);
        g.fillRect(px(32), px(0), px(8), px(44));
      }

      // Legs
      g.fillStyle(0x004488, 1);
      g.fillRect(px(8), px(40), px(8), px(14));
      g.fillRect(px(22), px(40), px(8), px(14));

      if (frame === 'hurt') {
        g.fillStyle(0xFFFFFF, 0.4);
        g.fillRect(0, 0, px(38), px(54));
      }

      g.generateTexture(key, px(38), px(54));
      g.destroy();
    });
  }

  // ── Signal Saboteur ───────────────────────────────────────
  private static genSaboteur(scene: Phaser.Scene): void {
    ['idle', 'dash', 'attack', 'hurt', 'death'].forEach(frame => {
      const key = `saboteur_${frame}`;
      if (scene.textures.exists(key)) return;
      const g = scene.add.graphics();

      // Slender body
      g.fillStyle(COLORS.SABOTEUR_COLOR, 1);
      g.fillRect(px(8), px(12), px(14), px(24));

      // Head with antenna
      g.fillStyle(0x228B22, 1);
      g.fillRect(px(6), px(2), px(18), px(14));
      g.fillStyle(COLORS.SABOTEUR_COLOR, 1);
      g.fillRect(px(16), px(-4), px(3), px(8)); // antenna

      // Pulse emitter
      g.fillStyle(0x00FF44, 0.8);
      g.fillCircle(px(15), px(20), px(5));

      // Legs
      g.fillStyle(0x1A3A1A, 1);
      if (frame === 'dash') {
        g.fillRect(px(2), px(36), px(8), px(8));
        g.fillRect(px(20), px(38), px(8), px(6));
      } else {
        g.fillRect(px(8), px(36), px(6), px(10));
        g.fillRect(px(16), px(36), px(6), px(10));
      }

      if (frame === 'attack') {
        g.lineStyle(3, 0x00FF88, 0.8);
        g.strokeCircle(px(15), px(20), px(20)); // jamming pulse
      }

      if (frame === 'hurt') {
        g.fillStyle(0xFFFFFF, 0.4);
        g.fillRect(0, 0, px(30), px(46));
      }

      g.generateTexture(key, px(30), px(46));
      g.destroy();
    });
  }

  // ── Glitch Turret (stationary hazard) ─────────────────────
  private static genTurret(scene: Phaser.Scene): void {
    ['idle', 'activate', 'shoot', 'destroyed'].forEach(frame => {
      const key = `turret_${frame}`;
      if (scene.textures.exists(key)) return;
      const g = scene.add.graphics();

      // Base
      g.fillStyle(0x553300, 1);
      g.fillRect(px(4), px(22), px(24), px(10));

      // Barrel
      g.fillStyle(COLORS.TURRET_COLOR, 1);
      g.fillRect(px(8), px(10), px(16), px(16));

      // Barrel tip
      g.fillStyle(0xFF6600, 1);
      if (frame === 'shoot') {
        g.fillRect(px(24), px(14), px(12), px(8));
        // Muzzle flash
        g.fillStyle(0xFFFF00, 0.8);
        g.fillCircle(px(34), px(18), px(5));
      } else {
        g.fillRect(px(22), px(15), px(8), px(6));
      }

      // Warning light
      const lightColor = frame === 'activate' ? 0xFFAA00 : frame === 'shoot' ? 0xFF2200 : 0x554400;
      g.fillStyle(lightColor, 1);
      g.fillCircle(px(8), px(14), px(4));

      if (frame === 'destroyed') {
        g.fillStyle(0x444444, 0.8);
        g.fillRect(0, 0, px(32), px(32));
      }

      g.generateTexture(key, px(32), px(32));
      g.destroy();
    });
  }

  // ── Boss generation ───────────────────────────────────────
  private static genBoss(
    scene: Phaser.Scene,
    id: string,
    color: number,
    accent: number,
    w: number,
    h: number
  ): void {
    ['idle', 'attack1', 'attack2', 'hurt', 'defeated'].forEach(frame => {
      const key = `${id}_${frame}`;
      if (scene.textures.exists(key)) return;
      const g = scene.add.graphics();

      // Massive body
      g.fillStyle(color, 1);
      g.fillRect(px(8), px(16), px(w - 16), px(h - 24));

      // Head
      g.fillStyle(color, 1);
      g.fillRect(px(16), px(2), px(w - 32), px(20));

      // Glowing core
      g.fillStyle(accent, 0.9);
      g.fillCircle(px(w / 2), px(h / 2), px(16));

      // Eyes
      g.fillStyle(accent, 1);
      g.fillCircle(px(w / 2 - 12), px(12), px(6));
      g.fillCircle(px(w / 2 + 12), px(12), px(6));

      // Arms
      g.fillStyle(color, 1);
      if (frame === 'attack1') {
        g.fillRect(px(-14), px(20), px(18), px(12));
        g.fillStyle(accent, 0.8);
        g.fillRect(px(-20), px(16), px(14), px(18));
      } else if (frame === 'attack2') {
        g.fillRect(px(w - 4), px(20), px(18), px(12));
        g.fillStyle(accent, 0.8);
        g.fillRect(px(w + 6), px(16), px(14), px(18));
      } else {
        g.fillRect(px(-8), px(22), px(12), px(10));
        g.fillRect(px(w - 4), px(22), px(12), px(10));
      }

      // Feet
      g.fillStyle(0x1A1A1A, 1);
      g.fillRect(px(10), px(h - 14), px(16), px(14));
      g.fillRect(px(w - 26), px(h - 14), px(16), px(14));

      if (frame === 'hurt') {
        g.fillStyle(0xFFFFFF, 0.4);
        g.fillRect(0, 0, w, h);
      }

      if (frame === 'defeated') {
        g.fillStyle(accent, 0.2);
        g.fillRect(0, 0, w, h);
        g.lineStyle(3, accent, 0.8);
        g.strokeRect(0, 0, w, h);
      }

      g.generateTexture(key, w, h);
      g.destroy();
    });
  }

  // ── Collectibles ──────────────────────────────────────────
  private static genToken(scene: Phaser.Scene): void {
    ['idle', 'shine'].forEach(frame => {
      const key = `token_${frame}`;
      if (scene.textures.exists(key)) return;
      const g = scene.add.graphics();
      g.fillStyle(COLORS.TOKEN_COLOR, 1);
      g.fillCircle(px(10), px(10), px(10));
      g.fillStyle(0xFFEE00, 0.7);
      g.fillCircle(px(10), px(10), px(7));
      if (frame === 'shine') {
        g.lineStyle(2, 0xFFFFFF, 0.9);
        g.strokeCircle(px(10), px(10), px(10));
      }
      // CC symbol
      g.fillStyle(0x8B6914, 1);
      g.fillRect(px(7), px(7), px(2), px(6));
      g.fillRect(px(9), px(7), px(4), px(2));
      g.fillRect(px(9), px(11), px(4), px(2));
      g.generateTexture(key, px(20), px(20));
      g.destroy();
    });
  }

  private static genHealthPack(scene: Phaser.Scene): void {
    const key = 'healthPack_idle';
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    g.fillStyle(0x226622, 1);
    g.fillRect(px(1), px(1), px(22), px(22));
    g.fillStyle(0x00FF44, 1);
    g.fillRect(px(9), px(4), px(6), px(16));
    g.fillRect(px(4), px(9), px(16), px(6));
    g.lineStyle(2, 0x00FF88, 0.8);
    g.strokeRect(px(1), px(1), px(22), px(22));
    g.generateTexture(key, px(24), px(24));
    g.destroy();
  }

  private static genScroll(scene: Phaser.Scene): void {
    const key = 'aiLiteracyScroll_idle';
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    g.fillStyle(0x8B6914, 1);
    g.fillRect(px(4), px(4), px(16), px(18));
    g.fillStyle(0xF5DEB3, 1);
    g.fillRect(px(6), px(6), px(12), px(14));
    g.lineStyle(1, 0x8B6914, 0.8);
    [8, 10, 12, 14, 16].forEach(y => g.strokeRect(px(7), px(y), px(10), 0));
    g.fillStyle(0x4A90D9, 0.9);
    g.fillCircle(px(12), px(2), px(4));
    g.generateTexture(key, px(24), px(24));
    g.destroy();
  }

  private static genBattery(scene: Phaser.Scene): void {
    const key = 'patchBattery_idle';
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    g.fillStyle(0x224422, 1);
    g.fillRect(px(4), px(4), px(16), px(20));
    g.fillStyle(0x00CC66, 0.9);
    g.fillRect(px(6), px(6), px(12), px(14));
    g.fillStyle(0x224422, 1);
    g.fillRect(px(8), px(1), px(8), px(5));
    g.lineStyle(2, 0x00FF88, 0.8);
    g.strokeRect(px(4), px(4), px(16), px(20));
    g.generateTexture(key, px(24), px(24));
    g.destroy();
  }

  private static genShield(scene: Phaser.Scene): void {
    const key = 'signalShield_idle';
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    g.fillStyle(0x1A3A8C, 1);
    g.fillRect(px(4), px(2), px(16), px(18));
    g.fillRect(px(2), px(4), px(20), px(14));
    g.fillStyle(0x4488FF, 0.6);
    g.fillRect(px(6), px(4), px(12), px(14));
    g.lineStyle(2, 0x88AAFF, 0.9);
    g.strokeRect(px(4), px(2), px(16), px(18));
    g.generateTexture(key, px(24), px(24));
    g.destroy();
  }

  private static genShard(scene: Phaser.Scene): void {
    const key = 'empowermentShard_idle';
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    // Crystal shape
    const pts = [
      { x: px(12), y: px(2) },
      { x: px(20), y: px(10) },
      { x: px(14), y: px(22) },
      { x: px(10), y: px(22) },
      { x: px(4), y: px(10) },
    ];
    g.fillStyle(0xFF88FF, 0.9);
    g.fillPoints(pts, true);
    g.fillStyle(0xFFBBFF, 0.5);
    g.fillCircle(px(12), px(10), px(5));
    g.lineStyle(2, 0xFF44FF, 0.8);
    g.strokePoints(pts, true);
    g.generateTexture(key, px(24), px(24));
    g.destroy();
  }

  private static genExtraLife(scene: Phaser.Scene): void {
    const key = 'extraLife_idle';
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    g.fillStyle(0xCC0000, 1);
    g.fillCircle(px(12), px(12), px(12));
    g.fillStyle(0xFF4444, 0.6);
    g.fillCircle(px(10), px(10), px(6));
    g.fillStyle(0xFFFFFF, 1);
    g.fillRect(px(9), px(7), px(6), px(10));
    g.fillRect(px(7), px(9), px(10), px(6));
    g.generateTexture(key, px(24), px(24));
    g.destroy();
  }

  private static genLorePage(scene: Phaser.Scene): void {
    const key = 'hiddenLorePage_idle';
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    g.fillStyle(0x3A2A0A, 1);
    g.fillRect(px(3), px(2), px(18), px(22));
    g.fillStyle(0xEEDDBB, 1);
    g.fillRect(px(5), px(4), px(14), px(18));
    g.fillStyle(0x553311, 0.6);
    [7, 9, 11, 13, 15, 17].forEach(y => { g.fillRect(px(7), px(y), px(10), px(1)); });
    g.fillStyle(0xFFDD88, 1);
    g.fillCircle(px(12), px(0), px(5)); // magic glow
    g.generateTexture(key, px(24), px(26));
    g.destroy();
  }

  private static genChallengeKey(scene: Phaser.Scene): void {
    const key = 'challengeRoomKey_idle';
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    g.fillStyle(0xFFAA44, 1);
    g.fillCircle(px(8), px(8), px(8));
    g.fillStyle(0x885500, 1);
    g.fillRect(px(8), px(12), px(4), px(12));
    g.fillRect(px(10), px(17), px(4), px(3));
    g.fillRect(px(10), px(21), px(4), px(3));
    g.lineStyle(2, 0xFFDD88, 0.8);
    g.strokeCircle(px(8), px(8), px(8));
    g.generateTexture(key, px(24), px(26));
    g.destroy();
  }

  // ── Interactive objects ───────────────────────────────────
  private static genCheckpoint(scene: Phaser.Scene): void {
    ['idle', 'active'].forEach(frame => {
      const key = `checkpoint_${frame}`;
      if (scene.textures.exists(key)) return;
      const g = scene.add.graphics();
      // Pole
      g.fillStyle(0x333355, 1);
      g.fillRect(px(18), px(20), px(6), px(44));
      // Flag
      const flagColor = frame === 'active' ? 0x00FFCC : 0x225588;
      g.fillStyle(flagColor, 1);
      g.fillRect(px(24), px(20), px(24), px(18));
      // CC logo on flag
      g.fillStyle(frame === 'active' ? 0xFFFFFF : 0x4A90D9, 0.8);
      g.fillCircle(px(34), px(29), px(6));
      // Base
      g.fillStyle(0x4A4A66, 1);
      g.fillRect(px(8), px(64), px(26), px(8));
      g.generateTexture(key, px(52), px(72));
      g.destroy();
    });
  }

  private static genExitBeacon(scene: Phaser.Scene): void {
    ['idle', 'active'].forEach(frame => {
      const key = `exitBeacon_${frame}`;
      if (scene.textures.exists(key)) return;
      const g = scene.add.graphics();
      // Beam
      const beamAlpha = frame === 'active' ? 0.8 : 0.3;
      g.fillStyle(0xFFFFAA, beamAlpha);
      g.fillRect(px(22), px(0), px(12), px(80));
      // Orb
      const orbColor = frame === 'active' ? 0xFFFF44 : 0x888844;
      g.fillStyle(orbColor, 1);
      g.fillCircle(px(28), px(60), px(20));
      g.fillStyle(0xFFFFBB, 0.7);
      g.fillCircle(px(28), px(58), px(12));
      // Glow ring
      if (frame === 'active') {
        g.lineStyle(3, 0xFFFF44, 0.6);
        g.strokeCircle(px(28), px(60), px(26));
      }
      g.generateTexture(key, px(56), px(82));
      g.destroy();
    });
  }

  // ── Projectile ────────────────────────────────────────────
  private static genProjectile(
    scene: Phaser.Scene,
    key: string,
    color: number,
    w: number,
    h: number
  ): void {
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    g.fillStyle(color, 1);
    g.fillEllipse(px(w / 2), px(h / 2), px(w), px(h));
    g.fillStyle(0xFFFFFF, 0.7);
    g.fillCircle(px(w / 4), px(h / 4), px(1.5));
    g.generateTexture(key, px(w), px(h));
    g.destroy();
  }

  // ── Ability effect visual ─────────────────────────────────
  private static genAbilityEffect(scene: Phaser.Scene, id: string, color: number): void {
    const key = `abilityFX_${id}`;
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    g.lineStyle(4, color, 0.8);
    g.strokeCircle(px(40), px(40), px(36));
    g.lineStyle(2, color, 0.4);
    g.strokeCircle(px(40), px(40), px(46));
    g.fillStyle(color, 0.15);
    g.fillCircle(px(40), px(40), px(36));
    g.generateTexture(key, px(80), px(80));
    g.destroy();
  }
}
