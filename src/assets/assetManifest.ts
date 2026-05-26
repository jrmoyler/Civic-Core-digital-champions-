// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Asset Manifest
// All paths relative to public/ directory.
//
// CANONICAL ASSET FILENAMES — place files in public/assets/source/:
//   heroes_sheet.png         - Hero sprite reference sheet
//   enemies_hazards_sheet.png - Enemy/hazard reference sheet
//   bosses_npcs_objects_sheet.png - Bosses, NPCs, objects sheet
//   zone1_tileset_sheet.png  - Zone 1 tileset/parallax sheet
//   zone2_tileset_sheet.png  - Zone 2 tileset/parallax sheet
//   zone3_tileset_sheet.png  - Zone 3 tileset/parallax sheet
//   ui_hud_sheet.png         - UI/HUD/controls reference sheet
//   collectibles_sheet.png   - Collectibles/power-ups sheet
//   zone1_blank_map.png      - Zone 1 playable level background
//   zone2_blank_map.png      - Zone 2 playable level background
//   zone3_blank_map.png      - Zone 3 playable level background
// ============================================================

export const ASSETS = {
  // Reference sheets (used in Asset Gallery + for context)
  sheets: {
    heroes: 'assets/source/heroes_sheet.png',
    enemiesHazards: 'assets/source/enemies_hazards_sheet.png',
    bossesNpcsObjects: 'assets/source/bosses_npcs_objects_sheet.png',
    zone1Tileset: 'assets/source/zone1_tileset_sheet.png',
    zone2Tileset: 'assets/source/zone2_tileset_sheet.png',
    zone3Tileset: 'assets/source/zone3_tileset_sheet.png',
    uiHud: 'assets/source/ui_hud_sheet.png',
    collectibles: 'assets/source/collectibles_sheet.png',
  },
  // Playable level backgrounds + context screens
  uiScreens: {
    titleScreen: "assets/source/ui/title_screen.png",
    characterSelectScreen: "assets/source/ui/character_select_screen.png",
  },
  avatars: {
    communityCreator: "assets/source/ui/avatar_community_creator.png",
    civicCoder: "assets/source/ui/avatar_civic_coder.png",
    digitalEquityAdvocate: "assets/source/ui/avatar_digital_equity_advocate.png",
  },
  screens: {
    zone1Blank: 'assets/source/zone1_blank_map.png',
    zone2Blank: 'assets/source/zone2_blank_map.png',
    zone3Blank: 'assets/source/zone3_blank_map.png',
    // World map and gameplay overview use zone tileset sheets + blank maps
    worldMapRef: 'assets/source/zone1_tileset_sheet.png',
    gameplayOverview: 'assets/source/ui_hud_sheet.png',
  },
} as const;

/** Asset load keys (used with scene.load.image) */
export const ASSET_KEYS = {
  HEROES_SHEET: 'heroesSheet',
  ENEMIES_SHEET: 'enemiesSheet',
  BOSSES_SHEET: 'bossesSheet',
  ZONE1_TILESET: 'zone1Tileset',
  ZONE2_TILESET: 'zone2Tileset',
  ZONE3_TILESET: 'zone3Tileset',
  UI_HUD: 'uiHud',
  COLLECTIBLES_SHEET: 'collectiblesSheet',
  ZONE1_BLANK: 'zone1Blank',
  ZONE2_BLANK: 'zone2Blank',
  ZONE3_BLANK: 'zone3Blank',
  TITLE_SCREEN: 'titleScreen',
  CHARACTER_SELECT_SCREEN: 'characterSelectScreen',
  AVATAR_COMMUNITY_CREATOR: 'avatarCommunityCreator',
  AVATAR_CIVIC_CODER: 'avatarCivicCoder',
  AVATAR_DIGITAL_EQUITY_ADVOCATE: 'avatarDigitalEquityAdvocate',
} as const;

/** Gallery entries — used by AssetGalleryScene to display all images */
export const GALLERY_ENTRIES = [
  {
    key: ASSET_KEYS.HEROES_SHEET,
    label: 'Hero Characters',
    role: 'Playable Heroes — Community Creator, Civic Coder, Digital Equity Advocate',
    path: ASSETS.sheets.heroes,
  },
  {
    key: ASSET_KEYS.ENEMIES_SHEET,
    label: 'Enemies & Hazards',
    role: 'Enemy sprites: Misinformer Drone, Bandwidth Leech, Firewall Bruiser, etc.',
    path: ASSETS.sheets.enemiesHazards,
  },
  {
    key: ASSET_KEYS.BOSSES_SHEET,
    label: 'Bosses, NPCs & Objects',
    role: 'Bosses: Access Denier, Algorithmic Gatekeeper, Blackout Warden + NPCs',
    path: ASSETS.sheets.bossesNpcsObjects,
  },
  {
    key: ASSET_KEYS.ZONE1_TILESET,
    label: 'Zone 1 Tilesets',
    role: 'Community Commons — tile set & parallax asset reference',
    path: ASSETS.sheets.zone1Tileset,
  },
  {
    key: ASSET_KEYS.ZONE2_TILESET,
    label: 'Zone 2 Tilesets',
    role: 'Public Access Intelligence Infrastructure — tile set & parallax reference',
    path: ASSETS.sheets.zone2Tileset,
  },
  {
    key: ASSET_KEYS.ZONE3_TILESET,
    label: 'Zone 3 Tilesets',
    role: 'Empowerment Heights — tile set & parallax reference',
    path: ASSETS.sheets.zone3Tileset,
  },
  {
    key: ASSET_KEYS.UI_HUD,
    label: 'UI / HUD Reference',
    role: 'HUD layout, touch controls, health bars, damage numbers, banners',
    path: ASSETS.sheets.uiHud,
  },
  {
    key: ASSET_KEYS.COLLECTIBLES_SHEET,
    label: 'Collectibles & Power-Ups',
    role: 'Access Tokens, Health Packs, Scrolls, Power-ups, Containers',
    path: ASSETS.sheets.collectibles,
  },
  {
    key: ASSET_KEYS.ZONE1_BLANK,
    label: 'Zone 1 — Community Commons',
    role: 'Blank level map used as Zone 1 playable background',
    path: ASSETS.screens.zone1Blank,
  },
  {
    key: ASSET_KEYS.ZONE2_BLANK,
    label: 'Zone 2 — Public Access Intelligence Infrastructure',
    role: 'Blank level map used as Zone 2 playable background',
    path: ASSETS.screens.zone2Blank,
  },
  {
    key: ASSET_KEYS.ZONE3_BLANK,
    label: 'Zone 3 — Empowerment Heights',
    role: 'Blank level map used as Zone 3 playable background',
    path: ASSETS.screens.zone3Blank,
  },
];
