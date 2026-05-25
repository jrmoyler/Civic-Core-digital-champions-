// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Enemy & Boss Definitions
// ============================================================

import type { EnemyData, BossData } from '../game/types';
import { COLORS } from '../game/constants';

export const ENEMIES: Record<string, EnemyData> = {
  misinformerDrone: {
    type: 'misinformerDrone',
    name: 'Misinformer Drone',
    hp: 30,
    speed: 120,
    damage: 12,
    points: 50,
    color: COLORS.DRONE_COLOR,
    accentColor: 0xFF4444,
    width: 36,
    height: 28,
    isFlying: true,
    patrolRange: 200,
    attackRange: 320,
    shootInterval: 2200,
  },
  bandwidthLeech: {
    type: 'bandwidthLeech',
    name: 'Bandwidth Leech',
    hp: 45,
    speed: 80,
    damage: 8,
    points: 40,
    color: COLORS.LEECH_COLOR,
    accentColor: 0x33FF66,
    width: 32,
    height: 24,
    isFlying: false,
    patrolRange: 160,
    attackRange: 40,
  },
  firewallBruiser: {
    type: 'firewallBruiser',
    name: 'Firewall Bruiser',
    hp: 100,
    speed: 60,
    damage: 22,
    points: 100,
    color: COLORS.BRUISER_COLOR,
    accentColor: 0xFF6600,
    width: 48,
    height: 52,
    isFlying: false,
    patrolRange: 120,
    attackRange: 60,
  },
  darkScreenWisp: {
    type: 'darkScreenWisp',
    name: 'Dark Screen Wisp',
    hp: 40,
    speed: 100,
    damage: 15,
    points: 70,
    color: COLORS.WISP_COLOR,
    accentColor: 0xCC88FF,
    width: 30,
    height: 30,
    isFlying: true,
    patrolRange: 180,
    attackRange: 280,
    shootInterval: 2800,
  },
  gatekeeperBot: {
    type: 'gatekeeperBot',
    name: 'Gatekeeper Bot',
    hp: 60,
    speed: 90,
    damage: 14,
    points: 80,
    color: COLORS.GATEKEEPER_COLOR,
    accentColor: 0x88AAFF,
    width: 38,
    height: 44,
    isFlying: false,
    patrolRange: 150,
    attackRange: 80,
  },
  signalSaboteur: {
    type: 'signalSaboteur',
    name: 'Signal Saboteur',
    hp: 35,
    speed: 160,
    damage: 10,
    points: 60,
    color: COLORS.SABOTEUR_COLOR,
    accentColor: 0x00FF44,
    width: 30,
    height: 38,
    isFlying: false,
    patrolRange: 240,
    attackRange: 50,
  },
  glitchTurret: {
    type: 'glitchTurret',
    name: 'Glitch Turret',
    hp: 25,
    speed: 0,
    damage: 14,
    points: 30,
    color: COLORS.TURRET_COLOR,
    accentColor: 0xFF8800,
    width: 32,
    height: 32,
    isFlying: false,
    patrolRange: 0,
    attackRange: 360,
    shootInterval: 1800,
  },
};

export const BOSSES: Record<string, BossData> = {
  accessDenier: {
    type: 'accessDenier',
    name: 'Access Denier',
    hp: 350,
    speed: 80,
    damage: 28,
    color: COLORS.BOSS1_COLOR,
    accentColor: 0xFF2222,
    width: 80,
    height: 88,
    zoneId: 'zone1',
    description: 'A bulky authority mech that enforces exclusion with impenetrable barricades and authority protocols.',
  },
  algorithmicGatekeeper: {
    type: 'algorithmicGatekeeper',
    name: 'Algorithmic Gatekeeper',
    hp: 420,
    speed: 100,
    damage: 24,
    color: COLORS.BOSS2_COLOR,
    accentColor: 0x00FF88,
    width: 80,
    height: 80,
    zoneId: 'zone2',
    description: 'A floating AI core that controls access through code, encryption, and rotating lock protocols.',
  },
  blackoutWarden: {
    type: 'blackoutWarden',
    name: 'Blackout Warden',
    hp: 550,
    speed: 70,
    damage: 35,
    color: COLORS.BOSS3_COLOR,
    accentColor: 0xCC44FF,
    width: 88,
    height: 96,
    zoneId: 'zone3',
    description: 'Final-zone enforcer that wields blackout hammers and beacon shields to silence resistance.',
  },
};

export function getEnemyData(type: string): EnemyData {
  const data = ENEMIES[type];
  if (!data) return ENEMIES['misinformerDrone'];
  return data;
}

export function getBossData(type: string): BossData {
  const data = BOSSES[type];
  if (!data) return BOSSES['accessDenier'];
  return data;
}
