import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { ASSET_KEYS } from '../assets/assetManifest';
import { AudioSystem } from '../systems/AudioSystem';
import { GameState } from '../game/state/GameState';
import { HeroId } from '../game/types';
import { HEROES } from '../data/heroes';

const SHOW_SELECTION_OVERLAY = true;

export class CharacterSelectScene extends Phaser.Scene {
  private state!: GameState;
  private selectionGraphics!: Phaser.GameObjects.Graphics;
  private currentHeroId: HeroId = 'communityCreator';
  private heroSprites: Partial<Record<HeroId, Phaser.GameObjects.Sprite>> = {};

  private readonly heroIds: HeroId[] = ['communityCreator', 'civicCoder', 'digitalEquityAdvocate'];

  // Panel positions in SOURCE image coordinates (1672×941)
  private readonly panelsData: Record<HeroId, { rect: { x: number; y: number; width: number; height: number }; color: number }> = {
    communityCreator:       { rect: { x: 48,   y: 135, width: 548  - 48,   height: 802 - 135 }, color: COLORS.CREATOR_PRIMARY },
    civicCoder:             { rect: { x: 574,  y: 135, width: 1090 - 574,  height: 802 - 135 }, color: COLORS.CODER_PRIMARY },
    digitalEquityAdvocate:  { rect: { x: 1123, y: 135, width: 1620 - 1123, height: 802 - 135 }, color: COLORS.ADVOCATE_PRIMARY },
  };

  private bgScale: number = 1;
  private bgX: number = 0;
  private bgY: number = 0;

  constructor() {
    super({ key: SCENE_KEYS.CHAR_SELECT });
  }

  create(): void {
    // Reset camera (LevelScene sets follow + bounds which bleed into this scene)
    this.cameras.main.setScroll(0, 0);
    this.cameras.main.resetFX();
    this.cameras.main.removeBounds();

    this.state = GameState.getInstance();
    this.currentHeroId = this.state.selectedHero || 'communityCreator';

    if (this.textures.exists(ASSET_KEYS.CHARACTER_SELECT_SCREEN)) {
      const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEYS.CHARACTER_SELECT_SCREEN);

      const sourceWidth  = bg.width  || 1672;
      const sourceHeight = bg.height || 941;
      const scaleX = GAME_WIDTH  / sourceWidth;
      const scaleY = GAME_HEIGHT / sourceHeight;
      this.bgScale = Math.min(scaleX, scaleY);

      bg.setScale(this.bgScale);
      bg.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

      // Top-left of the scaled image in game space
      this.bgX = bg.x - (sourceWidth  * this.bgScale) / 2;
      this.bgY = bg.y - (sourceHeight * this.bgScale) / 2;

      this.buildHeroOverlays();
      this.buildHitZones(sourceWidth, sourceHeight);
    } else {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'CHAR SELECT SCREEN MISSING', {
        color: '#f00', fontSize: '24px', fontFamily: 'monospace',
      }).setOrigin(0.5);
    }

    if (SHOW_SELECTION_OVERLAY) {
      this.selectionGraphics = this.add.graphics();
      this.updateSelectionOverlay();
    }
  }

  // ── Hero overlays (sprites + name/ability labels on each panel) ────────────

  private buildHeroOverlays(): void {
    for (const hero of HEROES) {
      const panel = this.panelsData[hero.id];
      const rect  = panel.rect;

      // Centre-X of panel in game space; hero sprite sits in the upper third
      const cx       = this.bgX + (rect.x + rect.width  / 2) * this.bgScale;
      const topY     = this.bgY +  rect.y                     * this.bgScale;
      const panelH   = rect.height * this.bgScale;
      const spriteY  = topY + panelH * 0.32;  // upper-third of panel

      // ── Hero idle sprite / avatar ──────────────────────────────────────────
      const spritesheetKey = `hero_${hero.id}_idle`;
      const avatarKeyMap: Record<HeroId, string> = {
        communityCreator:      ASSET_KEYS.AVATAR_COMMUNITY_CREATOR,
        civicCoder:            ASSET_KEYS.AVATAR_CIVIC_CODER,
        digitalEquityAdvocate: ASSET_KEYS.AVATAR_DIGITAL_EQUITY_ADVOCATE,
      };

      if (this.textures.exists(spritesheetKey)) {
        // Animated idle sprite
        const targetH = panelH * 0.40;
        const targetW = targetH * (104 / 120);      // idle frame aspect ratio
        const sp = this.add.sprite(cx, spriteY, spritesheetKey, 0);
        sp.setDisplaySize(targetW, targetH);

        const animKey = `${hero.id}_idle`;
        if (this.anims.exists(animKey)) {
          sp.play(animKey);
        }
        this.heroSprites[hero.id] = sp;

      } else if (this.textures.exists(avatarKeyMap[hero.id])) {
        // Fallback: static avatar image
        const targetH = panelH * 0.40;
        const av = this.add.image(cx, spriteY, avatarKeyMap[hero.id]);
        av.setDisplaySize(targetH, targetH);

      } else {
        // Last-resort coloured circle placeholder
        const g = this.add.graphics();
        g.fillStyle(hero.primaryColor, 0.6);
        g.fillCircle(cx, spriteY, panelH * 0.18);
      }

      // ── Hero name label ────────────────────────────────────────────────────
      const labelFontSize = Math.max(10, Math.floor(15 * this.bgScale));
      const nameY = topY + panelH * 0.68;
      this.add.text(cx, nameY, hero.name, {
        fontSize: `${labelFontSize}px`,
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: rect.width * this.bgScale - 12 },
      }).setOrigin(0.5, 0);

      // ── Ability label ──────────────────────────────────────────────────────
      const abilityFontSize = Math.max(9, Math.floor(11 * this.bgScale));
      const abilityY = nameY + labelFontSize + 4;
      this.add.text(cx, abilityY, `⚡ ${hero.abilityName}`, {
        fontSize: `${abilityFontSize}px`,
        color: `#${hero.primaryColor.toString(16).padStart(6, '0')}`,
        fontFamily: 'monospace',
        align: 'center',
      }).setOrigin(0.5, 0);
    }

    // Start with correct highlight state
    this.updateHeroHighlight();
  }

  // ── Interactive hit zones ──────────────────────────────────────────────────

  private sourceToGame(
    rect: { x: number; y: number; width: number; height: number },
  ): { cx: number; cy: number; w: number; h: number } {
    return {
      cx: this.bgX + (rect.x + rect.width  / 2) * this.bgScale,
      cy: this.bgY + (rect.y + rect.height / 2) * this.bgScale,
      w:  rect.width  * this.bgScale,
      h:  rect.height * this.bgScale,
    };
  }

  private addZone(
    rect: { x: number; y: number; width: number; height: number },
    callback: () => void,
    debug = false,
  ): Phaser.GameObjects.Zone {
    const { cx, cy, w, h } = this.sourceToGame(rect);
    const zone = this.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerup', callback);

    if (debug) {
      const g = this.add.graphics();
      g.lineStyle(2, 0xff0000, 0.6);
      g.strokeRect(cx - w / 2, cy - h / 2, w, h);
    }
    return zone;
  }

  private buildHitZones(w: number, h: number): void {
    const DEBUG = false;

    // Hero panel click zones
    this.addZone(this.panelsData.communityCreator.rect,      () => this.selectHero('communityCreator'),      DEBUG);
    this.addZone(this.panelsData.civicCoder.rect,            () => this.selectHero('civicCoder'),            DEBUG);
    this.addZone(this.panelsData.digitalEquityAdvocate.rect, () => this.selectHero('digitalEquityAdvocate'), DEBUG);

    // Back button
    this.addZone({ x: 380, y: 832, width: 603 - 380, height: 905 - 832 }, () => {
      AudioSystem.playMenuSelect();
      this.scene.start(SCENE_KEYS.MAIN_MENU);
    }, DEBUG);

    // Confirm button
    this.addZone({ x: 640, y: 827, width: 995 - 640, height: 908 - 827 }, () => {
      AudioSystem.playCheckpoint();
      this.state.selectedHero = this.currentHeroId;
      this.state.save();
      this.cameras.main.flash(300, 74, 144, 217, false);
      this.time.delayedCall(300, () => this.scene.start(SCENE_KEYS.WORLD_MAP));
    }, DEBUG);

    // View Stats (stub)
    this.addZone({ x: 1025, y: 832, width: 1258 - 1025, height: 905 - 832 }, () => {
      this.showToast('Stats overlay coming soon');
    }, DEBUG);

    // Settings (stub)
    this.addZone({ x: 1490, y: 35, width: 1635 - 1490, height: 90 - 35 }, () => {
      this.showToast('Settings coming soon');
    }, DEBUG);

    // Left arrow
    this.addZone({ x: 0, y: 395, width: 60, height: 500 - 395 }, () => this.cycleHero(-1), DEBUG);
    // Right arrow
    this.addZone({ x: 1610, y: 395, width: 1672 - 1610, height: 500 - 395 }, () => this.cycleHero(1), DEBUG);

    // Keyboard navigation
    this.input.keyboard?.on('keydown-LEFT',  () => this.cycleHero(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.cycleHero(1));
    this.input.keyboard?.on('keydown-ENTER', () => {
      // Same as Confirm button
      AudioSystem.playCheckpoint();
      this.state.selectedHero = this.currentHeroId;
      this.state.save();
      this.cameras.main.flash(300, 74, 144, 217, false);
      this.time.delayedCall(300, () => this.scene.start(SCENE_KEYS.WORLD_MAP));
    });
  }

  // ── Hero selection logic ───────────────────────────────────────────────────

  private selectHero(id: HeroId): void {
    if (this.currentHeroId === id) return;
    this.currentHeroId = id;
    AudioSystem.playMenuSelect();
    this.updateSelectionOverlay();
    this.updateHeroHighlight();
  }

  private cycleHero(dir: number): void {
    const idx = (this.heroIds.indexOf(this.currentHeroId) + dir + this.heroIds.length) % this.heroIds.length;
    this.selectHero(this.heroIds[idx]);
  }

  private updateHeroHighlight(): void {
    for (const heroId of this.heroIds) {
      const sp = this.heroSprites[heroId];
      if (!sp) continue;
      if (heroId === this.currentHeroId) {
        sp.clearTint();
        sp.setAlpha(1.0);
      } else {
        sp.setTint(0x888888);
        sp.setAlpha(0.65);
      }
    }
  }

  private updateSelectionOverlay(): void {
    if (!SHOW_SELECTION_OVERLAY || !this.selectionGraphics) return;
    this.selectionGraphics.clear();

    const { rect, color } = this.panelsData[this.currentHeroId];
    const x = this.bgX + rect.x * this.bgScale;
    const y = this.bgY + rect.y * this.bgScale;
    const w = rect.width  * this.bgScale;
    const h = rect.height * this.bgScale;
    const r = 16 * this.bgScale;

    this.selectionGraphics.lineStyle(4, color, 0.85);
    this.selectionGraphics.strokeRoundedRect(x, y, w, h, r);

    this.selectionGraphics.lineStyle(2, 0xffffff, 0.45);
    this.selectionGraphics.strokeRoundedRect(x + 2, y + 2, w - 4, h - 4, r - 2);
  }

  // ── Toast notification ─────────────────────────────────────────────────────

  private showToast(message: string): void {
    const toast = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, message, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: toast,
      alpha: 0,
      y: GAME_HEIGHT - 80,
      duration: 1500,
      delay: 1000,
      onComplete: () => toast.destroy(),
    });
  }
}
