// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Level Data
//
// Platform rectangles are manually approximated to match the
// blank map images. Use debug key G to show/hide collision
// rectangles for tuning.
//
// World size: 3360 x 940 (all zones)
// Background images are scaled to fill this space.
//
// Coordinate origin: top-left (0,0)
// Y increases downward (Phaser convention)
// ============================================================

import type { LevelData } from '../game/types';

export const LEVELS: LevelData[] = [
  // ──────────────────────────────────────────────────────────
  // ZONE 1 — COMMUNITY COMMONS
  // Blue/green nighttime city. Library, waterfall, community
  // center, floating platforms with cable crane.
  // ──────────────────────────────────────────────────────────
  {
    id: 'zone1',
    name: 'Community Commons',
    subtitle: 'Where every voice builds the future',
    backgroundKey: 'zone1Blank',
    tilesetKey: 'zone1Tileset',
    worldWidth: 3360,
    worldHeight: 940,
    spawn: { x: 120, y: 750 },
    bgColor: 0x0a0e1c,
    ambientColor: 0x1a3a6c,

    // ── Platforms ──────────────────────────────────────────
    // Format: { x, y, width, height }  (top-left corner)
    // Y=860 is the main ground level
    platforms: [
      // Main ground (full width)
      { x: 0, y: 860, width: 3360, height: 80 },

      // === LEFT ZONE (0 – 800) ===
      // Waterfall left edge platform
      { x: 0, y: 720, width: 240, height: 20 },
      // Waterfall hop platform
      { x: 100, y: 600, width: 120, height: 18 },
      // Hidden underground path (below main ground)
      { x: 80, y: 900, width: 480, height: 20, oneWay: true },
      // Low step up from spawn
      { x: 280, y: 800, width: 160, height: 20 },
      // Mid-left floating ledge
      { x: 420, y: 680, width: 200, height: 18 },
      // Library step approach
      { x: 600, y: 760, width: 140, height: 20 },

      // === CENTER ZONE (700 – 1800) ===
      // Mural wall top platform
      { x: 720, y: 620, width: 300, height: 20 },
      // Crane cable platform left
      { x: 820, y: 480, width: 160, height: 18 },
      // Crane cable platform right
      { x: 1040, y: 440, width: 180, height: 18 },
      // Floating textbook platform (stacked books)
      { x: 1200, y: 380, width: 150, height: 20 },
      // High floating platform
      { x: 960, y: 300, width: 120, height: 18 },
      // Mid center step
      { x: 1300, y: 660, width: 220, height: 20 },
      // Bridge to community center
      { x: 1480, y: 720, width: 200, height: 20 },

      // === COMMUNITY CENTER (1600 – 2400) ===
      // CC front steps lower
      { x: 1600, y: 820, width: 180, height: 20 },
      // CC steps mid
      { x: 1700, y: 760, width: 200, height: 20 },
      // CC main entrance level
      { x: 1860, y: 700, width: 420, height: 20 },
      // CC upper floor
      { x: 1900, y: 540, width: 360, height: 20 },
      // CC roof ledge
      { x: 2000, y: 400, width: 200, height: 18 },
      // Floating platform near CC
      { x: 2240, y: 540, width: 180, height: 18 },
      // CC right side
      { x: 2360, y: 680, width: 160, height: 20 },

      // === RIGHT ZONE / LIBRARY (2400 – 3360) ===
      // Library ground level
      { x: 2480, y: 760, width: 360, height: 20 },
      // Library upper platform
      { x: 2560, y: 580, width: 240, height: 18 },
      // Hidden challenge route platform
      { x: 2700, y: 440, width: 140, height: 18 },
      { x: 2820, y: 380, width: 120, height: 18 },
      // Boss approach
      { x: 2980, y: 760, width: 380, height: 20 },
      // Boss arena floor
      { x: 3000, y: 860, width: 360, height: 20 },
    ],

    // ── Enemies ─────────────────────────────────────────────
    enemies: [
      { type: 'misinformerDrone', x: 500, y: 560 },
      { type: 'bandwidthLeech', x: 700, y: 820 },
      { type: 'misinformerDrone', x: 900, y: 420 },
      { type: 'gatekeeperBot', x: 1100, y: 820 },
      { type: 'bandwidthLeech', x: 1350, y: 820 },
      { type: 'signalSaboteur', x: 1550, y: 820 },
      { type: 'misinformerDrone', x: 1700, y: 460 },
      { type: 'firewallBruiser', x: 1950, y: 820 },
      { type: 'glitchTurret', x: 2200, y: 820 },
      { type: 'gatekeeperBot', x: 2500, y: 820 },
      { type: 'signalSaboteur', x: 2700, y: 820 },
      { type: 'darkScreenWisp', x: 2900, y: 600 },
    ],

    // ── Collectibles ────────────────────────────────────────
    collectibles: [
      // Tokens scattered throughout
      { type: 'accessToken', x: 200, y: 830 },
      { type: 'accessToken', x: 320, y: 780 },
      { type: 'accessToken', x: 440, y: 660 },
      { type: 'accessToken', x: 600, y: 740 },
      { type: 'accessToken', x: 760, y: 600 },
      { type: 'accessToken', x: 880, y: 460 },
      { type: 'accessToken', x: 1060, y: 420 },
      { type: 'accessToken', x: 1220, y: 360 },
      { type: 'accessToken', x: 1400, y: 640 },
      { type: 'accessToken', x: 1560, y: 700 },
      { type: 'accessToken', x: 1720, y: 740 },
      { type: 'accessToken', x: 1880, y: 680 },
      { type: 'accessToken', x: 2040, y: 520 },
      { type: 'accessToken', x: 2200, y: 520 },
      { type: 'accessToken', x: 2360, y: 660 },
      { type: 'accessToken', x: 2520, y: 740 },
      { type: 'accessToken', x: 2680, y: 420 },
      { type: 'accessToken', x: 2840, y: 360 },
      { type: 'accessToken', x: 3020, y: 740 },
      // Special items
      { type: 'healthPack', x: 660, y: 560 },
      { type: 'aiLiteracyScroll', x: 1240, y: 360 },
      { type: 'patchBattery', x: 2060, y: 380 },
      { type: 'signalShield', x: 2560, y: 560 },
      { type: 'empowermentShard', x: 2720, y: 420 },
      { type: 'hiddenLorePage', x: 2840, y: 360 },
      { type: 'extraLife', x: 3060, y: 740 },
    ],

    // ── Checkpoint ──────────────────────────────────────────
    checkpoint: { x: 1680, y: 720 },

    // ── Boss ─────────────────────────────────────────────────
    boss: { type: 'accessDenier', x: 3100, y: 800 },

    // ── Exit Beacon ─────────────────────────────────────────
    exit: { x: 3280, y: 820 },
  },

  // ──────────────────────────────────────────────────────────
  // ZONE 2 — PUBLIC ACCESS INTELLIGENCE INFRASTRUCTURE
  // Dark green cyber environment. Multi-tier structures,
  // network nodes, digital corridors, elevator shafts.
  // ──────────────────────────────────────────────────────────
  {
    id: 'zone2',
    name: 'Public Access Intelligence Infrastructure',
    subtitle: 'The network belongs to everyone',
    backgroundKey: 'zone2Blank',
    tilesetKey: 'zone2Tileset',
    worldWidth: 3360,
    worldHeight: 940,
    spawn: { x: 120, y: 800 },
    bgColor: 0x020a04,
    ambientColor: 0x0a2a1a,

    platforms: [
      // Main ground
      { x: 0, y: 880, width: 3360, height: 60 },

      // === LEFT ZONE (0 – 900) ===
      // Terminal dock platform
      { x: 0, y: 780, width: 220, height: 20 },
      // Data waterfall base
      { x: 60, y: 660, width: 150, height: 18 },
      { x: 180, y: 540, width: 200, height: 18 },
      // Network node hop
      { x: 360, y: 720, width: 180, height: 20 },
      { x: 440, y: 580, width: 160, height: 18 },
      { x: 520, y: 440, width: 180, height: 18 },
      // Cross bridge
      { x: 640, y: 740, width: 300, height: 20 },
      { x: 700, y: 600, width: 240, height: 18 },

      // === CENTER ZONE (900 – 2100) ===
      // Moving platform territory (static approximation)
      { x: 920, y: 700, width: 200, height: 18 },
      { x: 1080, y: 560, width: 180, height: 18 },
      // Laser gate platform
      { x: 1200, y: 800, width: 240, height: 20 },
      { x: 1320, y: 640, width: 200, height: 18 },
      { x: 1480, y: 500, width: 200, height: 18 },
      // Zipline landing zone
      { x: 1600, y: 700, width: 220, height: 20 },
      // Server rack platforms
      { x: 1760, y: 760, width: 200, height: 20 },
      { x: 1860, y: 580, width: 180, height: 18 },
      { x: 1980, y: 420, width: 200, height: 18 },
      // Checkpoint area
      { x: 1680, y: 860, width: 240, height: 20 },

      // === RIGHT ZONE (2100 – 3360) ===
      // Firewall gate steps
      { x: 2160, y: 740, width: 200, height: 20 },
      { x: 2300, y: 600, width: 180, height: 18 },
      { x: 2440, y: 460, width: 200, height: 18 },
      // Hidden path / secret floor
      { x: 2600, y: 800, width: 160, height: 18, oneWay: true },
      // Elevator shaft landings
      { x: 2700, y: 720, width: 200, height: 20 },
      { x: 2760, y: 540, width: 200, height: 18 },
      { x: 2820, y: 380, width: 180, height: 18 },
      // Boss approach corridor
      { x: 2980, y: 800, width: 380, height: 20 },
      { x: 3040, y: 880, width: 320, height: 20 },
    ],

    enemies: [
      { type: 'glitchTurret', x: 300, y: 850 },
      { type: 'bandwidthLeech', x: 480, y: 850 },
      { type: 'misinformerDrone', x: 660, y: 560 },
      { type: 'gatekeeperBot', x: 900, y: 850 },
      { type: 'signalSaboteur', x: 1100, y: 850 },
      { type: 'glitchTurret', x: 1400, y: 850 },
      { type: 'firewallBruiser', x: 1550, y: 850 },
      { type: 'darkScreenWisp', x: 1750, y: 440 },
      { type: 'misinformerDrone', x: 1980, y: 380 },
      { type: 'signalSaboteur', x: 2200, y: 850 },
      { type: 'gatekeeperBot', x: 2450, y: 850 },
      { type: 'firewallBruiser', x: 2700, y: 850 },
      { type: 'darkScreenWisp', x: 2900, y: 500 },
    ],

    collectibles: [
      { type: 'accessToken', x: 150, y: 850 },
      { type: 'accessToken', x: 280, y: 760 },
      { type: 'accessToken', x: 420, y: 700 },
      { type: 'accessToken', x: 560, y: 560 },
      { type: 'accessToken', x: 700, y: 580 },
      { type: 'accessToken', x: 840, y: 720 },
      { type: 'accessToken', x: 1000, y: 680 },
      { type: 'accessToken', x: 1160, y: 540 },
      { type: 'accessToken', x: 1300, y: 820 },
      { type: 'accessToken', x: 1460, y: 480 },
      { type: 'accessToken', x: 1620, y: 680 },
      { type: 'accessToken', x: 1780, y: 740 },
      { type: 'accessToken', x: 1940, y: 400 },
      { type: 'accessToken', x: 2120, y: 720 },
      { type: 'accessToken', x: 2280, y: 580 },
      { type: 'accessToken', x: 2440, y: 440 },
      { type: 'accessToken', x: 2620, y: 780 },
      { type: 'accessToken', x: 2780, y: 520 },
      { type: 'accessToken', x: 2940, y: 780 },
      { type: 'accessToken', x: 3100, y: 780 },
      // Special items
      { type: 'healthPack', x: 700, y: 680 },
      { type: 'aiLiteracyScroll', x: 1980, y: 400 },
      { type: 'patchBattery', x: 1500, y: 480 },
      { type: 'signalShield', x: 2460, y: 440 },
      { type: 'empowermentShard', x: 2820, y: 360 },
      { type: 'hiddenLorePage', x: 2620, y: 780 },
    ],

    checkpoint: { x: 1780, y: 820 },
    boss: { type: 'algorithmicGatekeeper', x: 3100, y: 800 },
    exit: { x: 3280, y: 840 },
  },

  // ──────────────────────────────────────────────────────────
  // ZONE 3 — EMPOWERMENT HEIGHTS
  // Purple/violet crystal towers. Floating platforms, beacon
  // spires, grand architecture. Final zone.
  // ──────────────────────────────────────────────────────────
  {
    id: 'zone3',
    name: 'Empowerment Heights',
    subtitle: 'Where the Core Beacon shines for all',
    backgroundKey: 'zone3Blank',
    tilesetKey: 'zone3Tileset',
    worldWidth: 3360,
    worldHeight: 940,
    spawn: { x: 120, y: 820 },
    bgColor: 0x080410,
    ambientColor: 0x2a0a4c,

    platforms: [
      // Main ground
      { x: 0, y: 880, width: 3360, height: 60 },

      // === LEFT ZONE (0 – 900) ===
      { x: 0, y: 780, width: 200, height: 20 },
      { x: 140, y: 660, width: 180, height: 18 },
      { x: 300, y: 740, width: 200, height: 20 },
      { x: 400, y: 600, width: 180, height: 18 },
      { x: 540, y: 500, width: 160, height: 18 },
      { x: 640, y: 720, width: 240, height: 20 },

      // === CENTER ZONE LOWER (900 – 1800) ===
      { x: 840, y: 760, width: 220, height: 20 },
      { x: 960, y: 620, width: 200, height: 18 },
      { x: 1100, y: 500, width: 180, height: 18 },
      { x: 1240, y: 740, width: 240, height: 20 },
      // Crystal spire platforms (floating)
      { x: 1380, y: 600, width: 160, height: 18 },
      { x: 1480, y: 460, width: 180, height: 18 },
      { x: 1600, y: 340, width: 160, height: 18 },
      // Lore alcove hidden path
      { x: 1200, y: 400, width: 120, height: 18, oneWay: true },
      { x: 1320, y: 320, width: 100, height: 18, oneWay: true },

      // === CENTER ZONE UPPER (1800 – 2600) ===
      { x: 1780, y: 720, width: 240, height: 20 },
      { x: 1900, y: 560, width: 200, height: 18 },
      { x: 2040, y: 400, width: 200, height: 18 },
      // Beacon tower approach
      { x: 2200, y: 660, width: 200, height: 20 },
      { x: 2320, y: 500, width: 180, height: 18 },
      { x: 2440, y: 360, width: 200, height: 18 },
      // High crystal platform
      { x: 2560, y: 260, width: 160, height: 18 },
      { x: 2600, y: 720, width: 180, height: 20 },

      // === RIGHT ZONE / BOSS ARENA (2700 – 3360) ===
      { x: 2720, y: 760, width: 220, height: 20 },
      { x: 2840, y: 600, width: 200, height: 18 },
      { x: 2960, y: 460, width: 180, height: 18 },
      // Boss arena (wide flat)
      { x: 2960, y: 860, width: 400, height: 20 },
      { x: 3000, y: 720, width: 360, height: 20 },
      // Final beacon platform
      { x: 3140, y: 580, width: 200, height: 18 },
    ],

    enemies: [
      { type: 'darkScreenWisp', x: 280, y: 620 },
      { type: 'signalSaboteur', x: 460, y: 840 },
      { type: 'firewallBruiser', x: 680, y: 840 },
      { type: 'misinformerDrone', x: 900, y: 580 },
      { type: 'gatekeeperBot', x: 1080, y: 840 },
      { type: 'darkScreenWisp', x: 1300, y: 460 },
      { type: 'signalSaboteur', x: 1480, y: 840 },
      { type: 'firewallBruiser', x: 1700, y: 840 },
      { type: 'glitchTurret', x: 1920, y: 840 },
      { type: 'misinformerDrone', x: 2080, y: 360 },
      { type: 'darkScreenWisp', x: 2300, y: 460 },
      { type: 'gatekeeperBot', x: 2560, y: 840 },
      { type: 'firewallBruiser', x: 2760, y: 840 },
      { type: 'darkScreenWisp', x: 2980, y: 420 },
    ],

    collectibles: [
      { type: 'accessToken', x: 160, y: 850 },
      { type: 'accessToken', x: 320, y: 720 },
      { type: 'accessToken', x: 480, y: 580 },
      { type: 'accessToken', x: 640, y: 700 },
      { type: 'accessToken', x: 800, y: 850 },
      { type: 'accessToken', x: 960, y: 600 },
      { type: 'accessToken', x: 1120, y: 480 },
      { type: 'accessToken', x: 1280, y: 720 },
      { type: 'accessToken', x: 1400, y: 580 },
      { type: 'accessToken', x: 1520, y: 440 },
      { type: 'accessToken', x: 1640, y: 320 },
      { type: 'accessToken', x: 1800, y: 700 },
      { type: 'accessToken', x: 1960, y: 540 },
      { type: 'accessToken', x: 2100, y: 380 },
      { type: 'accessToken', x: 2260, y: 640 },
      { type: 'accessToken', x: 2400, y: 480 },
      { type: 'accessToken', x: 2520, y: 340 },
      { type: 'accessToken', x: 2660, y: 700 },
      { type: 'accessToken', x: 2820, y: 580 },
      { type: 'accessToken', x: 2980, y: 440 },
      // Special items
      { type: 'healthPack', x: 560, y: 480 },
      { type: 'aiLiteracyScroll', x: 1320, y: 300 },
      { type: 'patchBattery', x: 2080, y: 380 },
      { type: 'signalShield', x: 2560, y: 240 },
      { type: 'empowermentShard', x: 2980, y: 420 },
      { type: 'hiddenLorePage', x: 1640, y: 300 },
      { type: 'extraLife', x: 3080, y: 700 },
      { type: 'challengeRoomKey', x: 1340, y: 300 },
    ],

    checkpoint: { x: 1820, y: 700 },
    boss: { type: 'blackoutWarden', x: 3120, y: 760 },
    exit: { x: 3280, y: 700 },
  },
];

export function getLevelData(zoneId: string): LevelData | undefined {
  return LEVELS.find(l => l.id === zoneId);
}
