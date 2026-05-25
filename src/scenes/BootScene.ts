// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Boot Scene
// Minimal first scene. Sets scale mode and moves to Preload.
// ============================================================

import Phaser from 'phaser';
import { SCENE_KEYS } from '../game/constants';
import { AudioSystem } from '../systems/AudioSystem';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  preload(): void {
    // Nothing to load — just initialize audio context
  }

  create(): void {
    // Initialize audio system
    AudioSystem.init();

    // Unlock audio on first interaction
    this.input.once('pointerdown', () => AudioSystem.unlock());
    this.input.keyboard?.once('keydown', () => AudioSystem.unlock());

    // Move to preload
    this.scene.start(SCENE_KEYS.PRELOAD);
  }
}
