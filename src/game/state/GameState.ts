// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Global Game State
// Singleton accessed from any scene via GameState.getInstance()
// ============================================================

import type { HeroId, ZoneId, CheckpointData, LoreEntry } from '../types';
import { SAVE_KEYS } from '../constants';

export class GameState {
  private static instance: GameState;

  // Session state
  public selectedHero: HeroId = 'creator';
  public currentZone: ZoneId = 'zone1';
  public tokensCollected: number = 0;
  public scrollsCollected: number = 0;
  public loreUnlocked: string[] = [];
  public hasExtraLife: boolean = false;
  public hasSignalShield: boolean = false;
  public shieldActive: boolean = false;
  public shieldTimer: number = 0;
  public empowermentShards: number = 0;

  // Persistent state (localStorage)
  public unlockedZones: ZoneId[] = ['zone1'];
  public bestTokens: Partial<Record<ZoneId, number>> = {};

  // Last checkpoint
  public lastCheckpoint: CheckpointData | null = null;

  // Lore codex
  public loreEntries: LoreEntry[] = [];

  // Dev flags
  public devUnlockAll: boolean = false;

  private constructor() {
    this.load();
  }

  static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  /** Persist save data to localStorage */
  save(): void {
    try {
      localStorage.setItem(SAVE_KEYS.SELECTED_HERO, this.selectedHero);
      localStorage.setItem(SAVE_KEYS.UNLOCKED_ZONES, JSON.stringify(this.unlockedZones));
      localStorage.setItem(SAVE_KEYS.BEST_TOKENS, JSON.stringify(this.bestTokens));
      localStorage.setItem(SAVE_KEYS.UNLOCKED_LORE, JSON.stringify(this.loreUnlocked));
    } catch {
      console.warn('[GameState] Could not save to localStorage');
    }
  }

  /** Load save data from localStorage */
  load(): void {
    try {
      const hero = localStorage.getItem(SAVE_KEYS.SELECTED_HERO);
      if (hero) this.selectedHero = hero as HeroId;

      const zones = localStorage.getItem(SAVE_KEYS.UNLOCKED_ZONES);
      if (zones) this.unlockedZones = JSON.parse(zones);

      const tokens = localStorage.getItem(SAVE_KEYS.BEST_TOKENS);
      if (tokens) this.bestTokens = JSON.parse(tokens);

      const lore = localStorage.getItem(SAVE_KEYS.UNLOCKED_LORE);
      if (lore) this.loreUnlocked = JSON.parse(lore);
    } catch {
      console.warn('[GameState] Could not load from localStorage');
    }
  }

  /** Called when a zone is completed */
  completeZone(zoneId: ZoneId): void {
    // Unlock next zone
    const progression: Record<ZoneId, ZoneId | null> = {
      zone1: 'zone2',
      zone2: 'zone3',
      zone3: null,
    };
    const next = progression[zoneId];
    if (next && !this.unlockedZones.includes(next)) {
      this.unlockedZones.push(next);
    }

    // Update best tokens
    const prev = this.bestTokens[zoneId] ?? 0;
    if (this.tokensCollected > prev) {
      this.bestTokens[zoneId] = this.tokensCollected;
    }

    this.save();
  }

  /** Reset session state for a new level run */
  startLevel(zoneId: ZoneId): void {
    this.currentZone = zoneId;
    this.tokensCollected = 0;
    this.scrollsCollected = 0;
    this.hasExtraLife = false;
    this.hasSignalShield = false;
    this.shieldActive = false;
    this.empowermentShards = 0;
    this.lastCheckpoint = null;
  }

  /** Add tokens */
  addTokens(amount: number): void {
    this.tokensCollected += amount;
  }

  /** Unlock a lore entry */
  unlockLore(id: string): boolean {
    if (!this.loreUnlocked.includes(id)) {
      this.loreUnlocked.push(id);
      this.save();
      return true;
    }
    return false;
  }

  /** Check if zone is available */
  isZoneUnlocked(zoneId: ZoneId): boolean {
    if (this.devUnlockAll) return true;
    return this.unlockedZones.includes(zoneId);
  }

  /** Set checkpoint */
  setCheckpoint(zoneId: ZoneId, x: number, y: number): void {
    this.lastCheckpoint = { zoneId, x, y, tokensCollected: this.tokensCollected };
  }
}
