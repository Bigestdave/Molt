import type { PersonalityType } from './personalities';

const CREATURE_NAMES = [
  'Lumis', 'Verdex', 'Ophra', 'Cellix', 'Myco', 'Synth', 'Bloom', 'Cripta',
  'Nox', 'Void', 'Orbit', 'Haze', 'Flume', 'Wisp', 'Glim', 'Drex',
  'Vyn', 'Quill', 'Thorn', 'Echo', 'Fable', 'Mist', 'Sable', 'Rune',
  'Hexa', 'Zeph', 'Aria', 'Flux', 'Pixel', 'Glyph', 'Moth', 'Kern',
  'Solace', 'Nimbus', 'Prism', 'Dusk', 'Spore', 'Brine', 'Coda', 'Latch',
  'Opal', 'Aegis', 'Cypher', 'Vesper', 'Ember', 'Clarity', 'Drift', 'Nova',
];

const PERSONALITY_SUFFIX: Record<PersonalityType, string> = {
  steward: 'the Keeper',
  hunter: 'the Hunter',
  sentinel: 'the Architect',
};

export function generateCreatureName(personality?: PersonalityType): string {
  const name = CREATURE_NAMES[Math.floor(Math.random() * CREATURE_NAMES.length)];
  const suffix = personality ? PERSONALITY_SUFFIX[personality] : 'the Keeper';
  return `${name} ${suffix}`;
}
