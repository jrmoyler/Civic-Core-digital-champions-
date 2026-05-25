// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Collision Debug Overlay
// Toggle with G key to show/hide platform collision boxes.
// ============================================================

import Phaser from 'phaser';
import type { PlatformDef } from '../game/types';

export class CollisionDebug {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics | null = null;
  private visible: boolean = false;
  private platforms: PlatformDef[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setup(platforms: PlatformDef[]): void {
    this.platforms = platforms;
    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(100);
    this.graphics.setVisible(false);
    this.draw();
  }

  toggle(): void {
    this.visible = !this.visible;
    if (this.graphics) {
      this.graphics.setVisible(this.visible);
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  private draw(): void {
    if (!this.graphics) return;
    this.graphics.clear();

    for (const p of this.platforms) {
      // Solid platforms: cyan
      // One-way platforms: yellow
      const color = p.oneWay ? 0xffff00 : 0x00ffff;
      this.graphics.lineStyle(2, color, 0.7);
      this.graphics.strokeRect(p.x, p.y, p.width, p.height);

      // Fill with low opacity
      this.graphics.fillStyle(color, 0.08);
      this.graphics.fillRect(p.x, p.y, p.width, p.height);

      // Label one-way
      if (p.oneWay) {
        const label = this.scene.add.text(p.x + p.width / 2, p.y - 12, '↓ one-way', {
          fontSize: '10px',
          color: '#ffff00',
          fontFamily: 'monospace',
        });
        label.setOrigin(0.5, 1);
        label.setDepth(101);
      }
    }
  }

  destroy(): void {
    if (this.graphics) {
      this.graphics.destroy();
      this.graphics = null;
    }
  }
}
