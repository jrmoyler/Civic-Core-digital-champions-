// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Dialogue Box Component
// Shows NPC / lore dialogue with scrollFactor=0 (HUD space)
// ============================================================

import Phaser from 'phaser';
import { COLORS, DEPTH } from '../game/constants';

export class DialogueBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private bodyText: Phaser.GameObjects.Text;
  private promptText: Phaser.GameObjects.Text;
  private isVisible: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const W = 640;
    const H = 130;
    const x = (scene.scale.width - W) / 2;
    const y = scene.scale.height - H - 20;

    this.container = scene.add.container(x, y);
    this.container.setScrollFactor(0);
    this.container.setDepth(DEPTH.OVERLAY);

    this.bg = scene.add.graphics();
    this.bg.fillStyle(COLORS.UI_SECONDARY, 0.92);
    this.bg.fillRoundedRect(0, 0, W, H, 10);
    this.bg.lineStyle(2, COLORS.UI_ACCENT, 0.9);
    this.bg.strokeRoundedRect(0, 0, W, H, 10);
    this.container.add(this.bg);

    this.nameText = scene.add.text(16, 10, '', {
      fontSize: '14px',
      color: '#4ac8ff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    this.container.add(this.nameText);

    this.bodyText = scene.add.text(16, 32, '', {
      fontSize: '13px',
      color: '#ffffff',
      fontFamily: 'monospace',
      wordWrap: { width: W - 32 },
      lineSpacing: 4,
    });
    this.container.add(this.bodyText);

    this.promptText = scene.add.text(W - 16, H - 14, '▶ [J] Continue', {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    });
    this.promptText.setOrigin(1, 1);
    this.container.add(this.promptText);

    this.container.setVisible(false);
  }

  show(speaker: string, text: string, onDismiss?: () => void): void {
    this.nameText.setText(speaker.toUpperCase());
    this.bodyText.setText(text);
    this.container.setVisible(true);
    this.isVisible = true;

    // Typewriter effect
    const full = text;
    let progress = 0;
    const timer = this.scene.time.addEvent({
      delay: 25,
      repeat: full.length,
      callback: () => {
        progress++;
        this.bodyText.setText(full.slice(0, progress));
      },
    });

    // Dismiss on J or touch
    const dismiss = (): void => {
      timer.destroy();
      this.bodyText.setText(full);

      this.scene.time.delayedCall(80, () => {
        this.hide();
        if (onDismiss) onDismiss();
      });
    };

    this.scene.input.keyboard?.once('keydown-J', dismiss);
    this.scene.input.once('pointerdown', dismiss);
  }

  hide(): void {
    this.container.setVisible(false);
    this.isVisible = false;
  }

  get visible(): boolean {
    return this.isVisible;
  }

  destroy(): void {
    this.container.destroy();
  }
}
