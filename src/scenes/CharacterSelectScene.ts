// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Character Select Scene
// ============================================================

import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';
import { ASSET_KEYS } from '../assets/assetManifest';
import { HEROES } from '../data/heroes';
import { GameState } from '../game/state/GameState';
import { AudioSystem } from '../systems/AudioSystem';
import type { HeroId } from '../game/types';

export class CharacterSelectScene extends Phaser.Scene {
  private selectedIndex: number = 0;
  private state!: GameState;
  private heroCards: Phaser.GameObjects.Container[] = [];
  private detailPanel!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENE_KEYS.CHAR_SELECT });
  }

  create(): void {
    this.state = GameState.getInstance();
    // Pre-select previously chosen hero
    this.selectedIndex = HEROES.findIndex(h => h.id === this.state.selectedHero) ?? 0;
    if (this.selectedIndex < 0) this.selectedIndex = 0;

    this.buildBackground();
    this.buildHeader();
    this.buildHeroCards();
    this.buildDetailPanel();
    this.buildNavigationHints();
    this.updateSelection();

    // Keyboard navigation
    this.input.keyboard?.on('keydown-LEFT', () => this.navigate(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.navigate(1));
    this.input.keyboard?.on('keydown-SPACE', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start(SCENE_KEYS.MAIN_MENU));
  }

  private buildBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x050a14, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Hero sheet as background
    if (this.textures.exists(ASSET_KEYS.HEROES_SHEET)) {
      const sheet = this.add.image(GAME_WIDTH / 2, 200, ASSET_KEYS.HEROES_SHEET);
      sheet.setDisplaySize(GAME_WIDTH, 280);
      sheet.setAlpha(0.12);
    }

    // Decorative gradient
    const grad = this.add.graphics();
    grad.fillGradientStyle(0x0a0a2a, 0x0a0a2a, 0x0a1428, 0x0a1428, 1);
    grad.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private buildHeader(): void {
    this.add.text(GAME_WIDTH / 2, 36, 'CHOOSE YOUR CHAMPION', {
      fontSize: '28px',
      color: '#F5A623',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      letterSpacing: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 70, 'SELECT HERO · ← → NAVIGATE · SPACE CONFIRM', {
      fontSize: '12px',
      color: '#446688',
      fontFamily: 'monospace',
      letterSpacing: 2,
    }).setOrigin(0.5);
  }

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

      // Hero preview from sheet (or procedural sprite)
      const heroImg = this.add.image(cardW / 2, 100, `${hero.id}_idle`);
      heroImg.setDisplaySize(64, 90);
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

      // Select button
      const selectBtn = this.add.graphics();
      selectBtn.fillStyle(hero.primaryColor, 0.8);
      selectBtn.fillRoundedRect(cardW / 2 - 70, 295, 140, 30, 6);
      container.add(selectBtn);

      const selectText = this.add.text(cardW / 2, 310, 'SELECT', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      }).setOrigin(0.5, 0.5);
      container.add(selectText);

      // Interaction
      const zone = this.add.zone(x + cardW / 2, y + cardH / 2, cardW, cardH).setInteractive({ useHandCursor: true });

      zone.on('pointerover', () => {
        if (this.selectedIndex !== i) {
          this.selectedIndex = i;
          this.updateSelection();
          AudioSystem.playMenuSelect();
        }
      });

      zone.on('pointerup', () => {
        this.selectedIndex = i;
        this.confirmSelection();
      });

      this.heroCards.push(container);
    });
  }

  private buildDetailPanel(): void {
    this.detailPanel = this.add.container(0, 448);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0a0e1c, 0.85);
    panelBg.fillRect(0, 0, GAME_WIDTH, 240);
    panelBg.lineStyle(1, COLORS.UI_BORDER, 0.4);
    panelBg.strokeRect(0, 0, GAME_WIDTH, 240);
    this.detailPanel.add(panelBg);
  }

  private buildNavigationHints(): void {
    // Back button
    const backBtn = this.add.text(60, GAME_HEIGHT - 36, '← BACK', {
      fontSize: '14px',
      color: '#446688',
      fontFamily: 'monospace',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerup', () => {
      AudioSystem.playMenuSelect();
      this.scene.start(SCENE_KEYS.MAIN_MENU);
    });
    backBtn.on('pointerover', () => backBtn.setColor('#88aacc'));
    backBtn.on('pointerout', () => backBtn.setColor('#446688'));

    // Confirm button
    const confirmBtn = this.add.text(GAME_WIDTH - 60, GAME_HEIGHT - 36, 'CONFIRM →', {
      fontSize: '14px',
      color: '#F5A623',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    confirmBtn.on('pointerup', () => this.confirmSelection());
    confirmBtn.on('pointerover', () => confirmBtn.setScale(1.05));
    confirmBtn.on('pointerout', () => confirmBtn.setScale(1));
  }

  private navigate(dir: number): void {
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + dir, 0, HEROES.length);
    this.updateSelection();
    AudioSystem.playMenuSelect();
  }

  private updateSelection(): void {
    const hero = HEROES[this.selectedIndex];

    // Update card highlights
    this.heroCards.forEach((card, i) => {
      const isSelected = i === this.selectedIndex;
      this.tweens.add({
        targets: card,
        scaleX: isSelected ? 1.06 : 1,
        scaleY: isSelected ? 1.06 : 1,
        alpha: isSelected ? 1 : 0.65,
        duration: 180,
      });
    });

    // Update detail panel
    this.detailPanel.removeAll(true);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0a0e1c, 0.9);
    panelBg.fillRect(0, 0, GAME_WIDTH, 240);
    panelBg.lineStyle(1, hero.primaryColor, 0.3);
    panelBg.strokeRect(0, 0, GAME_WIDTH, 240);
    this.detailPanel.add(panelBg);

    const colorHex = '#' + hero.primaryColor.toString(16).padStart(6, '0');

    // Hero name
    this.detailPanel.add(this.add.text(80, 20, hero.name.toUpperCase(), {
      fontSize: '22px',
      color: colorHex,
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }));

    // Role
    this.detailPanel.add(this.add.text(80, 50, hero.subtitle, {
      fontSize: '14px',
      color: '#aabbcc',
      fontFamily: 'monospace',
    }));

    // Ability description
    this.detailPanel.add(this.add.text(80, 78, `CIVIC ABILITY: ${hero.abilityName}`, {
      fontSize: '13px',
      color: '#F5A623',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }));

    this.detailPanel.add(this.add.text(80, 98, hero.abilityDescription, {
      fontSize: '12px',
      color: '#889aaa',
      fontFamily: 'monospace',
      wordWrap: { width: 500 },
    }));

    // Lore
    this.detailPanel.add(this.add.text(80, 138, `"${hero.lore}"`, {
      fontSize: '12px',
      color: '#556677',
      fontFamily: 'monospace',
      fontStyle: 'italic',
      wordWrap: { width: 500 },
      lineSpacing: 3,
    }));

    // Full stats panel right side
    const statsX = 700;
    this.detailPanel.add(this.add.text(statsX, 20, 'STATS', {
      fontSize: '14px',
      color: '#aabbcc',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }));

    const statList = [
      { label: 'HP', val: `${hero.hp}`, pct: hero.hp / 150 },
      { label: 'SPEED', val: `${hero.speed}`, pct: hero.speed / 270 },
      { label: 'JUMP', val: `${hero.jumpVelocity}`, pct: hero.jumpVelocity / 500 },
      { label: 'ATTACK', val: `${hero.attackDamage}`, pct: hero.attackDamage / 20 },
      { label: 'ABILITY DMG', val: `${hero.abilityDamage}`, pct: hero.abilityDamage / 38 },
      { label: 'COOLDOWN', val: `${hero.abilityCooldown}s`, pct: 1 - hero.abilityCooldown / 10 },
    ];

    statList.forEach((s, si) => {
      const sy = 44 + si * 28;
      this.detailPanel.add(this.add.text(statsX, sy, s.label, {
        fontSize: '11px',
        color: '#778899',
        fontFamily: 'monospace',
      }));
      this.detailPanel.add(this.add.text(statsX + 170, sy, s.val, {
        fontSize: '11px',
        color: '#ffffff',
        fontFamily: 'monospace',
      }));
      const barBg = this.add.graphics();
      barBg.fillStyle(0x1A3A5C, 0.6);
      barBg.fillRect(statsX, sy + 14, 200, 6);
      this.detailPanel.add(barBg);
      const barFill = this.add.graphics();
      barFill.fillStyle(hero.primaryColor, 0.85);
      barFill.fillRect(statsX, sy + 14, 200 * s.pct, 6);
      this.detailPanel.add(barFill);
    });
  }

  private confirmSelection(): void {
    const hero = HEROES[this.selectedIndex];
    this.state.selectedHero = hero.id as HeroId;
    this.state.save();
    AudioSystem.playCheckpoint();
    this.cameras.main.flash(300, 74, 144, 217, false);
    this.time.delayedCall(300, () => {
      this.scene.start(SCENE_KEYS.WORLD_MAP);
    });
  }
}
