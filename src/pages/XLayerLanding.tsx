import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';

const EXPLORER_URL = 'https://www.oklink.com/xlayer';
const GITHUB_URL = '#'; // Replace with your repo URL

const features = [
  {
    icon: '🧬',
    title: 'Agentic Wallet',
    desc: 'A self-sovereign EOA controlled entirely by its Node.js execution loop. No human signatures required.',
  },
  {
    icon: '🦄',
    title: 'Uniswap Skills',
    desc: 'Autonomous token swaps via Uniswap V3 smart contracts on X Layer. Pure ethers.js — zero centralized APIs.',
  },
  {
    icon: '💰',
    title: 'Economy Loop',
    desc: 'After every swap, Molt taxes itself 0.5% and routes it back as a gas fund. A self-sustaining organism.',
  },
  {
    icon: '🎭',
    title: 'Personality Engine',
    desc: 'Choose Hunter (aggressive), Steward (conservative), or Architect (balanced) — each shapes trade behavior.',
  },
];

const txProof = [
  { label: 'Wrap OKB → WOKB', status: 'confirmed' },
  { label: 'Uniswap V3 Swap', status: 'confirmed' },
  { label: '0.5% Tax Harvest', status: 'confirmed' },
];

function GlowOrb({ mousePos }: { mousePos: { x: number; y: number } }) {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700"
      style={{
        background: `radial-gradient(600px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(251, 146, 60, 0.07) 0%, transparent 60%)`,
      }}
    />
  );
}

export default function XLayerLanding() {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  }, []);

  return (
    <div onMouseMove={handleMouseMove} className="relative min-h-screen overflow-hidden" style={{ background: '#06070a' }}>
      <GlowOrb mousePos={mousePos} />
      <div className="noise-overlay" />

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center gap-6"
        >
          {/* Badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="font-data text-[11px] text-orange-300/80 tracking-wider uppercase">
              X Layer Arena — Hackathon Submission
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-5xl sm:text-7xl tracking-tighter text-white leading-[0.95]">
            <span className="block">MOLT</span>
            <span className="block text-orange-400" style={{ fontSize: '0.55em' }}>
              × X Layer
            </span>
          </h1>

          <p className="max-w-lg text-white/50 text-sm sm:text-base leading-relaxed font-data">
            A financially sovereign digital organism on X Layer.
            It earns via Uniswap Skills, taxes itself 0.5%, and funds its own gas — forever.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl bg-orange-500 text-black font-heading text-sm tracking-tight hover:bg-orange-400 transition-colors"
            >
              GitHub Repo
            </a>
            <a
              href={EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl border border-white/10 text-white/70 font-heading text-sm tracking-tight hover:bg-white/5 transition-colors"
            >
              View on OKLink ↗
            </a>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-6 rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-heading text-lg text-white tracking-tight mb-1">{f.title}</h3>
              <p className="font-data text-xs text-white/40 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Economy Loop Diagram */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="p-8 rounded-3xl border border-orange-500/10 bg-orange-500/[0.02]"
        >
          <h2 className="font-heading text-2xl text-white tracking-tight mb-6 text-center">
            The Economy Loop
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
            {['EARN', 'TAX 0.5%', 'GAS FUND', 'SURVIVE'].map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                  <span className="font-data text-xs text-orange-300 tracking-wider">{step}</span>
                </div>
                {i < 3 && <span className="text-white/20 hidden sm:block">→</span>}
              </div>
            ))}
          </div>
          <p className="font-data text-xs text-white/30 text-center mt-4">
            Molt deducts 0.5% from every Uniswap swap and routes it back to its Agentic Wallet.
            The organism is financially self-sovereign.
          </p>
        </motion.div>
      </section>

      {/* On-Chain Proof */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 pb-20">
        <h2 className="font-heading text-2xl text-white tracking-tight mb-6 text-center">
          On-Chain Proof
        </h2>
        <div className="space-y-3">
          {txProof.map((tx, i) => (
            <motion.div
              key={tx.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="font-data text-sm text-white/70">{tx.label}</span>
              </div>
              <span className="font-data text-xs text-green-400/60 uppercase">{tx.status}</span>
            </motion.div>
          ))}
        </div>
        <p className="font-data text-xs text-white/20 text-center mt-4">
          Real transactions on X Layer Mainnet (Chain 196). Verify on{' '}
          <a href={EXPLORER_URL} className="text-orange-400/60 underline" target="_blank" rel="noopener noreferrer">
            OKLink
          </a>
        </p>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 text-center border-t border-white/[0.04]">
        <p className="font-data text-xs text-white/20">
          Built for X Layer Arena Hackathon · Molt Agent © 2026
        </p>
      </footer>
    </div>
  );
}
