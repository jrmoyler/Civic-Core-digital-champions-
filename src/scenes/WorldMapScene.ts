// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — World Map Scene
// ============================================================

import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';
import { ASSET_KEYS } from '../assets/assetManifest';
import { GameState } from '../game/state/GameState';
import { AudioSystem } from '../systems/AudioSystem';
import { ZoneId, HeroId, getAvatarKeyForHero } from '../game/types';

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
    const heroId = this.state.selectedHero || 'communityCreator';
    const heroNameMap: Record<HeroId, string> = {
      communityCreator: 'Community Creator',
      civicCoder: 'Civic Coder',
      digitalEquityAdvocate: 'Digital Equity Advocate',
    };

    // Hero stats panel (top-left)
    const panel = this.add.graphics();
    panel.fillStyle(0x050810, 0.9);
    panel.fillRoundedRect(20, 20, 240, 80, 8);
    panel.lineStyle(2, COLORS.UI_BORDER, 0.6);
    panel.strokeRoundedRect(20, 20, 240, 80, 8);

    const avatarKey = getAvatarKeyForHero(heroId);

    // Portrait
    if (this.textures.exists(avatarKey)) {
      const portrait = this.add.image(60, 60, avatarKey);

      // Calculate scaling to fit 64x64
      const texW = portrait.width || 100;
      const texH = portrait.height || 100;
      const scale = Math.min(64 / texW, 64 / texH);

      portrait.setScale(scale);
      portrait.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    } else {
      const fallback = this.add.graphics();
      fallback.fillStyle(0x4A90D9, 1);
      fallback.fillRect(36, 36, 48, 48);
    }

    this.add.text(94, 30, 'CURRENT CHAMPION', {
      fontSize: '10px',
      color: '#778899',
      fontFamily: 'monospace',
    });

    this.add.text(94, 46, heroNameMap[heroId].toUpperCase(), {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      wordWrap: { width: 140 },
    });

    // Add map avatar marker over the highest unlocked node
    let currentNode = ZONE_NODES[0];
    for (let i = ZONE_NODES.length - 1; i >= 0; i--) {
      if (this.state.isZoneUnlocked(ZONE_NODES[i].id)) {
        currentNode = ZONE_NODES[i];
        break;
      }
    }

    // Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillEllipse(currentNode.x, currentNode.y + 40, 48, 16);

    // Avatar
    if (this.textures.exists(avatarKey)) {
      const avatar = this.add.image(currentNode.x, currentNode.y, avatarKey);

      const texW = avatar.width || 100;
      const texH = avatar.height || 100;
      const scale = Math.min(100 / texW, 100 / texH);

      avatar.setScale(scale);
      avatar.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

      // Bob animation
      this.tweens.add({
        targets: avatar,
        y: avatar.y - 8,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });

      // Shadow bob
      this.tweens.add({
        targets: shadow,
        scaleX: 0.8,
        scaleY: 0.8,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
    }
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
