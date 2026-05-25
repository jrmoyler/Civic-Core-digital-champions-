// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Touch / Virtual Controls
// Renders a virtual joystick and action buttons.
// Feeds into InputSystem virtual state.
// ============================================================

import Phaser from 'phaser';
import { COLORS, DEPTH } from '../game/constants';
import type { InputSystem } from '../systems/InputSystem';

export class TouchControls {
  private scene: Phaser.Scene;
  private input: InputSystem;
  private container: Phaser.GameObjects.Container;

  // Joystick
  private joystickBase: Phaser.GameObjects.Graphics;
  private joystickThumb: Phaser.GameObjects.Graphics;
  private joystickActive: boolean = false;
  private joystickPointer: Phaser.Input.Pointer | null = null;
  private joystickOriginX: number = 0;
  private joystickOriginY: number = 0;
  private readonly JOYSTICK_RADIUS = 55;
  private readonly THUMB_RADIUS = 28;

  // Buttons
  private btnJump: Phaser.GameObjects.Graphics;
  private btnAttack: Phaser.GameObjects.Graphics;
  private btnAbility: Phaser.GameObjects.Graphics;

  // Button labels
  private lblJump: Phaser.GameObjects.Text;
  private lblAttack: Phaser.GameObjects.Text;
  private lblAbility: Phaser.GameObjects.Text;

  private visible: boolean = false;

  constructor(scene: Phaser.Scene, input: InputSystem) {
    this.scene = scene;
    this.input = input;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(DEPTH.HUD + 5);

    const W = scene.scale.width;
    const H = scene.scale.height;

    // ── Joystick (bottom-left) ────────────────────────────
    const jx = 100;
    const jy = H - 110;
    this.joystickOriginX = jx;
    this.joystickOriginY = jy;

    this.joystickBase = scene.add.graphics();
    this.joystickBase.fillStyle(0x000000, 0.35);
    this.joystickBase.fillCircle(jx, jy, this.JOYSTICK_RADIUS);
    this.joystickBase.lineStyle(2, COLORS.UI_ACCENT, 0.5);
    this.joystickBase.strokeCircle(jx, jy, this.JOYSTICK_RADIUS);
    this.joystickBase.setScrollFactor(0);
    this.joystickBase.setDepth(DEPTH.HUD + 5);

    this.joystickThumb = scene.add.graphics();
    this.joystickThumb.fillStyle(COLORS.UI_ACCENT, 0.7);
    this.joystickThumb.fillCircle(jx, jy, this.THUMB_RADIUS);
    this.joystickThumb.setScrollFactor(0);
    this.joystickThumb.setDepth(DEPTH.HUD + 6);

    // ── Action Buttons (bottom-right) ─────────────────────
    const bx = W - 80;
    const by = H - 80;

    // Jump: up-right
    this.btnJump = this.makeButton(bx, by - 80, 0x00CC66, '↑');
    this.lblJump = this.makeLabel(bx, by - 80, 'JUMP');

    // Attack: right-mid
    this.btnAttack = this.makeButton(bx + 70, by, COLORS.CREATOR_PRIMARY, '●');
    this.lblAttack = this.makeLabel(bx + 70, by, 'ATK');

    // Ability: left-mid
    this.btnAbility = this.makeButton(bx - 70, by, COLORS.ADVOCATE_PRIMARY, '★');
    this.lblAbility = this.makeLabel(bx - 70, by, 'ABILITY');

    // ── Touch event handling ──────────────────────────────
    scene.input.on('pointerdown', this.onPointerDown, this);
    scene.input.on('pointermove', this.onPointerMove, this);
    scene.input.on('pointerup', this.onPointerUp, this);

    this.setVisible(false);
  }

  private makeButton(x: number, y: number, color: number, _icon: string): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.4);
    g.fillCircle(x, y, 36);
    g.fillStyle(color, 0.75);
    g.fillCircle(x, y, 32);
    g.lineStyle(2, color, 1);
    g.strokeCircle(x, y, 34);
    g.setScrollFactor(0);
    g.setDepth(DEPTH.HUD + 5);
    return g;
  }

  private makeLabel(x: number, y: number, text: string): Phaser.GameObjects.Text {
    const t = this.scene.add.text(x, y, text, {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 2,
    });
    t.setOrigin(0.5, 0.5);
    t.setScrollFactor(0);
    t.setDepth(DEPTH.HUD + 7);
    return t;
  }

  private isNearJoystick(px: number, py: number): boolean {
    const dx = px - this.joystickOriginX;
    const dy = py - this.joystickOriginY;
    return Math.sqrt(dx * dx + dy * dy) <= this.JOYSTICK_RADIUS * 1.5;
  }

  private isNearButton(px: number, py: number, bx: number, by: number): boolean {
    const dx = px - bx;
    const dy = py - by;
    return Math.sqrt(dx * dx + dy * dy) <= 46;
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.visible) return;
    const { x, y } = pointer;

    const W = this.scene.scale.width;
    const H = this.scene.scale.height;
    const bx = W - 80;
    const by = H - 80;

    if (this.isNearJoystick(x, y)) {
      this.joystickActive = true;
      this.joystickPointer = pointer;
      this.updateJoystick(x, y);
    } else if (this.isNearButton(x, y, bx, by - 80)) {
      this.input.virtualJump = true;
    } else if (this.isNearButton(x, y, bx + 70, by)) {
      this.input.virtualAttack = true;
    } else if (this.isNearButton(x, y, bx - 70, by)) {
      this.input.virtualAbility = true;
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.visible || !this.joystickActive || this.joystickPointer?.id !== pointer.id) return;
    this.updateJoystick(pointer.x, pointer.y);
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.visible) return;
    if (this.joystickPointer?.id === pointer.id) {
      this.joystickActive = false;
      this.joystickPointer = null;
      this.input.virtualAxisX = 0;
      this.input.virtualLeft = false;
      this.input.virtualRight = false;
      this.resetJoystickVisual();
    }
  }

  private updateJoystick(px: number, py: number): void {
    const dx = px - this.joystickOriginX;
    const dy = py - this.joystickOriginY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(dist, this.JOYSTICK_RADIUS);
    const angle = Math.atan2(dy, dx);

    const thumbX = this.joystickOriginX + Math.cos(angle) * clamped;
    const thumbY = this.joystickOriginY + Math.sin(angle) * clamped;

    // Redraw thumb
    this.joystickThumb.clear();
    this.joystickThumb.fillStyle(COLORS.UI_ACCENT, 0.85);
    this.joystickThumb.fillCircle(thumbX, thumbY, this.THUMB_RADIUS);

    // Update input state
    const axisX = (dx / this.JOYSTICK_RADIUS) * (clamped / this.JOYSTICK_RADIUS);
    this.input.virtualAxisX = Phaser.Math.Clamp(axisX, -1, 1);
    this.input.virtualLeft = axisX < -0.3;
    this.input.virtualRight = axisX > 0.3;
  }

  private resetJoystickVisual(): void {
    this.joystickThumb.clear();
    this.joystickThumb.fillStyle(COLORS.UI_ACCENT, 0.7);
    this.joystickThumb.fillCircle(this.joystickOriginX, this.joystickOriginY, this.THUMB_RADIUS);
  }

  setVisible(v: boolean): void {
    this.visible = v;
    this.joystickBase.setVisible(v);
    this.joystickThumb.setVisible(v);
    this.btnJump.setVisible(v);
    this.btnAttack.setVisible(v);
    this.btnAbility.setVisible(v);
    this.lblJump.setVisible(v);
    this.lblAttack.setVisible(v);
    this.lblAbility.setVisible(v);
  }

  isVisible(): boolean {
    return this.visible;
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
    this.joystickBase.destroy();
    this.joystickThumb.destroy();
    this.btnJump.destroy();
    this.btnAttack.destroy();
    this.btnAbility.destroy();
    this.lblJump.destroy();
    this.lblAttack.destroy();
    this.lblAbility.destroy();
  }
}
