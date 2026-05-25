// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Collectible Definitions
// ============================================================

import type { CollectibleData } from '../game/types';
import { COLORS } from '../game/constants';

export const COLLECTIBLES: Record<string, CollectibleData> = {
  accessToken: {
    type: 'accessToken',
    name: 'Access Token',
    color: COLORS.TOKEN_COLOR,
    radius: 10,
    value: 1,
    description: 'Currency used to unlock upgrades, items, and services.',
  },
  healthPack: {
    type: 'healthPack',
    name: 'Health Pack',
    color: COLORS.HEALTH_COLOR,
    radius: 12,
    value: 30,
    description: 'Restores 30 HP.',
  },
  aiLiteracyScroll: {
    type: 'aiLiteracyScroll',
    name: 'AI Literacy Scroll',
    color: 0xAADDFF,
    radius: 11,
    value: 1,
    description: 'Improves AI Literacy. Adds a lore entry to the Codex.',
  },
  patchBattery: {
    type: 'patchBattery',
    name: 'Patch Battery',
    color: 0x66FFCC,
    radius: 10,
    value: 1,
    description: 'Refills civic ability cooldown instantly.',
  },
  signalShield: {
    type: 'signalShield',
    name: 'Signal Shield',
    color: 0x4488FF,
    radius: 12,
    value: 1,
    description: 'Temporary protective shield (absorbs one hit).',
  },
  empowermentShard: {
    type: 'empowermentShard',
    name: 'Empowerment Shard',
    color: 0xFF88FF,
    radius: 11,
    value: 5,
    description: 'Increases score by 5 tokens. Boosts ability charge.',
  },
  extraLife: {
    type: 'extraLife',
    name: 'Extra Life',
    color: 0xFF4444,
    radius: 13,
    value: 1,
    description: 'Grants one revive when health reaches zero.',
  },
  hiddenLorePage: {
    type: 'hiddenLorePage',
    name: 'Hidden Lore Page',
    color: 0xFFDD88,
    radius: 11,
    value: 1,
    description: 'Unlocks a Civic Core history entry in the Codex.',
  },
  challengeRoomKey: {
    type: 'challengeRoomKey',
    name: 'Challenge Room Key',
    color: 0xFFAA44,
    radius: 11,
    value: 3,
    description: 'Opens challenge rooms for greater rewards.',
  },
};

export function getCollectibleData(type: string): CollectibleData {
  return COLLECTIBLES[type] ?? COLLECTIBLES['accessToken'];
}
