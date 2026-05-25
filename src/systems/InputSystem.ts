// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Input System
// Wraps Phaser keyboard + virtual joystick state.
// ============================================================

import Phaser from 'phaser';

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
  ability: boolean;
  pause: boolean;
  map: boolean;
  debug: boolean;
  restart: boolean;
  // Analog values from joystick
  axisX: number;
  axisY: number;
}

export class InputSystem {
  private scene: Phaser.Scene;
  private keys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    aKey: Phaser.Input.Keyboard.Key;
    dKey: Phaser.Input.Keyboard.Key;
    wKey: Phaser.Input.Keyboard.Key;
    jKey: Phaser.Input.Keyboard.Key;
    kKey: Phaser.Input.Keyboard.Key;
    pKey: Phaser.Input.Keyboard.Key;
    escKey: Phaser.Input.Keyboard.Key;
    mKey: Phaser.Input.Keyboard.Key;
    gKey: Phaser.Input.Keyboard.Key;
    rKey: Phaser.Input.Keyboard.Key;
    shiftKey: Phaser.Input.Keyboard.Key;
  };

  // Virtual controls state (set by TouchControls)
  public virtualLeft: boolean = false;
  public virtualRight: boolean = false;
  public virtualJump: boolean = false;
  public virtualAttack: boolean = false;
  public virtualAbility: boolean = false;
  public virtualAxisX: number = 0;

  // One-shot flags (consumed after read)
  private jumpPressed: boolean = false;
  private attackPressed: boolean = false;
  private abilityPressed: boolean = false;
  private pausePressed: boolean = false;
  private mapPressed: boolean = false;
  private debugPressed: boolean = false;
  private restartPressed: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeys();
  }

  private setupKeys(): void {
    const kb = this.scene.input.keyboard!;
    this.keys = {
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      aKey: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      dKey: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      wKey: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      jKey: kb.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      kKey: kb.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      pKey: kb.addKey(Phaser.Input.Keyboard.KeyCodes.P),
      escKey: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      mKey: kb.addKey(Phaser.Input.Keyboard.KeyCodes.M),
      gKey: kb.addKey(Phaser.Input.Keyboard.KeyCodes.G),
      rKey: kb.addKey(Phaser.Input.Keyboard.KeyCodes.R),
      shiftKey: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
    };

    // Register one-shot key listeners
    this.keys.space.on('down', () => { this.jumpPressed = true; });
    this.keys.up.on('down', () => { this.jumpPressed = true; });
    this.keys.wKey.on('down', () => { this.jumpPressed = true; });
    this.keys.jKey.on('down', () => { this.attackPressed = true; });
    this.keys.kKey.on('down', () => { this.abilityPressed = true; });
    this.keys.shiftKey.on('down', () => { this.abilityPressed = true; });
    this.keys.pKey.on('down', () => { this.pausePressed = true; });
    this.keys.escKey.on('down', () => { this.pausePressed = true; });
    this.keys.mKey.on('down', () => { this.mapPressed = true; });
    this.keys.gKey.on('down', () => { this.debugPressed = true; });
    this.keys.rKey.on('down', () => { this.restartPressed = true; });
  }

  /** Read current input state. One-shot flags are consumed. */
  read(): InputState {
    const left = this.keys.left.isDown || this.keys.aKey.isDown || this.virtualLeft || this.virtualAxisX < -0.3;
    const right = this.keys.right.isDown || this.keys.dKey.isDown || this.virtualRight || this.virtualAxisX > 0.3;

    const jump = this.jumpPressed || this.virtualJump;
    const attack = this.attackPressed || this.virtualAttack;
    const ability = this.abilityPressed || this.virtualAbility;

    const state: InputState = {
      left,
      right,
      jump,
      attack,
      ability,
      pause: this.pausePressed,
      map: this.mapPressed,
      debug: this.debugPressed,
      restart: this.restartPressed,
      axisX: this.virtualAxisX !== 0 ? this.virtualAxisX : (right ? 1 : left ? -1 : 0),
      axisY: 0,
    };

    // Consume one-shot flags
    this.jumpPressed = false;
    this.attackPressed = false;
    this.abilityPressed = false;
    this.pausePressed = false;
    this.mapPressed = false;
    this.debugPressed = false;
    this.restartPressed = false;

    // Also consume virtual one-shots
    this.virtualJump = false;
    this.virtualAttack = false;
    this.virtualAbility = false;

    return state;
  }

  destroy(): void {
    // Keys are auto-cleaned by scene
  }
}
