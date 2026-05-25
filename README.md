# CIVIC CORE: DIGITAL CHAMPIONS

> *The Core is for everyone. We fight not just for access — but for a future where every voice can build.*

A fully playable **2D mobile-first side-scrolling action platformer** built with Phaser 3, TypeScript, and Vite.

---

## Quick Start

```bash
npm install
npm run dev
```

Open: **http://localhost:3000**

---

## Controls

### Desktop / Keyboard
| Key | Action |
|-----|--------|
| `A` / `←` | Move Left |
| `D` / `→` | Move Right |
| `W` / `Space` / `↑` | Jump |
| `J` | Basic Attack |
| `K` / `Shift` | Civic Ability |
| `P` / `Esc` | Pause |
| `M` | World Map |
| `G` | **Debug: Toggle Collision Overlay** |
| `R` | Restart Level |

### Mobile Touch Controls
- **Bottom-left** — Virtual Joystick (move left/right)
- **Bottom-right JUMP** — Jump button
- **Bottom-right ATK** — Attack button
- **Bottom-right ABILITY** — Civic Ability button
- **Top-right PAUSE** — Pause menu

> Touch controls appear automatically on mobile. On desktop, click the **🎮 TOUCH** button in the HUD.

---

## Asset Placement

All 11 game images must be placed in:
```
public/assets/source/
```

### Canonical Filenames

| Original File | Canonical Name | Role |
|--------------|----------------|------|
| 45cec165-1000022652.png | `heroes_sheet.png` | Playable Hero sprites |
| cc9722c5-1000022653.png | `enemies_hazards_sheet.png` | Enemy/Hazard sprites |
| 7255c768-1000022654.png | `bosses_npcs_objects_sheet.png` | Bosses, NPCs, Objects |
| 10acce6a-1000022655.png | `zone1_tileset_sheet.png` | Zone 1 tileset reference |
| 19166d04-1000022656.png | `zone2_tileset_sheet.png` | Zone 2 tileset reference |
| 13fafcdb-1000022657.png | `zone3_tileset_sheet.png` | Zone 3 tileset reference |
| e6800619-1000022658.png | `ui_hud_sheet.png` | UI/HUD reference |
| d7a7f8ad-1000022659.png | `collectibles_sheet.png` | Collectibles/Power-ups |
| 2f1384ac-1000022676.png | `zone1_blank_map.png` | **Zone 1 playable level background** |
| 44500ac8-1000022677.png | `zone2_blank_map.png` | **Zone 2 playable level background** |
| 29bd3a08-1000022678.png | `zone3_blank_map.png` | **Zone 3 playable level background** |

The game will run without images (fallback colored rectangles are generated automatically), but all visuals are best with the images in place.

---

## Gameplay Summary

### Heroes
| Hero | Role | HP | Speed | Ability |
|------|------|----|-------|---------|
| **Community Creator** | Balanced Support | 120 | 230 | Idea Burst — stuns enemies, reveals paths |
| **Civic Coder** | Fast Ranged | 95 | 270 | Patch Wave — chain shockwave, disables hazards |
| **Digital Equity Advocate** | Power Tank | 150 | 205 | Beacon Torch — burn field, damage reduction |

### Zones
1. **Community Commons** — Night-time neighborhood with waterfall, library, community center. Boss: *Access Denier*
2. **Public Access Intelligence Infrastructure** — Cyber network with server racks, elevators, laser gates. Boss: *Algorithmic Gatekeeper*
3. **Empowerment Heights** — Purple crystal towers and beacon spires. Boss: *Blackout Warden* (final)

### Enemies
- Misinformer Drone (flying, shoots glitch pellets)
- Bandwidth Leech (ground crawler, drains tokens)
- Firewall Bruiser (heavy, shield slam)
- Dark Screen Wisp (flying, phases, shoots)
- Gatekeeper Bot (patrol, projects barrier)
- Signal Saboteur (fast, dash attack, jamming pulse)
- Glitch Turret (stationary, timed shots)

### Collectibles
Access Tokens, Health Packs, AI Literacy Scrolls, Patch Batteries, Signal Shields, Empowerment Shards, Extra Lives, Hidden Lore Pages, Challenge Room Keys

---

## Project Structure

```
civic-core-digital-champions/
├── public/
│   └── assets/
│       └── source/          ← All 11 game images go here
│
├── src/
│   ├── main.ts              ← Game bootstrap
│   ├── game/
│   │   ├── config.ts        ← Phaser game config
│   │   ├── constants.ts     ← Shared constants & colors
│   │   ├── types.ts         ← TypeScript interfaces
│   │   └── state/GameState.ts ← Global game state (singleton)
│   │
│   ├── assets/
│   │   └── assetManifest.ts ← Asset paths & gallery entries
│   │
│   ├── data/
│   │   ├── heroes.ts        ← Hero stat definitions
│   │   ├── enemies.ts       ← Enemy/boss data
│   │   ├── levels.ts        ← Level layouts (platforms, enemies, etc.)
│   │   ├── collectibles.ts  ← Collectible definitions
│   │   └── lore.ts          ← Story/codex entries
│   │
│   ├── entities/
│   │   ├── Player.ts        ← Player entity (physics, input, state)
│   │   ├── Enemy.ts         ← Enemy AI and combat
│   │   ├── Boss.ts          ← Boss phases and attacks
│   │   ├── Projectile.ts    ← Projectile physics
│   │   ├── Collectible.ts   ← Collectible pickup items
│   │   ├── Checkpoint.ts    ← Save checkpoint
│   │   └── ExitBeacon.ts    ← Level exit trigger
│   │
│   ├── systems/
│   │   ├── InputSystem.ts   ← Keyboard input wrapper
│   │   ├── TextureFactory.ts ← Procedural sprite generation
│   │   ├── EffectsSystem.ts ← Particles, shake, damage text
│   │   ├── CollisionDebug.ts ← Debug overlay (G key)
│   │   ├── AudioSystem.ts   ← WebAudio oscillator SFX
│   │   └── SaveSystem.ts    ← localStorage wrapper
│   │
│   ├── ui/
│   │   ├── Button.ts        ← Reusable button
│   │   ├── TouchControls.ts ← Virtual joystick + buttons
│   │   ├── HealthBar.ts     ← HP bar component
│   │   └── DialogueBox.ts   ← Dialogue/lore popup
│   │
│   └── scenes/
│       ├── BootScene.ts         ← Audio init, move to Preload
│       ├── PreloadScene.ts      ← Load all 11 images + generate textures
│       ├── MainMenuScene.ts     ← Main menu
│       ├── CharacterSelectScene.ts ← Hero selection
│       ├── WorldMapScene.ts     ← Zone select
│       ├── LevelScene.ts        ← Main gameplay loop
│       ├── HUDScene.ts          ← Overlay HUD
│       ├── PauseScene.ts        ← Pause menu
│       ├── AssetGalleryScene.ts ← All images + lore codex
│       ├── GameOverScene.ts     ← Death screen
│       └── VictoryScene.ts      ← Final victory
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── README.md
```

---

## Debug Tools

| Key | Effect |
|-----|--------|
| `G` | Toggle collision rectangle overlay (cyan = solid, yellow = one-way) |
| `R` | Instant restart current level |
| `M` | Go to world map |
| World Map → **[DEV: UNLOCK ALL]** | Unlocks all zones |

---

## Level Collision Data

Platform collision rectangles are defined manually in `src/data/levels.ts`.

Each level has a `platforms` array of `{ x, y, width, height, oneWay? }` objects:
- Coordinates are in world space (origin top-left)
- `oneWay: true` allows jumping through from below
- **Press G** to show collision boxes over the level background to tune positions

The blank map images are displayed as the visual background at world size `3360 × 940`.

To adjust platform positions: edit the `platforms` array in `src/data/levels.ts` and use the G-key debug overlay to verify alignment with the background art.

---

## Saving & Persistence

Game data persists in `localStorage`:

| Key | Content |
|-----|---------|
| `cc_selectedHero` | Last selected hero |
| `cc_unlockedZones` | Array of completed zones |
| `cc_bestTokens` | Best token count per zone |
| `cc_unlockedLore` | Array of unlocked lore entry IDs |

---

## Asset Gallery / Codex

Accessible from the Main Menu → **📚 ASSET GALLERY / CODEX**

Displays all 11 source images with labels. The second tab shows unlocked lore entries from gameplay.

---

## Known Limitations

1. **Sprite sheets not individually sliced** — The 11 images are complex reference sheets. Entity sprites are generated programmatically (Phaser Graphics → textures) matching the sheet colors and silhouettes. The original sheets are displayed in the Asset Gallery.

2. **Platform geometry is approximate** — Collision rectangles are manually estimated to match the blank map images. Use **G** to overlay boxes and tune `src/data/levels.ts`.

3. **No audio files** — All sound effects use WebAudio oscillator tones. No audio files are required.

4. **Boss arena is not hard-locked** — Camera lock is soft. The boss arena is triggered when the player passes a threshold X coordinate near the end of the map.

5. **One-way platforms** — Currently defined in data but not fully differentiated in physics (all platforms block from all sides). This can be improved by using Phaser's `checkCollisionDown` on the player body for one-way platforms.

---

## Next Production Steps

1. **Manual sprite slicing** — Slice individual character and enemy sprites from the reference sheets using TexturePacker or manual JSON atlas files.

2. **Animation polish** — Replace single-frame textures with multi-frame sprite animations using `this.anims.create()`.

3. **Sound/music pass** — Add looping background music (zone-specific) and polished SFX from an audio library or custom compositions.

4. **Level geometry tuning** — Use the G-key debug overlay to precisely align all platform rectangles to the blank map backgrounds.

5. **One-way platform physics** — Implement proper pass-through for platforms flagged `oneWay: true`.

6. **Mobile test pass** — Test joystick feel, button sizing, and performance on actual mobile devices.

7. **Accessibility pass** — Add high-contrast mode, larger text option, and remappable controls.

8. **Boss polish** — Expand boss attack patterns, add phase transition cutscenes, telegraphed attacks.

9. **Parallel HUD** — Add mini-map, combo counter, mission objective tracker.

10. **CI/CD deployment** — Configure Vite static deployment to GitHub Pages or Vercel.

---

## Tech Stack

- **Phaser 3.60** — 2D game framework
- **TypeScript 5** — Type-safe development
- **Vite 4** — Fast dev server + build
- **WebAudio API** — Procedural sound effects (no audio files)
- **HTML5 Canvas / WebGL** — Rendering

---

*CIVIC CORE: DIGITAL CHAMPIONS — Community · Code · Equity*
