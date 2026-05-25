// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — World Map Scene
// ============================================================

import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';
import { ASSET_KEYS } from '../assets/assetManifest';
import { GameState } from '../game/state/GameState';
import { AudioSystem } from '../systems/AudioSystem';
import type { ZoneId } from '../game/types';

interface ZoneNode {
  id: ZoneId;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  bgKey: string;
  color: number;
  accentColor: number;
  bossName: string;
}

const ZONE_NODES: ZoneNode[] = [
  {
    id: 'zone1',
    name: 'COMMUNITY COMMONS',
    subtitle: 'Zone 1 — Where every voice builds',
    x: 260,
    y: 360,
    bgKey: ASSET_KEYS.ZONE1_BLANK,
    color: COLORS.ZONE1_PRIMARY,
    accentColor: COLORS.ZONE1_SECONDARY,
    bossName: 'Boss: Access Denier',
  },
  {
    id: 'zone2',
    name: 'PUBLIC ACCESS INTELLIGENCE',
    subtitle: 'Zone 2 — The network belongs to all',
    x: 640,
    y: 280,
    bgKey: ASSET_KEYS.ZONE2_BLANK,
    color: COLORS.ZONE2_PRIMARY,
    accentColor: COLORS.ZONE2_SECONDARY,
    bossName: 'Boss: Algorithmic Gatekeeper',
  },
  {
    id: 'zone3',
    name: 'EMPOWERMENT HEIGHTS',
    subtitle: 'Zone 3 — The Core Beacon shines for all',
    x: 1020,
    y: 200,
    bgKey: ASSET_KEYS.ZONE3_BLANK,
    color: COLORS.ZONE3_PRIMARY,
    accentColor: COLORS.ZONE3_SECONDARY,
    bossName: 'Boss: Blackout Warden',
  },
];

export class WorldMapScene extends Phaser.Scene {
  private state!: GameState;
  private selectedZone: number = 0;

  constructor() {
    super({ key: SCENE_KEYS.WORLD_MAP });
  }

  create(): void {
    this.state = GameState.getInstance();
    this.buildBackground();
    this.buildMapNodes();
    this.buildHeroDisplay();
    this.buildNavigation();

    // Keyboard
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start(SCENE_KEYS.MAIN_MENU));
  }

  private buildBackground(): void {
    // Map background using zone tilesets as panels
    const bg = this.add.graphics();
    bg.fillStyle(0x050810, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Use the three blank maps as small preview panels
    const bgImages = [ASSET_KEYS.ZONE1_BLANK, ASSET_KEYS.ZONE2_BLANK, ASSET_KEYS.ZONE3_BLANK];
    bgImages.forEach((key, i) => {
      if (this.textures.exists(key)) {
        const img = this.add.image((i + 0.5) * (GAME_WIDTH / 3), GAME_HEIGHT / 2, key);
        img.setDisplaySize(GAME_WIDTH / 3, GAME_HEIGHT);
        img.setAlpha(0.08 + i * 0.02);
      }
    });

    // Overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.65);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add.text(GAME_WIDTH / 2, 40, 'WORLD MAP', {
      fontSize: '28px',
      color: '#F5A623',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      letterSpacing: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 74, 'SELECT ZONE', {
      fontSize: '13px',
      color: '#446688',
      fontFamily: 'monospace',
      letterSpacing: 3,
    }).setOrigin(0.5);

    // Path lines between zones
    const pathGfx = this.add.graphics();
    pathGfx.lineStyle(3, 0x334466, 0.6);
    for (let i = 0; i < ZONE_NODES.length - 1; i++) {
      const from = ZONE_NODES[i];
      const to = ZONE_NODES[i + 1];
      pathGfx.strokeLineShape(new Phaser.Geom.Line(from.x, from.y, to.x, to.y));
    }

    // Decorative dots along paths
    const dotGfx = this.add.graphics();
    dotGfx.fillStyle(0x223355, 0.7);
    for (let i = 0; i < ZONE_NODES.length - 1; i++) {
      const from = ZONE_NODES[i];
      const to = ZONE_NODES[i + 1];
      for (let t = 0.1; t < 1; t += 0.15) {
        const dx = from.x + (to.x - from.x) * t;
        const dy = from.y + (to.y - from.y) * t;
        dotGfx.fillCircle(dx, dy, 4);
      }
    }
  }

  private buildMapNodes(): void {
    ZONE_NODES.forEach((zone, i) => {
      const unlocked = this.state.isZoneUnlocked(zone.id);
      const completed = this.state.unlockedZones.includes(
        i < ZONE_NODES.length - 1 ? ZONE_NODES[i + 1].id : 'zone3'
      );

      // Node background ring
      const ring = this.add.graphics();
      ring.lineStyle(3, zone.accentColor, unlocked ? 0.9 : 0.25);
      ring.strokeCircle(zone.x, zone.y, 62);

      if (unlocked) {
        ring.fillStyle(zone.accentColor, 0.08);
        ring.fillCircle(zone.x, zone.y, 62);
      }

      // Zone preview image
      if (this.textures.exists(zone.bgKey)) {
        const zoneImg = this.add.image(zone.x, zone.y, zone.bgKey);
        zoneImg.setDisplaySize(108, 108);
        zoneImg.setAlpha(unlocked ? 0.8 : 0.2);

        // Circular crop mask
        const maskShape = this.add.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillCircle(zone.x, zone.y, 54);
        const mask = maskShape.createGeometryMask();
        zoneImg.setMask(mask);
      }

      // Lock overlay for locked zones
      if (!unlocked) {
        const lockBg = this.add.graphics();
        lockBg.fillStyle(0x000000, 0.7);
        lockBg.fillCircle(zone.x, zone.y, 54);

        this.add.text(zone.x, zone.y - 8, '🔒', {
          fontSize: '28px',
        }).setOrigin(0.5, 0.5);

        this.add.text(zone.x, zone.y + 24, 'LOCKED', {
          fontSize: '11px',
          color: '#446688',
          fontFamily: 'monospace',
        }).setOrigin(0.5, 0.5);
      }

      // Zone name
      this.add.text(zone.x, zone.y + 75, zone.name, {
        fontSize: '13px',
        color: unlocked ? '#ffffff' : '#445566',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 200 },
      }).setOrigin(0.5, 0);

      // Boss info
      this.add.text(zone.x, zone.y + 102, zone.bossName, {
        fontSize: '11px',
        color: unlocked ? '#FF8888' : '#334455',
        fontFamily: 'monospace',
      }).setOrigin(0.5, 0);

      // Best tokens
      const best = this.state.bestTokens[zone.id];
      if (best !== undefined) {
        this.add.text(zone.x, zone.y + 118, `Best: ${best} tokens`, {
          fontSize: '10px',
          color: '#F5A623',
          fontFamily: 'monospace',
        }).setOrigin(0.5, 0);
      }

      // Zone number badge
      const badgeColor = unlocked ? zone.accentColor : 0x334455;
      const badge = this.add.graphics();
      badge.fillStyle(badgeColor, 0.9);
      badge.fillCircle(zone.x - 48, zone.y - 48, 16);
      this.add.text(zone.x - 48, zone.y - 48, `${i + 1}`, {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      }).setOrigin(0.5, 0.5);

      // Interactive zone
      if (unlocked) {
        const clickZone = this.add.circle(zone.x, zone.y, 65).setInteractive({ useHandCursor: true });

        clickZone.on('pointerover', () => {
          ring.clear();
          ring.lineStyle(4, zone.accentColor, 1);
          ring.strokeCircle(zone.x, zone.y, 62);
          ring.fillStyle(zone.accentColor, 0.15);
          ring.fillCircle(zone.x, zone.y, 62);
          AudioSystem.playMenuSelect();
        });

        clickZone.on('pointerout', () => {
          ring.clear();
          ring.lineStyle(3, zone.accentColor, 0.9);
          ring.strokeCircle(zone.x, zone.y, 62);
          ring.fillStyle(zone.accentColor, 0.08);
          ring.fillCircle(zone.x, zone.y, 62);
        });

        clickZone.on('pointerup', () => {
          this.launchZone(zone.id);
        });
      }
    });
  }

  private buildHeroDisplay(): void {
    const state = GameState.getInstance();
    const heroId = state.selectedHero;

    // Hero panel bottom-left
    const panel = this.add.graphics();
    panel.fillStyle(0x0a0e1c, 0.85);
    panel.fillRoundedRect(40, GAME_HEIGHT - 120, 280, 90, 8);
    panel.lineStyle(2, COLORS.UI_ACCENT, 0.4);
    panel.strokeRoundedRect(40, GAME_HEIGHT - 120, 280, 90, 8);

    // Hero sprite
    const heroKey = `${heroId}_idle`;
    if (this.textures.exists(heroKey)) {
      const heroSprite = this.add.image(82, GAME_HEIGHT - 75, heroKey);
      heroSprite.setDisplaySize(44, 60);
    }

    this.add.text(108, GAME_HEIGHT - 106, 'CHAMPION', {
      fontSize: '11px',
      color: '#446688',
      fontFamily: 'monospace',
    });

    const heroNames: Record<string, string> = {
      creator: 'Community Creator',
      coder: 'Civic Coder',
      advocate: 'Digital Equity Advocate',
    };

    this.add.text(108, GAME_HEIGHT - 90, heroNames[heroId] ?? heroId, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });

    // Change hero button
    const changeBtn = this.add.text(108, GAME_HEIGHT - 68, '← Change Hero', {
      fontSize: '12px',
      color: '#F5A623',
      fontFamily: 'monospace',
    }).setInteractive({ useHandCursor: true });

    changeBtn.on('pointerup', () => {
      AudioSystem.playMenuSelect();
      this.scene.start(SCENE_KEYS.CHAR_SELECT);
    });
    changeBtn.on('pointerover', () => changeBtn.setScale(1.05));
    changeBtn.on('pointerout', () => changeBtn.setScale(1));

    // Dev unlock all button
    const devBtn = this.add.text(GAME_WIDTH - 40, GAME_HEIGHT - 36, '[DEV: UNLOCK ALL]', {
      fontSize: '11px',
      color: '#223344',
      fontFamily: 'monospace',
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    devBtn.on('pointerup', () => {
      state.devUnlockAll = true;
      this.scene.restart();
    });
    devBtn.on('pointerover', () => devBtn.setColor('#446688'));
    devBtn.on('pointerout', () => devBtn.setColor('#223344'));
  }

  private buildNavigation(): void {
    // Back
    const backBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 36, '← MAIN MENU', {
      fontSize: '13px',
      color: '#446688',
      fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerup', () => {
      AudioSystem.playMenuSelect();
      this.scene.start(SCENE_KEYS.MAIN_MENU);
    });
    backBtn.on('pointerover', () => backBtn.setColor('#88aacc'));
    backBtn.on('pointerout', () => backBtn.setColor('#446688'));

    // Subtitle hint
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'Click a zone node to begin', {
      fontSize: '13px',
      color: '#334455',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  private launchZone(zoneId: ZoneId): void {
    const state = GameState.getInstance();
    state.startLevel(zoneId);
    AudioSystem.playCheckpoint();
    this.cameras.main.flash(300, 10, 20, 40, false);
    this.time.delayedCall(300, () => {
      this.scene.start(SCENE_KEYS.LEVEL, { zoneId });
    });
  }
}
