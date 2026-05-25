// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Game Constants
// ============================================================

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Physics
export const GRAVITY = 650;
export const COYOTE_TIME = 100;      // ms player can jump after leaving platform
export const JUMP_BUFFER_TIME = 120; // ms jump input is remembered before landing

// Combat
export const PLAYER_INVULN_TIME = 800; // ms of invulnerability after damage
export const DAMAGE_TEXT_DURATION = 900;
export const HIT_FLASH_DURATION = 80;
export const KNOCKBACK_FORCE = 180;

// Camera
export const CAMERA_LERP = 0.08;
export const CAMERA_OFFSET_Y = -60; // camera looks slightly ahead/above

// Level world size (all zones use same scroll space, background scales to fit)
export const WORLD_WIDTH = 3360;
export const WORLD_HEIGHT = 940;

// Z-depths / scene layering
export const DEPTH = {
  BG: -10,
  PARALLAX: -5,
  PLATFORMS: 0,
  COLLECTIBLES: 2,
  ENEMIES: 4,
  PLAYER: 5,
  PROJECTILES: 6,
  EFFECTS: 8,
  HUD: 10,
  OVERLAY: 20,
};

// Colors
export const COLORS = {
  // Heroes
  CREATOR_PRIMARY: 0x4A90D9,
  CREATOR_SECONDARY: 0xF5A623,
  CODER_PRIMARY: 0x00CC66,
  CODER_SECONDARY: 0xFFFF00,
  ADVOCATE_PRIMARY: 0x8B4FB4,
  ADVOCATE_SECONDARY: 0xFFD700,

  // Enemies
  DRONE_COLOR: 0x4A7FA5,
  LEECH_COLOR: 0x6B8E23,
  BRUISER_COLOR: 0xFF8C00,
  WISP_COLOR: 0x7B2FBE,
  GATEKEEPER_COLOR: 0x1E90FF,
  SABOTEUR_COLOR: 0x39FF14,
  TURRET_COLOR: 0xCC4400,

  // Bosses
  BOSS1_COLOR: 0x8B0000,
  BOSS2_COLOR: 0x006400,
  BOSS3_COLOR: 0x4B0082,

  // UI
  UI_PRIMARY: 0x1A3A5C,
  UI_SECONDARY: 0x0D2137,
  UI_ACCENT: 0x4A90D9,
  UI_HEALTH: 0x00CC44,
  UI_HEALTH_LOW: 0xFF4444,
  UI_HEALTH_MED: 0xFFAA00,
  UI_TEXT: 0xFFFFFF,
  UI_BORDER: 0x2A5580,

  // Damage types
  DMG_NORMAL: 0xFFFFFF,
  DMG_CRIT: 0xFFD700,
  DMG_ABILITY: 0x4AC8FF,

  // Effects
  CHECKPOINT_COLOR: 0x00FFFF,
  TOKEN_COLOR: 0xFFD700,
  HEALTH_COLOR: 0x00FF88,
  EXIT_COLOR: 0xFFFFAA,

  // Zone theming
  ZONE1_PRIMARY: 0x1A3A6C,
  ZONE1_SECONDARY: 0x2A7A4A,
  ZONE2_PRIMARY: 0x0A3A1A,
  ZONE2_SECONDARY: 0x00FF88,
  ZONE3_PRIMARY: 0x3A0A5C,
  ZONE3_SECONDARY: 0x8B4FB4,
};

// Audio fallback frequencies
export const AUDIO_FREQ = {
  JUMP: 440,
  ATTACK: 220,
  HURT: 180,
  COLLECT: 660,
  CHECKPOINT: 528,
  VICTORY: 784,
  GAME_OVER: 120,
};

// Scenes
export const SCENE_KEYS = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MAIN_MENU: 'MainMenuScene',
  CHAR_SELECT: 'CharacterSelectScene',
  WORLD_MAP: 'WorldMapScene',
  LEVEL: 'LevelScene',
  HUD: 'HUDScene',
  PAUSE: 'PauseScene',
  GALLERY: 'AssetGalleryScene',
  GAME_OVER: 'GameOverScene',
  VICTORY: 'VictoryScene',
};

// Save keys (localStorage)
export const SAVE_KEYS = {
  SELECTED_HERO: 'cc_selectedHero',
  UNLOCKED_ZONES: 'cc_unlockedZones',
  BEST_TOKENS: 'cc_bestTokens',
  UNLOCKED_LORE: 'cc_unlockedLore',
  CHECKPOINT: 'cc_checkpoint',
};
