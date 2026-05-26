import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { ASSET_KEYS } from '../assets/assetManifest';
import { AudioSystem } from '../systems/AudioSystem';
import { GameState } from '../game/state/GameState';
import { HeroId } from '../game/types';

const SHOW_SELECTION_OVERLAY = true;

export class CharacterSelectScene extends Phaser.Scene {
  private state!: GameState;
  private selectionGraphics!: Phaser.GameObjects.Graphics;
  private currentHeroId: HeroId = 'communityCreator';

  private readonly heroIds: HeroId[] = ['communityCreator', 'civicCoder', 'digitalEquityAdvocate'];

  // Stored for the selection overlay
  private panelsData: Record<HeroId, { rect: any; color: number }> = {
    communityCreator: { rect: { x: 48, y: 135, width: 548-48, height: 802-135 }, color: COLORS.CREATOR_PRIMARY },
    civicCoder: { rect: { x: 574, y: 135, width: 1090-574, height: 802-135 }, color: COLORS.CODER_PRIMARY },
    digitalEquityAdvocate: { rect: { x: 1123, y: 135, width: 1620-1123, height: 802-135 }, color: COLORS.ADVOCATE_PRIMARY }
  };

  private bgScale: number = 1;
  private bgX: number = 0;
  private bgY: number = 0;

  constructor() {
    super({ key: SCENE_KEYS.CHAR_SELECT });
  }

  create(): void {
    // Reset camera in case we arrived from LevelScene which uses startFollow + setBounds.
    // Without this, camera scroll bleeds over and the cards appear offset / clipped.
    this.cameras.main.setScroll(0, 0);
    this.cameras.main.resetFX();
    this.cameras.main.removeBounds(); // clear any bounds set by LevelScene

    this.state = GameState.getInstance();
    this.currentHeroId = this.state.selectedHero || 'communityCreator';

    if (this.textures.exists(ASSET_KEYS.CHARACTER_SELECT_SCREEN)) {
      const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEYS.CHARACTER_SELECT_SCREEN);

      const sourceWidth = bg.width || 1672;
      const sourceHeight = bg.height || 941;
      const scaleX = GAME_WIDTH / sourceWidth;
      const scaleY = GAME_HEIGHT / sourceHeight;
      this.bgScale = Math.min(scaleX, scaleY);

      bg.setScale(this.bgScale);
      bg.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

  private buildHeroCards(): void {
    const cardW = 320;
    const cardH = 320;
    const spacing = 40;
    const totalW = HEROES.length * cardW + (HEROES.length - 1) * spacing;
    const startX = (GAME_WIDTH - totalW) / 2;

    HEROES.forEach((hero, i) => {
      const x = startX + i * (cardW + spacing);
      const y = 110;

      const container = this.add.container(x, y);

      // Card background
      const cardBg = this.add.graphics();
      cardBg.fillStyle(COLORS.UI_PRIMARY, 0.7);
      cardBg.fillRoundedRect(0, 0, cardW, cardH, 10);
      cardBg.lineStyle(2, hero.primaryColor, 0.5);
      cardBg.strokeRoundedRect(0, 0, cardW, cardH, 10);
      container.add(cardBg);

      // Hero preview uses the same cleaned real sprites that appear in-game.
      const spriteKey = `hero_${hero.id}_idle`;
      const fallbackKey = `${hero.id}_idle`;
      const heroImg = this.add.sprite(
        cardW / 2,
        100,
        this.textures.exists(spriteKey) ? spriteKey : fallbackKey,
        0
      );
      heroImg.setDisplaySize(78, 90);
      const idleAnimKey = `${hero.id}_idle`;
      if (this.anims.exists(idleAnimKey)) {
        heroImg.play(idleAnimKey);
      }
      container.add(heroImg);

      // Glow effect behind hero
      const glow = this.add.graphics();
      glow.fillStyle(hero.primaryColor, 0.15);
      glow.fillCircle(cardW / 2, 100, 55);
      container.addAt(glow, 1);

      // Name
      const nameText = this.add.text(cardW / 2, 162, hero.name, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: cardW - 20 },
      }).setOrigin(0.5, 0);
      container.add(nameText);

      // Subtitle
      const subtitleText = this.add.text(cardW / 2, 185, hero.subtitle, {
        fontSize: '12px',
        color: `#${hero.primaryColor.toString(16).padStart(6, '0')}`,
        fontFamily: 'monospace',
        align: 'center',
      }).setOrigin(0.5, 0);
      container.add(subtitleText);

      // Ability name
      const abilityLabel = this.add.text(16, 214, `⚡ ${hero.abilityName}`, {
        fontSize: '12px',
        color: '#F5A623',
        fontFamily: 'monospace',
      });
      container.add(abilityLabel);

      // Stats bars
      const stats = [
        { label: 'HP', value: hero.hp / 150 },
        { label: 'SPD', value: hero.speed / 270 },
        { label: 'ATK', value: hero.attackDamage / 20 },
      ];

      stats.forEach((stat, si) => {
        const sy = 240 + si * 20;
        container.add(this.add.text(16, sy, stat.label, {
          fontSize: '11px',
          color: '#778899',
          fontFamily: 'monospace',
        }));
        // Bar background
        const barBg = this.add.graphics();
        barBg.fillStyle(0x1A3A5C, 0.8);
        barBg.fillRect(48, sy + 1, 200, 10);
        container.add(barBg);
        // Bar fill
        const barFill = this.add.graphics();
        barFill.fillStyle(hero.primaryColor, 0.9);
        barFill.fillRect(48, sy + 1, 200 * stat.value, 10);
        container.add(barFill);
      });
      this.bgX = bg.x - (sourceWidth * this.bgScale) / 2;
      this.bgY = bg.y - (sourceHeight * this.bgScale) / 2;

      this.buildHitZones(sourceWidth, sourceHeight);
    } else {
      this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2, 'CHAR SELECT SCREEN MISSING', { color: '#f00' }).setOrigin(0.5);
    }

    if (SHOW_SELECTION_OVERLAY) {
      this.selectionGraphics = this.add.graphics();
      this.updateSelectionOverlay();
    }
  }

  private createImageButtonFromSourceRect(
    sourceWidth: number,
    sourceHeight: number,
    rect: { x: number; y: number; width: number; height: number },
    callback: () => void,
    debug: boolean = false
  ): Phaser.GameObjects.Zone {
    const zoneX = this.bgX + (rect.x + rect.width / 2) * this.bgScale;
    const zoneY = this.bgY + (rect.y + rect.height / 2) * this.bgScale;
    const zoneW = rect.width * this.bgScale;
    const zoneH = rect.height * this.bgScale;

    const zone = this.add.zone(zoneX, zoneY, zoneW, zoneH).setInteractive({ useHandCursor: true });

    zone.on('pointerup', () => {
      callback();
    });

    if (debug) {
      const graphics = this.add.graphics();
      graphics.lineStyle(2, 0xff0000, 0.5);
      graphics.strokeRect(zoneX - zoneW/2, zoneY - zoneH/2, zoneW, zoneH);
    }

    return zone;
  }

  private buildHitZones(w: number, h: number): void {
    const DEBUG = false;

    // Panels
    this.createImageButtonFromSourceRect(w, h, this.panelsData.communityCreator.rect, () => this.selectHero('communityCreator'), DEBUG);
    this.createImageButtonFromSourceRect(w, h, this.panelsData.civicCoder.rect, () => this.selectHero('civicCoder'), DEBUG);
    this.createImageButtonFromSourceRect(w, h, this.panelsData.digitalEquityAdvocate.rect, () => this.selectHero('digitalEquityAdvocate'), DEBUG);

    // Back Button
    this.createImageButtonFromSourceRect(w, h, { x: 380, y: 832, width: 603-380, height: 905-832 }, () => {
      AudioSystem.playMenuSelect();
      this.scene.start(SCENE_KEYS.MAIN_MENU);
    }, DEBUG);

    // Confirm Button
    this.createImageButtonFromSourceRect(w, h, { x: 640, y: 827, width: 995-640, height: 908-827 }, () => {
      AudioSystem.playCheckpoint();
      this.state.selectedHero = this.currentHeroId;
      this.state.save();
      this.cameras.main.flash(300, 74, 144, 217, false);
      this.time.delayedCall(300, () => {
        this.scene.start(SCENE_KEYS.WORLD_MAP);
      });
    }, DEBUG);

    // View Stats
    this.createImageButtonFromSourceRect(w, h, { x: 1025, y: 832, width: 1258-1025, height: 905-832 }, () => {
      this.showToast("Stats overlay coming soon");
    }, DEBUG);

    // Settings
    this.createImageButtonFromSourceRect(w, h, { x: 1490, y: 35, width: 1635-1490, height: 90-35 }, () => {
      this.showToast("Settings coming soon");
    }, DEBUG);

    // Arrows
    this.createImageButtonFromSourceRect(w, h, { x: 0, y: 395, width: 60, height: 500-395 }, () => {
      this.cycleHero(-1);
    }, DEBUG);
    this.createImageButtonFromSourceRect(w, h, { x: 1610, y: 395, width: 1672-1610, height: 500-395 }, () => {
      this.cycleHero(1);
    }, DEBUG);

    // Keyboard support
    this.input.keyboard?.on('keydown-LEFT', () => this.cycleHero(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.cycleHero(1));
  }

  private selectHero(id: HeroId): void {
    if (this.currentHeroId !== id) {
      this.currentHeroId = id;
      AudioSystem.playMenuSelect();
      this.updateSelectionOverlay();
    }
  }

  private cycleHero(dir: number): void {
    let idx = this.heroIds.indexOf(this.currentHeroId);
    idx = (idx + dir + this.heroIds.length) % this.heroIds.length;
    this.selectHero(this.heroIds[idx]);
  }

  private updateSelectionOverlay(): void {
    if (!SHOW_SELECTION_OVERLAY || !this.selectionGraphics) return;

    this.selectionGraphics.clear();

    const data = this.panelsData[this.currentHeroId];
    const rect = data.rect;

    const x = this.bgX + rect.x * this.bgScale;
    const y = this.bgY + rect.y * this.bgScale;
    const w = rect.width * this.bgScale;
    const h = rect.height * this.bgScale;

    // Neon outline
    this.selectionGraphics.lineStyle(4, data.color, 0.8);
    this.selectionGraphics.strokeRoundedRect(x, y, w, h, 16 * this.bgScale);

    // Inner glow
    this.selectionGraphics.lineStyle(2, 0xffffff, 0.5);
    this.selectionGraphics.strokeRoundedRect(x + 2, y + 2, w - 4, h - 4, 14 * this.bgScale);
  }

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
      onComplete: () => toast.destroy()
    });
  }
}
