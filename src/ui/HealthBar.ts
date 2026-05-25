// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Health Bar Component
// ============================================================

import Phaser from 'phaser';
import { COLORS } from '../game/constants';

export class HealthBar {
  private scene: Phaser.Scene;
  private bg: Phaser.GameObjects.Graphics;
  private bar: Phaser.GameObjects.Graphics;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private maxHp: number;
  private currentHp: number;
  private showText: boolean;
  private text?: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    maxHp: number,
    showText: boolean = false
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.maxHp = maxHp;
    this.currentHp = maxHp;
    this.showText = showText;

    this.bg = scene.add.graphics();
    this.bar = scene.add.graphics();

    if (showText) {
      this.text = scene.add.text(x + width / 2, y - 2, `${maxHp}/${maxHp}`, {
        fontSize: '11px',
        color: '#ffffff',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 2,
      });
      this.text.setOrigin(0.5, 1);
    }

    this.draw();
  }

  setScrollFactor(x: number, y: number = x): void {
    this.bg.setScrollFactor(x, y);
    this.bar.setScrollFactor(x, y);
    if (this.text) this.text.setScrollFactor(x, y);
  }

  setDepth(depth: number): void {
    this.bg.setDepth(depth);
    this.bar.setDepth(depth + 0.5);
    if (this.text) this.text.setDepth(depth + 1);
  }

  update(currentHp: number, maxHp?: number): void {
    if (maxHp !== undefined) this.maxHp = maxHp;
    this.currentHp = Math.max(0, Math.min(currentHp, this.maxHp));
    this.draw();
    if (this.text) {
      this.text.setText(`${this.currentHp}/${this.maxHp}`);
    }
  }

  setPosition(x: number, y: number): void {
    const dx = x - this.x;
    const dy = y - this.y;
    this.x = x;
    this.y = y;
    this.bg.x += dx;
    this.bg.y += dy;
    this.bar.x += dx;
    this.bar.y += dy;
    if (this.text) {
      this.text.x += dx;
      this.text.y += dy;
    }
    this.draw();
  }

  private draw(): void {
    const ratio = this.currentHp / this.maxHp;
    const barColor = ratio > 0.5 ? COLORS.UI_HEALTH : ratio > 0.25 ? COLORS.UI_HEALTH_MED : COLORS.UI_HEALTH_LOW;

    // Background
    this.bg.clear();
    this.bg.fillStyle(0x000000, 0.6);
    this.bg.fillRoundedRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2, 3);

    // Bar
    this.bar.clear();
    if (ratio > 0) {
      this.bar.fillStyle(barColor, 0.9);
      this.bar.fillRoundedRect(this.x, this.y, this.width * ratio, this.height, 2);
    }
  }

  destroy(): void {
    this.bg.destroy();
    this.bar.destroy();
    if (this.text) this.text.destroy();
  }

  setVisible(visible: boolean): void {
    this.bg.setVisible(visible);
    this.bar.setVisible(visible);
    if (this.text) this.text.setVisible(visible);
  }
}
