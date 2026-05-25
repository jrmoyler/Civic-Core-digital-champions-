// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Asset Gallery / Codex Scene
// Shows every attached image. Labeled, scrollable.
// Also shows unlocked lore entries.
// ============================================================

import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';
import { GALLERY_ENTRIES } from '../assets/assetManifest';
import { LORE_DATABASE } from '../data/lore';
import { GameState } from '../game/state/GameState';
import { AudioSystem } from '../systems/AudioSystem';

type GalleryTab = 'assets' | 'lore';

export class AssetGalleryScene extends Phaser.Scene {
  private state!: GameState;
  private currentTab: GalleryTab = 'assets';
  private scrollY: number = 0;
  private maxScrollY: number = 0;
  private contentContainer!: Phaser.GameObjects.Container;
  private tabBtns: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: SCENE_KEYS.GALLERY });
  }

  create(): void {
    this.state = GameState.getInstance();
    this.buildBackground();
    this.buildHeader();
    this.buildTabs();
    this.buildContent();
    this.buildScrollControls();
    this.buildBackButton();

    // Mouse wheel scroll
    this.input.on('wheel', (_p: unknown, _gos: unknown, _dx: number, dy: number) => {
      this.scrollContent(dy > 0 ? 80 : -80);
    });

    // Keyboard scroll
    this.input.keyboard?.on('keydown-DOWN', () => this.scrollContent(80));
    this.input.keyboard?.on('keydown-UP', () => this.scrollContent(-80));
    this.input.keyboard?.on('keydown-ESC', () => this.goBack());
  }

  private buildBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x050810, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Zone 3 background for visual flair
    const sheet = this.textures.exists('zone3Blank') ? 'zone3Blank' : 'zone1Blank';
    if (this.textures.exists(sheet)) {
      const img = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, sheet);
      img.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
      img.setAlpha(0.07);
    }

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private buildHeader(): void {
    this.add.text(GAME_WIDTH / 2, 24, 'ASSET GALLERY & CODEX', {
      fontSize: '24px',
      color: '#F5A623',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      letterSpacing: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 54, 'All game assets and lore entries. Scroll to view.', {
      fontSize: '12px',
      color: '#446688',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  private buildTabs(): void {
    const tabs: Array<{ label: string; key: GalleryTab }> = [
      { label: 'SOURCE ASSETS (11 Images)', key: 'assets' },
      { label: 'LORE CODEX', key: 'lore' },
    ];

    tabs.forEach((tab, i) => {
      const tx = 300 + i * 340;
      const btn = this.add.text(tx, 78, tab.label, {
        fontSize: '14px',
        color: this.currentTab === tab.key ? '#ffffff' : '#446688',
        fontFamily: 'monospace',
        fontStyle: this.currentTab === tab.key ? 'bold' : 'normal',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      if (this.currentTab === tab.key) {
        const underline = this.add.graphics();
        underline.lineStyle(2, COLORS.UI_ACCENT, 0.8);
        underline.strokeRect(tx - 100, 93, 200, 0);
      }

      btn.on('pointerup', () => {
        this.currentTab = tab.key;
        AudioSystem.playMenuSelect();
        this.scene.restart();
      });
      btn.on('pointerover', () => btn.setColor('#aabbcc'));
      btn.on('pointerout', () => btn.setColor(this.currentTab === tab.key ? '#ffffff' : '#446688'));

      this.tabBtns.push(btn);
    });
  }

  private buildContent(): void {
    // Scrollable content area (clipped)
    const clipZone = this.add.zone(0, 105, GAME_WIDTH, GAME_HEIGHT - 160);
    clipZone.setOrigin(0, 0);

    this.contentContainer = this.add.container(0, 105);

    if (this.currentTab === 'assets') {
      this.buildAssetsContent();
    } else {
      this.buildLoreContent();
    }
  }

  private buildAssetsContent(): void {
    let yOffset = 0;
    const colW = (GAME_WIDTH - 60) / 2;
    let col = 0;

    GALLERY_ENTRIES.forEach((entry, i) => {
      const cx = 30 + col * (colW + 20);
      const cy = yOffset;
      const cardH = 220;

      // Card background
      const cardBg = this.add.graphics();
      cardBg.fillStyle(COLORS.UI_SECONDARY, 0.85);
      cardBg.fillRoundedRect(cx, cy, colW, cardH, 8);
      cardBg.lineStyle(1, COLORS.UI_BORDER, 0.5);
      cardBg.strokeRoundedRect(cx, cy, colW, cardH, 8);
      this.contentContainer.add(cardBg);

      // Image (with error safety)
      try {
        if (this.textures.exists(entry.key)) {
          const img = this.add.image(cx + colW / 2, cy + 82, entry.key);
          const maxW = colW - 24;
          const maxH = 130;
          const tex = this.textures.get(entry.key);
          const src = tex.source[0];
          const imgW = src?.width ?? 400;
          const imgH = src?.height ?? 300;
          const scale = Math.min(maxW / imgW, maxH / imgH);
          img.setDisplaySize(imgW * scale, imgH * scale);
          this.contentContainer.add(img);
        } else {
          // Fallback placeholder
          const placeholder = this.add.graphics();
          placeholder.fillStyle(COLORS.UI_PRIMARY, 0.5);
          placeholder.fillRect(cx + 12, cy + 14, colW - 24, 130);
          placeholder.lineStyle(1, 0x334455, 0.6);
          placeholder.strokeRect(cx + 12, cy + 14, colW - 24, 130);
          this.contentContainer.add(placeholder);

          this.contentContainer.add(this.add.text(cx + colW / 2, cy + 80, '⚠ Image not found\n' + entry.key, {
            fontSize: '12px',
            color: '#FF8800',
            fontFamily: 'monospace',
            align: 'center',
          }).setOrigin(0.5));
        }
      } catch (err) {
        console.warn('[Gallery] Error displaying asset:', entry.key, err);
      }

      // Label
      this.contentContainer.add(this.add.text(cx + 12, cy + cardH - 54, entry.label, {
        fontSize: '13px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      }));

      // Role
      this.contentContainer.add(this.add.text(cx + 12, cy + cardH - 36, entry.role, {
        fontSize: '10px',
        color: '#778899',
        fontFamily: 'monospace',
        wordWrap: { width: colW - 24 },
      }));

      // Asset number badge
      const badge = this.add.graphics();
      badge.fillStyle(COLORS.UI_ACCENT, 0.8);
      badge.fillCircle(cx + colW - 20, cy + 20, 15);
      this.contentContainer.add(badge);
      this.contentContainer.add(this.add.text(cx + colW - 20, cy + 20, `${i + 1}`, {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      }).setOrigin(0.5, 0.5));

      col++;
      if (col >= 2) {
        col = 0;
        yOffset += cardH + 16;
      }
    });

    // Last row odd card
    if (col === 1) yOffset += 220 + 16;

    this.maxScrollY = Math.max(0, yOffset - (GAME_HEIGHT - 160));
  }

  private buildLoreContent(): void {
    let yOffset = 10;
    const allLore = LORE_DATABASE;

    allLore.forEach(entry => {
      const isUnlocked = this.state.loreUnlocked.includes(entry.id) || entry.id === 'intro_core' || entry.id === 'intro_champions';
      const cardH = isUnlocked ? 130 : 64;
      const cardW = GAME_WIDTH - 80;
      const cx = 40;

      const cardBg = this.add.graphics();
      cardBg.fillStyle(isUnlocked ? COLORS.UI_SECONDARY : 0x0a0e1c, 0.9);
      cardBg.fillRoundedRect(cx, yOffset, cardW, cardH, 6);
      cardBg.lineStyle(1, isUnlocked ? COLORS.UI_BORDER : 0x1a2a3a, 0.5);
      cardBg.strokeRoundedRect(cx, yOffset, cardW, cardH, 6);
      this.contentContainer.add(cardBg);

      if (isUnlocked) {
        this.contentContainer.add(this.add.text(cx + 16, yOffset + 14, entry.title, {
          fontSize: '15px',
          color: '#F5A623',
          fontFamily: 'monospace',
          fontStyle: 'bold',
        }));

        this.contentContainer.add(this.add.text(cx + 16, yOffset + 38, entry.content, {
          fontSize: '12px',
          color: '#c8ddf0',
          fontFamily: 'monospace',
          wordWrap: { width: cardW - 32 },
          lineSpacing: 3,
        }));
      } else {
        this.contentContainer.add(this.add.text(cx + 16, yOffset + 14, '🔒 ' + entry.title, {
          fontSize: '14px',
          color: '#334455',
          fontFamily: 'monospace',
        }));
        this.contentContainer.add(this.add.text(cx + 16, yOffset + 38, 'Collect lore pages in-game to unlock this entry.', {
          fontSize: '11px',
          color: '#2a3a4a',
          fontFamily: 'monospace',
        }));
      }

      yOffset += cardH + 12;
    });

    this.maxScrollY = Math.max(0, yOffset - (GAME_HEIGHT - 160));
  }

  private buildScrollControls(): void {
    // Scroll indicators
    const scrollHint = this.add.text(GAME_WIDTH - 16, GAME_HEIGHT - 60, '▲ ▼  Scroll  |  Mouse Wheel', {
      fontSize: '11px',
      color: '#334455',
      fontFamily: 'monospace',
    }).setOrigin(1, 0.5);
  }

  private buildBackButton(): void {
    const backBtn = this.add.text(60, GAME_HEIGHT - 36, '← MAIN MENU', {
      fontSize: '14px',
      color: '#446688',
      fontFamily: 'monospace',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerup', () => this.goBack());
    backBtn.on('pointerover', () => backBtn.setColor('#88aacc'));
    backBtn.on('pointerout', () => backBtn.setColor('#446688'));
  }

  private scrollContent(dy: number): void {
    this.scrollY = Phaser.Math.Clamp(this.scrollY + dy, 0, this.maxScrollY);
    this.contentContainer.setY(105 - this.scrollY);
  }

  private goBack(): void {
    AudioSystem.playMenuSelect();
    this.scene.start(SCENE_KEYS.MAIN_MENU);
  }
}
