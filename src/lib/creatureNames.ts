const CREATURE_NAMES = [
  'Lumis', 'Verdex', 'Ophra', 'Cellix', 'Myco', 'Synth', 'Bloom', 'Cripta',
  'Nox', 'Void', 'Orbit', 'Haze', 'Flume', 'Wisp', 'Glim', 'Drex',
  'Vyn', 'Quill', 'Thorn', 'Echo', 'Fable', 'Mist', 'Sable', 'Rune',
  'Hexa', 'Zeph', 'Aria', 'Flux', 'Pixel', 'Glyph', 'Moth', 'Kern',
  'Solace', 'Nimbus', 'Prism', 'Dusk', 'Spore', 'Brine', 'Coda', 'Latch',
  'Opal', 'Aegis', 'Cypher', 'Vesper', 'Ember', 'Clarity', 'Drift', 'Nova',
];

const CREATURE_SUFFIXES = [
  'the Yielder', 'the Patient', 'the Fierce', 'the Wise',
  'the Swift', 'the Calm', 'the Bold', 'the Bright',
  'the Steady', 'the Keen', 'the Sharp', 'the Flowing',
];

export function generateCreatureName(): string {
  const name = CREATURE_NAMES[Math.floor(Math.random() * CREATURE_NAMES.length)];
  const suffix = CREATURE_SUFFIXES[Math.floor(Math.random() * CREATURE_SUFFIXES.length)];
  return `${name} ${suffix}`;
}
