import type { GameId, GameMetadata } from '../types';

export const GAME_CATALOG: Record<GameId, GameMetadata> = {
  'bubble-pop': {
    id: 'bubble-pop',
    title: 'Bubble Pop',
    tagline: 'Burst physical tension with infinite bubble wrap sheets',
    category: 'Tactile',
    icon: 'Sparkles',
    accentColor: '#38bdf8', // sky blue
    themeGradient: 'from-sky-400/20 to-blue-500/20',
    instructions: 'Tap or drag across bubbles to pop them. Pop all bubbles to get a fresh soothing sheet.',
    benefits: 'Provides immediate sensory release, tactile satisfaction, and micro-accomplishment cues.'
  },
  'zen-sand': {
    id: 'zen-sand',
    title: 'Zen Sand',
    tagline: 'Rake rhythmic patterns into a tranquil Japanese rock garden',
    category: 'Focus',
    icon: 'Waves',
    accentColor: '#d97706', // warm amber
    themeGradient: 'from-amber-400/20 to-orange-500/20',
    instructions: 'Draw gently with the 3-tine rake. Hit "Smooth Sand" whenever you want a fresh canvas.',
    benefits: 'Calms hyperactive thoughts through slow, repetitive physical gestures and visual stillness.'
  },
  'breathing': {
    id: 'breathing',
    title: 'Breath Bloom',
    tagline: 'Resonant 4s inhale & 6s exhale guided organic morphing bloom',
    category: 'Somatic',
    icon: 'Heart',
    accentColor: '#10b981', // emerald
    themeGradient: 'from-emerald-400/20 to-teal-500/20',
    instructions: 'Follow the gentle orb as it blossoms for 4 seconds, then release your breath for 6 seconds.',
    benefits: 'Stimulates the vagus nerve and activates parasympathetic nervous tone, dropping heart rate.'
  },
  'worry-shredder': {
    id: 'worry-shredder',
    title: 'Worry Shredder',
    tagline: 'Write what weighs on you, then shred it into drifting confetti',
    category: 'Reflective',
    icon: 'Scissors',
    accentColor: '#f43f5e', // rose
    themeGradient: 'from-rose-400/20 to-red-500/20',
    instructions: 'Type anything troubling you. Watch it get shredded into fluttering strips. Never saved or stored.',
    benefits: 'Symbolic externalization and cognitive defusion help detach from intrusive rumination.'
  },
  'ripple-pond': {
    id: 'ripple-pond',
    title: 'Ripple Pond',
    tagline: 'Send peaceful concentric water waves across a twilight koi pool',
    category: 'Focus',
    icon: 'Droplet',
    accentColor: '#06b6d4', // cyan
    themeGradient: 'from-cyan-400/20 to-teal-500/20',
    instructions: 'Touch, drag, or click the water surface to generate interference wavelets with soft water droplets.',
    benefits: 'Encourages mindful observation and fluid pacing, dissipating physical restlessness.'
  },
  'mandala': {
    id: 'mandala',
    title: 'Mandala Bloom',
    tagline: 'Create mesmerizing 8-fold radial symmetry with shifting hues',
    category: 'Creative',
    icon: 'Compass',
    accentColor: '#a855f7', // purple
    themeGradient: 'from-purple-400/20 to-pink-500/20',
    instructions: 'Glide your finger or cursor to draw. 8 reflected points mirror your motion in serene pastel harmony.',
    benefits: 'Flow-state immersion that shifts brainwaves from high-stress beta to relaxed alpha states.'
  },
  'calm-keys': {
    id: 'calm-keys',
    title: 'Calm Keys',
    tagline: 'Play peaceful pentatonic chimes where every note harmonizes',
    category: 'Auditory',
    icon: 'Music',
    accentColor: '#8b5cf6', // violet
    themeGradient: 'from-violet-400/20 to-indigo-500/20',
    instructions: 'Tap glowing keys or slide across them. Tuned to a tranquil pentatonic scale that never sounds off-key.',
    benefits: 'Empowering musical creation without fear of mistakes, soothing auditory pathways.'
  },
  'gratitude-jar': {
    id: 'gratitude-jar',
    title: 'Gratitude Jar',
    tagline: 'Capture one uplifting moment daily and watch starlight gather',
    category: 'Reflective',
    icon: 'Star',
    accentColor: '#eab308', // yellow
    themeGradient: 'from-yellow-400/20 to-amber-500/20',
    instructions: 'Add a small blessing from today. Gently shake the jar to summon a random star of past happiness.',
    benefits: 'Reorients neurological negativity bias toward positive recall and emotional resilience.'
  },
  'star-catcher': {
    id: 'star-catcher',
    title: 'Star Catcher',
    tagline: 'Catch gently drifting celestial lights with twinkling bursts',
    category: 'Focus',
    icon: 'Moon',
    accentColor: '#6366f1', // indigo
    themeGradient: 'from-indigo-400/20 to-purple-500/20',
    instructions: 'Slow twilight stars drift down. Tap them to release a burst of stardust and celestial chimes.',
    benefits: 'Promotes soft focus (effortless attention) to gently interrupt anxious spiral loops.'
  },
  'color-fill': {
    id: 'color-fill',
    title: 'Color Fill',
    tagline: 'Tap mosaic tiles into tranquil color gradients and fresh patterns',
    category: 'Tactile',
    icon: 'Palette',
    accentColor: '#ec4899', // pink
    themeGradient: 'from-pink-400/20 to-rose-500/20',
    instructions: 'Tap tiles to cycle through serene pastel palettes. Complete the canvas to enjoy a harmonious ripple.',
    benefits: 'Engages fine motor focus and color psychology to ground overstimulated minds.'
  }
};

export const ALL_GAME_IDS: GameId[] = [
  'bubble-pop',
  'zen-sand',
  'breathing',
  'worry-shredder',
  'ripple-pond',
  'mandala',
  'calm-keys',
  'gratitude-jar',
  'star-catcher',
  'color-fill'
];
