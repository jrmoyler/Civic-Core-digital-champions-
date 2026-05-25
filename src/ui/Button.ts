// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Reusable Button Component
// ============================================================

import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { AudioSystem } from '../systems/AudioSystem';

export interface ButtonConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  fontSize?: number;
  bgColor?: number;
  borderColor?: number;
  textColor?: string;
  onClick: () => void;
}

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private config: ButtonConfig;
  private isHovered: boolean = false;

  constructor(scene: Phaser.Scene, config: ButtonConfig) {
    super(scene, config.x, config.y);
    this.config = config;
    scene.add.existing(this);

    // Background
    this.bg = scene.add.graphics();
    this.add(this.bg);

    // Label
    this.label = scene.add.text(0, 0, config.label, {
      fontSize: `${config.fontSize ?? 18}px`,
      color: config.textColor ?? '#ffffff',
      fontFamily: 'monospace',
    });
    this.label.setOrigin(0.5, 0.5);
    this.add(this.label);

    this.draw(false);
    this.setupInteraction();
  }

  private draw(hovered: boolean): void {
    const { width, height, bgColor, borderColor } = this.config;
    const bg = bgColor ?? COLORS.UI_PRIMARY;
    const border = borderColor ?? COLORS.UI_ACCENT;
    const alpha = hovered ? 0.95 : 0.75;

    this.bg.clear();

    // Shadow
    this.bg.fillStyle(0x000000, 0.5);
    this.bg.fillRoundedRect(-width / 2 + 3, -height / 2 + 3, width, height, 8);

    // Background
    this.bg.fillStyle(bg, alpha);
    this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);

    // Border
    this.bg.lineStyle(hovered ? 3 : 2, border, hovered ? 1 : 0.7);
    this.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);

    // Hover glow
    if (hovered) {
      this.bg.lineStyle(6, border, 0.2);
      this.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);
    }
  }

  private setupInteraction(): void {
    const { width, height, onClick } = this.config;
    const zone = this.scene.add.zone(this.x, this.y, width + 10, height + 10);
    zone.setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      this.isHovered = true;
      this.draw(true);
      this.label.setScale(1.05);
    });

    zone.on('pointerout', () => {
      this.isHovered = false;
      this.draw(false);
      this.label.setScale(1);
    });

    zone.on('pointerdown', () => {
      AudioSystem.playMenuSelect();
      this.setScale(0.95);
    });

    zone.on('pointerup', () => {
      this.setScale(1);
      onClick();
    });
  }

  setLabel(text: string): void {
    this.label.setText(text);
  }

  setEnabled(enabled: boolean): void {
    this.setAlpha(enabled ? 1 : 0.4);
    // Note: interaction is on a separate zone — track separately if needed
  }
}
