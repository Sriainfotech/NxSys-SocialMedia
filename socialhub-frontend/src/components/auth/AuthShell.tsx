import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Share2,
  ArrowLeft,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Floating platform glyphs scattered around the form. Each keeps its own
// brand gradient so the page still feels "social" even on the light theme.
// `hide` breakpoints keep the center uncluttered on small screens.
const FLOATING_ICONS = [
  { Icon: Instagram, pos: 'top-[16%] left-[6%]', delay: 0.00, hide: 'hidden sm:flex', from: 'from-pink-500', to: 'to-orange-400', ring: 'shadow-pink-500/30' },
  { Icon: Linkedin, pos: 'top-[18%] right-[8%]', delay: 0.30, hide: 'hidden sm:flex', from: 'from-sky-600', to: 'to-sky-400', ring: 'shadow-sky-500/30' },
  { Icon: Twitter, pos: 'bottom-[22%] left-[10%]', delay: 0.60, hide: 'hidden md:flex', from: 'from-slate-700', to: 'to-slate-500', ring: 'shadow-slate-500/25' },
  { Icon: Facebook, pos: 'bottom-[26%] right-[12%]', delay: 0.20, hide: 'hidden md:flex', from: 'from-blue-600', to: 'to-blue-400', ring: 'shadow-blue-500/30' },
  { Icon: Youtube, pos: 'top-[48%] left-[4%]', delay: 0.80, hide: 'hidden lg:flex', from: 'from-red-600', to: 'to-red-400', ring: 'shadow-red-500/30' },
  { Icon: Instagram, pos: 'top-[56%] right-[5%]', delay: 0.45, hide: 'hidden lg:flex', from: 'from-fuchsia-500', to: 'to-pink-400', ring: 'shadow-fuchsia-500/30' },
] as const;

/**
 * Full-screen backdrop for auth pages. Uses the same light theme as the
 * landing page hero: soft blue gradient orbs, masked dotted grid, white
 * surface. The form card is centered on top.
 */

interface AuthShellProps {
  children: React.ReactNode;
  className?: string;
}

const AuthShell = ({ children, className }: AuthShellProps) => (
  <div
    className={cn(
      'min-h-screen relative overflow-hidden bg-white text-slate-900',
      'flex flex-col items-center justify-center px-4 py-20 sm:py-24',
      className
    )}
  >
    {/* Background — matches the landing hero */}
    <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/80 via-white to-white" />
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -top-40 -left-40 w-[640px] h-[640px] rounded-full blur-3xl bg-gradient-to-br from-blue-400/30 to-sky-300/20 -z-10"
      animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -top-20 -right-40 w-[520px] h-[520px] rounded-full blur-3xl bg-gradient-to-br from-sky-400/25 to-blue-300/15 -z-10"
      animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
    />
    {/* Masked grid — same pattern as landing page */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.15] -z-10"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(37,99,235,0.2) 1px, transparent 1px),' +
          'linear-gradient(to bottom, rgba(37,99,235,0.2) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
        maskImage: 'radial-gradient(ellipse at center top, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center top, black 30%, transparent 70%)',
      }}
    />

    {/* Floating platform glyphs — decoration only, non-interactive */}
    {FLOATING_ICONS.map(({ Icon, pos, delay, hide, from, to, ring }, i) => (
      <motion.div
        key={i}
        aria-hidden
        className={cn(
          'pointer-events-none absolute w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center ring-1 ring-white shadow-lg',
          from,
          to,
          ring,
          pos,
          hide
        )}
        initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0, y: [0, -10, 0] }}
        transition={{
          opacity: { delay: 0.3 + delay, duration: 0.6 },
          scale: { delay: 0.3 + delay, duration: 0.6 },
          rotate: { delay: 0.3 + delay, duration: 0.6 },
          y: { duration: 4 + i * 0.35, repeat: Infinity, ease: 'easeInOut', delay },
        }}
      >
        <Icon className="w-5 h-5 text-white" />
      </motion.div>
    ))}

    {/* Top bar — same brand mark style as the landing navbar */}
    <Link
      to="/"
      className="absolute top-5 left-5 sm:top-6 sm:left-8 z-10 flex items-center gap-2 group"
    >
      <img src="/logo.png" alt="Social Media Hub" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
      <span className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
        Social Media Hub
      </span>
    </Link>

    <Link
      to="/"
      className="absolute top-5 right-5 sm:top-6 sm:right-8 z-10 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
    >
      <ArrowLeft className="w-3 h-3" />
      <span className="hidden sm:inline">Back to home</span>
    </Link>

    {/* Centered content */}
    <div className="relative z-10 w-full flex items-center justify-center">{children}</div>

    {/* Subtle social proof in the professional footer style */}
    {/* <div className="absolute bottom-5 sm:bottom-6 inset-x-0 z-10 flex items-center justify-center gap-4 sm:gap-6 text-slate-500 px-4">
      {[
        { value: '10K+', label: 'Creators' },
        { value: '250K+', label: 'Posts' },
        { value: '5+', label: 'Networks' },
      ].map((s, i) => (
        <div key={s.label} className="flex items-center gap-4 sm:gap-6">
          {i > 0 && <div className="w-px h-5 bg-slate-200" />}
          <div className="text-center">
            <p className="text-sm sm:text-base font-semibold tabular-nums leading-none text-slate-900">
              {s.value}
            </p>
            <p className="mt-1 text-[9px] sm:text-[10px] uppercase tracking-widest">{s.label}</p>
          </div>
        </div>
      ))}
    </div> */}
  </div>
);

export default AuthShell;
