// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — TypeScript Types
// ============================================================

export type HeroId = 'creator' | 'coder' | 'advocate';
export type ZoneId = 'zone1' | 'zone2' | 'zone3';
export type EnemyType =
  | 'misinformerDrone'
  | 'bandwidthLeech'
  | 'firewallBruiser'
  | 'darkScreenWisp'
  | 'gatekeeperBot'
  | 'signalSaboteur'
  | 'glitchTurret';
export type BossType = 'accessDenier' | 'algorithmicGatekeeper' | 'blackoutWarden';
export type CollectibleType =
  | 'accessToken'
  | 'healthPack'
  | 'aiLiteracyScroll'
  | 'patchBattery'
  | 'signalShield'
  | 'empowermentShard'
  | 'extraLife'
  | 'hiddenLorePage'
  | 'challengeRoomKey';
export type HazardType = 'glitchTurret' | 'dataSpikeTransp';
export type PlayerState = 'idle' | 'run' | 'jump' | 'fall' | 'attack' | 'ability' | 'hurt' | 'dead';
export type EnemyState = 'patrol' | 'chase' | 'attack' | 'hurt' | 'dead';
export type BossPhase = 'idle' | 'phase1' | 'phase2' | 'hurt' | 'defeated';

export interface HeroData {
  id: HeroId;
  name: string;
  subtitle: string;
  description: string;
  hp: number;
  speed: number;
  jumpVelocity: number;
  attackDamage: number;
  abilityDamage: number;
  abilityCooldown: number; // seconds
  primaryColor: number;
  secondaryColor: number;
  abilityName: string;
  abilityDescription: string;
  lore: string;
}

export interface EnemyData {
  type: EnemyType;
  name: string;
  hp: number;
  speed: number;
  damage: number;
  points: number;
  color: number;
  accentColor: number;
  width: number;
  height: number;
  isFlying: boolean;
  patrolRange: number;
  attackRange: number;
  shootInterval?: number; // ms between shots
}

export interface BossData {
  type: BossType;
  name: string;
  hp: number;
  speed: number;
  damage: number;
  color: number;
  accentColor: number;
  width: number;
  height: number;
  zoneId: ZoneId;
  description: string;
}

export interface CollectibleData {
  type: CollectibleType;
  name: string;
  color: number;
  radius: number;
  value: number;
  description: string;
}

export interface PlatformDef {
  x: number;
  y: number;
  width: number;
  height: number;
  oneWay?: boolean;
}

export interface EnemySpawn {
  type: EnemyType;
  x: number;
  y: number;
}

export interface BossSpawn {
  type: BossType;
  x: number;
  y: number;
}

export interface CollectibleSpawn {
  type: CollectibleType;
  x: number;
  y: number;
}

export interface LevelData {
  id: ZoneId;
  name: string;
  subtitle: string;
  backgroundKey: string;
  tilesetKey: string;
  worldWidth: number;
  worldHeight: number;
  spawn: { x: number; y: number };
  platforms: PlatformDef[];
  enemies: EnemySpawn[];
  collectibles: CollectibleSpawn[];
  checkpoint: { x: number; y: number };
  boss: BossSpawn;
  exit: { x: number; y: number };
  bgColor: number;
  ambientColor: number;
}

export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  unlocked: boolean;
}

export interface GameSaveData {
  selectedHero: HeroId;
  unlockedZones: ZoneId[];
  bestTokens: Partial<Record<ZoneId, number>>;
  unlockedLore: string[];
}

export interface DamageInfo {
  amount: number;
  type: 'normal' | 'crit' | 'ability';
  knockbackDir: number; // -1 left, 1 right
}

export interface CheckpointData {
  zoneId: ZoneId;
  x: number;
  y: number;
  tokensCollected: number;
}
