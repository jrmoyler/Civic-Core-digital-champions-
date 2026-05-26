// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Phaser Game Configuration
// Physics: Phaser Matter.js (bundled) for rigid-body simulation
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENE_KEYS } from './constants';

import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { CharacterSelectScene } from '../scenes/CharacterSelectScene';
import { WorldMapScene } from '../scenes/WorldMapScene';
import { LevelScene } from '../scenes/LevelScene';
import { HUDScene } from '../scenes/HUDScene';
import { PauseScene } from '../scenes/PauseScene';
import { AssetGalleryScene } from '../scenes/AssetGalleryScene';
import { GameOverScene } from '../scenes/GameOverScene';
import { VictoryScene } from '../scenes/VictoryScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,       // Force WebGL for Phaser FX pipeline
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0a0a1a',
  transparent: false,
  pixelArt: false,
  antialias: true,
  roundPixels: false,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },

  // ── Matter.js replaces Arcade physics ──────────────────────
  // gravity.y = 0.18 px/frame² ≈ 650 px/s² at 60 fps
  // (Arcade used 650 px/s²; Matter works in px/frame units)
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 0.18 },
      debug: false,
      setBounds: false, // World bounds set per-level in LevelScene.create()
      // Improve solver stability for platformers
      positionIterations: 6,
      velocityIterations: 4,
      constraintIterations: 2,
    },
  },

  input: {
    keyboard: true,
    mouse: true,
    touch: true,
    gamepad: false,
  },

  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    CharacterSelectScene,
    WorldMapScene,
    LevelScene,
    HUDScene,
    PauseScene,
    AssetGalleryScene,
    GameOverScene,
    VictoryScene,
  ],
};
