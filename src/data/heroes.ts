// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Hero Definitions
// ============================================================

import type { HeroData } from '../game/types';
import { COLORS } from '../game/constants';

export const HEROES: HeroData[] = [
  {
    id: 'communityCreator',
    name: 'Community Creator',
    subtitle: 'Balanced Support Fighter',
    description: 'Armed with a glowing tablet, the Community Creator builds bridges between people and technology.',
    hp: 120,
    speed: 230,
    jumpVelocity: 470,
    attackDamage: 16,
    abilityDamage: 32,
    abilityCooldown: 8,
    primaryColor: COLORS.CREATOR_PRIMARY,
    secondaryColor: COLORS.CREATOR_SECONDARY,
    abilityName: 'Idea Burst',
    abilityDescription: 'Fires a large blue pulse that reveals hidden paths and stuns enemies.',
    lore: 'Builds possibility through creativity and access. The Creator sees the world as a canvas — every wall a mural, every barrier a challenge to overcome.',
  },
  {
    id: 'civicCoder',
    name: 'Civic Coder',
    subtitle: 'Fast Ranged Attacker',
    description: 'With a code gauntlet and circuit cape, the Civic Coder moves fast and strikes from a distance.',
    hp: 95,
    speed: 270,
    jumpVelocity: 500,
    attackDamage: 13,
    abilityDamage: 26,
    abilityCooldown: 7,
    primaryColor: COLORS.CODER_PRIMARY,
    secondaryColor: COLORS.CODER_SECONDARY,
    abilityName: 'Patch Wave',
    abilityDescription: 'Launches a chained green shockwave that disables hazards and hits multiple enemies.',
    lore: 'Turns knowledge into action. Every line of code is a vote for a better future. The Coder knows that technology can be liberated or used to oppress — the difference is who writes it.',
  },
  {
    id: 'digitalEquityAdvocate',
    name: 'Digital Equity Advocate',
    subtitle: 'Power Tank',
    description: 'The Advocate carries a beacon torch and fights for the hardest places — slow but unstoppable.',
    hp: 150,
    speed: 205,
    jumpVelocity: 440,
    attackDamage: 20,
    abilityDamage: 38,
    abilityCooldown: 10,
    primaryColor: COLORS.ADVOCATE_PRIMARY,
    secondaryColor: COLORS.ADVOCATE_SECONDARY,
    abilityName: 'Beacon Torch',
    abilityDescription: 'Creates a protective field that burns nearby enemies and reduces incoming damage.',
    lore: 'Carries the mission into the hardest places. The Advocate knows that equity is not a destination — it is a daily practice. Every community deserves light.',
  },
];

export function getHeroData(id: string): HeroData {
  const hero = HEROES.find(h => h.id === id);
  if (!hero) return HEROES[0];
  return hero;
}
