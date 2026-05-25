// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Phaser Game Configuration
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
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0a0a1a',
  pixelArt: false,
  antialias: true,
  roundPixels: false,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 650 },
      debug: false,
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
