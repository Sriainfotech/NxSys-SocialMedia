import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CalendarClock,
  Users2,
  BarChart3,
  Film,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Link2,
  PencilLine,
  Share2,
  Send,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  Image as ImageIcon,
  Smile,
  Hash,
  Play,
  TrendingUp,
  Heart,
  MessageCircle,
  Plus,
  Check,
  Crown,
  Shield,
  Loader2,
  Infinity as InfinityIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useBillingStore, type Plan } from "@/stores/billingStore";
import { cn } from "@/lib/utils";

const platforms = [
  { name: "Instagram", icon: Instagram, color: "from-pink-500 to-orange-400" },
  { name: "Facebook", icon: Facebook, color: "from-blue-600 to-blue-400" },
  { name: "LinkedIn", icon: Linkedin, color: "from-sky-700 to-sky-500" },
  { name: "Twitter", icon: Twitter, color: "from-slate-900 to-slate-600" },
  { name: "YouTube", icon: Youtube, color: "from-red-600 to-red-400" },
];

/* ----------------------------- Navbar ----------------------------- */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-white/70 border-b border-slate-200/60 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 group min-w-0">
          <img src="/logo.png" alt="Social Media Hub" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform shrink-0" />
          <span className="font-semibold text-slate-900 tracking-tight truncate">
            <span className="hidden sm:inline">Social Media Hub</span>
            <span className="sm:hidden">SocialHub</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#showcase" className="hover:text-slate-900 transition-colors">Product</a>
          <a href="#how" className="hover:text-slate-900 transition-colors">How it works</a>
          <a href="#benefits" className="hover:text-slate-900 transition-colors">Benefits</a>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Link to="/login" className="hidden xs:block">
            <Button variant="ghost" className="text-slate-700 hover:text-slate-900 h-9 px-3 text-sm">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white shadow-md shadow-blue-500/30 rounded-full px-4 sm:px-5 h-9 text-sm">
              Start free trial
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

/* ----------------------------- Hero Mock ----------------------------- */
const HeroMock = () => {
  const [selected, setSelected] = useState<string[]>(["Instagram", "Twitter"]);
  const toggle = (p: string) =>
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {/* Floating gradient glow */}
      <div className="absolute -inset-8 bg-gradient-to-br from-blue-400/30 to-blue-300/20 blur-3xl rounded-full" />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative bg-white rounded-2xl shadow-2xl shadow-blue-500/20 border border-slate-200/70 p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">SM</div>
            <div>
              <p className="text-sm font-medium text-slate-900">New post</p>
              <p className="text-xs text-slate-500">Compose & schedule</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
          <p className="text-sm text-slate-800 leading-relaxed">
            Launching <span className="text-blue-600 font-medium">#SocialMediaHub</span> today ✨
            One post, every platform. Save hours every week and never miss a beat.
          </p>
          <div className="mt-3 aspect-[16/8] rounded-lg bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.25),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(236,72,153,0.25),transparent_50%)]" />
            <ImageIcon className="w-8 h-8 text-blue-500/70 relative" />
          </div>
          <div className="mt-3 flex items-center gap-3 text-slate-400">
            <ImageIcon className="w-4 h-4" />
            <Smile className="w-4 h-4" />
            <Hash className="w-4 h-4" />
            <Play className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-slate-600 mb-2">Publish to</p>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => {
              const active = selected.includes(p.name);
              const Icon = p.icon;
              return (
                <button
                  key={p.name}
                  onClick={() => toggle(p.name)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? "border-transparent text-white shadow-md"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                  }`}
                  style={
                    active
                      ? {
                          background:
                            p.name === "Instagram"
                              ? "linear-gradient(90deg, #ec4899, #f59e0b)"
                              : p.name === "Facebook"
                              ? "linear-gradient(90deg, #2563eb, #60a5fa)"
                              : p.name === "LinkedIn"
                              ? "linear-gradient(90deg, #0369a1, #0ea5e9)"
                              : p.name === "YouTube"
                              ? "linear-gradient(90deg, #dc2626, #f87171)"
                              : "linear-gradient(90deg, #0f172a, #475569)",
                        }
                      : {}
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {p.name}
                  {active && <CheckCircle2 className="w-3 h-3 opacity-90" />}
                </button>
              );
            })}
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border border-dashed border-slate-300 text-slate-500 bg-white"
              title="More networks coming soon"
            >
              <Plus className="w-3 h-3" />
              more soon
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarClock className="w-4 h-4" />
            Scheduled · Tomorrow 9:00 AM
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:opacity-95 rounded-full h-9 px-4 text-xs">
            <Send className="w-3.5 h-3.5" />
            Publish
          </Button>
        </div>
      </motion.div>

      {/* Floating mini cards */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-10 top-8 bg-white rounded-xl shadow-xl border border-slate-200 p-3 w-48 hidden lg:block"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <p className="text-xs font-medium text-slate-700">Engagement</p>
        </div>
        <p className="text-lg font-semibold text-slate-900 mt-1">+128%</p>
        <div className="mt-2 h-8 flex items-end gap-1">
          {[30, 50, 40, 70, 55, 85, 95].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-blue-400 to-blue-500"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -right-6 -bottom-6 bg-white rounded-xl shadow-xl border border-slate-200 p-3 w-44 hidden lg:block"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <p className="text-xs font-medium text-slate-700">Posted to 5 networks</p>
        </div>
        <div className="mt-2 flex items-center gap-1">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.name} className={`w-6 h-6 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                <Icon className="w-3 h-3 text-white" />
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ----------------------------- Hero ----------------------------- */
const Hero = () => (
  <section className="relative pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-24 md:pb-28 overflow-hidden">
    {/* Gradient background */}
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-white" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/30 to-blue-300/20 rounded-full blur-3xl" />
      <div className="absolute -top-20 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-pink-400/20 rounded-full blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(99,102,241,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.2) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center top, black 30%, transparent 70%)",
        }}
      />
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-blue-100 shadow-sm text-xs font-medium text-blue-700"
        >
          <Sparkles className="w-3.5 h-3.5" />
          One app. Every platform.
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]"
        >
          Post Once.{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Publish Everywhere.
            </span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-5 text-lg text-slate-600 leading-relaxed max-w-xl"
        >
          One credit-based workspace for every network. Schedule, publish, and track performance
          across Instagram, Facebook, LinkedIn, Twitter, and YouTube — with more coming soon.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Link to="/register">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:opacity-95 rounded-full px-7 h-12 shadow-lg shadow-blue-500/30"
            >
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-7 h-12 border-slate-300 bg-white/60 backdrop-blur hover:bg-white"
            >
              <Link2 className="w-4 h-4" />
              Connect Accounts
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center gap-4 sm:gap-6 text-xs text-slate-500 flex-wrap"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            7-day free trial
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            No credit card required
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Cancel anytime
          </div>
        </motion.div>
      </div>

      <HeroMock />
    </div>
  </section>
);

/* ----------------------------- Trust ----------------------------- */
const Trust = () => (
  <section className="py-10 sm:py-14 border-y border-slate-200/60 bg-white/60">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <p className="text-center text-xs font-medium tracking-widest text-slate-500 uppercase">
        Trusted by creators, startups, and teams
      </p>
      <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 sm:gap-8 items-center">
        {["Northwind", "Lumen", "Orbital", "Pulse", "Nimbus", "Vertex"].map((name) => (
          <div
            key={name}
            className="text-center text-slate-400 font-semibold tracking-tight text-base sm:text-lg hover:text-slate-700 transition-colors"
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ----------------------------- Features ----------------------------- */
const features = [
  {
    icon: Layers,
    title: "Multi-Platform Posting",
    desc: "Write once, publish everywhere across Instagram, Facebook, LinkedIn, Twitter, and YouTube — with more on the way.",
    gradient: "from-blue-600 to-blue-500",
  },
  {
    icon: CalendarClock,
    title: "Schedule Posts",
    desc: "Plan content in advance with a calendar-first workflow and queues.",
    gradient: "from-blue-500 to-blue-400",
  },
  {
    icon: Users2,
    title: "Connected Accounts",
    desc: "Manage all your accounts in one place, with role-based team access.",
    gradient: "from-blue-400 to-blue-300",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track performance, growth and engagement with clean visual reports.",
    gradient: "from-blue-500 to-blue-500",
  },
  {
    icon: Film,
    title: "Reels & Stories",
    desc: "Upload Instagram Reels and Stories with full-format support and previews.",
    gradient: "from-pink-500 to-orange-400",
  },
  {
    icon: Twitter,
    title: "Twitter Integration",
    desc: "Post threads, images and scheduled tweets with native Twitter support.",
    gradient: "from-slate-800 to-slate-500",
  },
];

const Features = () => (
  <section id="features" className="py-16 sm:py-20 md:py-28 relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase">Features</p>
        <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
          Everything you need to ship content faster.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600">
          A thoughtfully designed toolkit for modern creators and teams — built to remove friction
          from every step of your social workflow.
        </p>
      </div>

      <div className="mt-10 sm:mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="group relative bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all"
            >
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-md`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

/* ----------------- Interactive Product Tour (tabbed, auto-advance) ----------------- */
const showcaseSteps = [
  {
    key: "dashboard",
    icon: BarChart3,
    label: "Dashboard",
    title: "Your command center.",
    desc: "Every scheduled post, every network, every metric — at a glance.",
    highlights: ["Unified inbox", "Live activity", "Team overview"],
  },
  {
    key: "compose",
    icon: PencilLine,
    label: "Compose",
    title: "A composer you'll love.",
    desc: "Rich formatting, media attachments, and native previews for each network.",
    highlights: ["Drag & drop media", "AI captions", "Emoji & hashtags"],
  },
  {
    key: "platforms",
    icon: Share2,
    label: "Platforms",
    title: "Publish anywhere, instantly.",
    desc: "Pick any combination of Instagram, Facebook, LinkedIn, Twitter, and YouTube in one click.",
    highlights: ["Per-network variants", "Character-count safe", "Reel & Story support"],
  },
  {
    key: "schedule",
    icon: CalendarClock,
    label: "Schedule",
    title: "Plan weeks in minutes.",
    desc: "Queue content with a calendar-first workflow and optimal posting times.",
    highlights: ["Drag to reschedule", "Time-slot suggestions", "Bulk import"],
  },
  {
    key: "analytics",
    icon: TrendingUp,
    label: "Analytics",
    title: "Growth you can measure.",
    desc: "Beautiful reports that connect content to engagement and follower growth.",
    highlights: ["Cross-network reach", "Top-performing posts", "Export & share"],
  },
];

const ShowcasePreview = ({ step }: { step: number }) => {
  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-2xl shadow-blue-500/10 overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="dash"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-slate-400">Welcome back</p>
                <p className="text-lg font-semibold text-slate-900">Dashboard</p>
              </div>
              <div className="flex items-center gap-1">
                {platforms.map((p) => {
                  const Icon = p.icon;
                  return (
                    <div key={p.name} className={`w-7 h-7 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Posts", value: "128", icon: Send },
                { label: "Scheduled", value: "42", icon: CalendarClock },
                { label: "Engagement", value: "+28%", icon: TrendingUp },
              ].map((s) => {
                const I = s.icon;
                return (
                  <div key={s.label} className="rounded-xl border border-slate-200 p-3 bg-white">
                    <I className="w-4 h-4 text-blue-600" />
                    <p className="mt-3 text-lg font-semibold text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-600 mb-3">Weekly reach</p>
              <div className="h-20 flex items-end gap-2">
                {[40, 70, 55, 80, 65, 90, 75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-md bg-gradient-to-t from-blue-600 to-blue-500"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 p-6"
          >
            <p className="text-lg font-semibold text-slate-900 mb-4">Create post</p>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-800 leading-relaxed">
                Big update to <span className="text-blue-600 font-medium">#SocialMediaHub</span> — one composer, every platform. 🚀
              </p>
              <div className="mt-3 aspect-[16/7] rounded-lg bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-blue-500/70" />
              </div>
              <div className="mt-3 flex items-center gap-3 text-slate-400">
                <ImageIcon className="w-4 h-4" />
                <Smile className="w-4 h-4" />
                <Hash className="w-4 h-4" />
                <Play className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="platforms"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 p-6 flex flex-col justify-center"
          >
            <p className="text-lg font-semibold text-slate-900 mb-5">Select platforms</p>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-xl border-2 border-blue-500/50 bg-white p-4 flex items-center gap-3 shadow-sm"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">Connected</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 p-6"
          >
            <p className="text-lg font-semibold text-slate-900 mb-4">Schedule</p>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {Array.from({ length: 21 }).map((_, i) => {
                  const highlighted = [3, 7, 11, 14, 18].includes(i);
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-md text-[10px] flex items-center justify-center ${
                        highlighted
                          ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white font-medium"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { time: "9:00 AM", label: "Instagram · Reel" },
                  { time: "1:30 PM", label: "LinkedIn · Post" },
                  { time: "6:00 PM", label: "Twitter · Thread" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-xs border border-slate-200 rounded-lg px-3 py-2">
                    <span className="text-slate-500">{s.time}</span>
                    <span className="text-slate-800 font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 p-6"
          >
            <p className="text-lg font-semibold text-slate-900 mb-4">Analytics</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { label: "Impressions", value: "42.3K", icon: TrendingUp },
                { label: "Engagement", value: "9.1%", icon: Heart },
                { label: "Replies", value: "318", icon: MessageCircle },
                { label: "New followers", value: "+214", icon: Users2 },
              ].map((s) => {
                const I = s.icon;
                return (
                  <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-3">
                    <I className="w-4 h-4 text-blue-600" />
                    <p className="mt-2 text-base font-semibold text-slate-900">{s.value}</p>
                    <p className="text-[11px] text-slate-500">{s.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <svg viewBox="0 0 200 60" className="w-full h-16">
                <defs>
                  <linearGradient id="line" x1="0" x2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
                <polyline
                  points="0,50 20,40 40,45 60,30 80,35 100,22 120,28 140,15 160,20 180,10 200,5"
                  fill="none"
                  stroke="url(#line)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AUTO_ADVANCE_MS = 6000;

const Showcase = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    if (isPaused) return;
    const id = window.setTimeout(() => {
      setActiveStep((s) => (s + 1) % showcaseSteps.length);
      setProgressKey((k) => k + 1);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [activeStep, isPaused]);

  const handleTabClick = (i: number) => {
    setActiveStep(i);
    setProgressKey((k) => k + 1);
  };

  const current = showcaseSteps[activeStep];

  return (
    <section
      id="showcase"
      className="relative py-16 sm:py-20 md:py-24 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-blue-50/40 to-white" />
      <div className="absolute -z-10 left-1/2 top-40 -translate-x-1/2 w-[80%] max-w-5xl h-[420px] bg-gradient-to-r from-blue-300/30 to-blue-200/30 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-blue-100 shadow-sm text-xs font-medium text-blue-700">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive tour
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            See it in action.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            A glimpse of the workflow — hover to pause, click any tab to explore.
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-8 sm:mt-12 flex items-center justify-center">
          <div className="inline-flex flex-wrap items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full shadow-lg shadow-blue-500/5">
            {showcaseSteps.map((s, i) => {
              const Icon = s.icon;
              const active = i === activeStep;
              return (
                <button
                  key={s.key}
                  onClick={() => handleTabClick(i)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    active ? "text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="tour-pill"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-md shadow-blue-500/40"
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main panel */}
        <div className="mt-8 sm:mt-10 grid lg:grid-cols-5 gap-6 lg:gap-8 items-center">
          {/* Copy side */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
                  {String(activeStep + 1).padStart(2, "0")} · {current.label}
                </p>
                <h3 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                  {current.title}
                </h3>
                <p className="mt-4 text-slate-600 leading-relaxed">{current.desc}</p>

                <ul className="mt-6 space-y-3">
                  {current.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots + bar */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                {showcaseSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleTabClick(i)}
                    aria-label={`Go to step ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeStep
                        ? "w-8 bg-gradient-to-r from-blue-600 to-blue-500"
                        : "w-1.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-slate-400">
                {isPaused ? "Paused" : "Auto-playing"}
              </div>
            </div>
          </div>

          {/* Preview side */}
          <div className="lg:col-span-3">
            <div className="relative">
              {/* Gradient frame */}
              <div className="absolute -inset-[1.5px] rounded-[20px] bg-gradient-to-br from-blue-600 to-blue-400 opacity-70 blur-[2px]" />
              <div className="absolute -inset-12 bg-gradient-to-br from-blue-400/20 to-blue-300/20 blur-3xl rounded-full -z-10" />

              <div className="relative rounded-[18px] bg-white p-1.5 shadow-2xl shadow-blue-500/20">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-3 pt-1.5 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-3 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-500 font-medium">
                      app.socialmediahub.com / {current.key}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <ShowcasePreview step={activeStep} />

                {/* Auto-advance progress bar */}
                <div className="absolute bottom-1.5 left-1.5 right-1.5 h-0.5 rounded-full bg-slate-200/70 overflow-hidden">
                  <motion.div
                    key={progressKey}
                    initial={{ width: "0%" }}
                    animate={{ width: isPaused ? "0%" : "100%" }}
                    transition={{ duration: isPaused ? 0 : AUTO_ADVANCE_MS / 1000, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ----------------------------- Mid CTA ----------------------------- */
const MidCTA = () => (
  <section className="py-16 sm:py-20 md:py-24">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 to-blue-400 p-8 sm:p-10 md:p-14 text-center shadow-2xl shadow-blue-500/30">
        <div className="absolute -top-20 -left-10 w-60 h-60 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <h2 className="relative text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
          Start managing your social media smarter today.
        </h2>
        <p className="relative mt-4 text-sm sm:text-base text-white/80 max-w-xl mx-auto">
          Join thousands of creators and teams using Social Media Hub to publish everywhere, faster. Free for 7 days.
        </p>
        <div className="relative mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-white/90 rounded-full px-6 sm:px-8 h-11 sm:h-12 font-semibold shadow-lg"
            >
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

/* ----------------------------- How It Works ----------------------------- */
const steps = [
  { icon: Link2, title: "Connect accounts", desc: "Link all your social profiles in seconds." },
  { icon: PencilLine, title: "Create your post", desc: "Compose, attach media and preview." },
  { icon: Share2, title: "Choose platforms", desc: "Pick where you want it published." },
  { icon: Send, title: "Publish or schedule", desc: "Post now or plan it on the calendar." },
];

const HowItWorks = () => (
  <section id="how" className="py-16 sm:py-20 md:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase">How it works</p>
        <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
          Four steps. That's it.
        </h2>
      </div>

      <div className="mt-10 sm:mt-14 relative grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
        <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-blue-500/10 flex items-center justify-center relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-blue-600">Step {i + 1}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600 max-w-[14rem]">{s.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

/* ----------------------------- Benefits ----------------------------- */
const benefits = [
  { icon: Clock, title: "Save Time", desc: "Cut hours from your weekly publishing routine." },
  { icon: Zap, title: "Stay Consistent", desc: "Never miss a post with smart schedules." },
  { icon: Layers, title: "One Place for Everything", desc: "Content, accounts, and analytics unified." },
  { icon: TrendingUp, title: "Increase Productivity", desc: "Do more with a streamlined workflow." },
];

const Benefits = () => (
  <section id="benefits" className="py-16 sm:py-20 md:py-24 bg-slate-50/50 border-y border-slate-200/60">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase">Benefits</p>
        <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
          Built to help you do more, faster.
        </h2>
      </div>
      <div className="mt-8 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {benefits.map((b, i) => {
          const Icon = b.icon;
          return (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200/70 p-6 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{b.title}</h3>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{b.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

/* ----------------------------- Final CTA ----------------------------- */
const FinalCTA = () => (
  <section className="py-16 sm:py-20 md:py-28">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]"
      >
        Ready to simplify your{" "}
        <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
          social media workflow?
        </span>
      </motion.h2>
      <p className="mt-5 text-base sm:text-lg text-slate-600">
        Try Social Media Hub free for 7 days — no credit card required.
      </p>
      <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/register">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:opacity-95 rounded-full px-6 sm:px-8 h-11 sm:h-12 shadow-lg shadow-blue-500/30"
          >
            Start free trial
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link to="/login">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-6 sm:px-8 h-11 sm:h-12 border-slate-300 bg-white hover:bg-slate-50"
          >
            Login
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

/* ----------------------------- Footer ----------------------------- */
const Footer = () => (
  <footer className="border-t border-slate-200/60 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Social Media Hub" className="w-9 h-9 object-contain" />
          <span className="font-semibold text-slate-900 tracking-tight">Social Media Hub</span>
        </div>
        <p className="mt-4 text-sm text-slate-500 leading-relaxed">
          One platform to manage all your social media accounts.
        </p>
        <div className="mt-4 flex items-center gap-3">
          {[Instagram, Facebook, Linkedin, Twitter].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900">Product</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li><Link to="/dashboard" className="hover:text-slate-900">Dashboard</Link></li>
          <li><Link to="/dashboard/posts" className="hover:text-slate-900">Posts</Link></li>
          <li><Link to="/dashboard/scheduled" className="hover:text-slate-900">Scheduled Posts</Link></li>
          <li><Link to="/dashboard/accounts" className="hover:text-slate-900">Connected Accounts</Link></li>
        </ul>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900">Company</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li><a href="#features" className="hover:text-slate-900">Features</a></li>
          <li><a href="#how" className="hover:text-slate-900">How it works</a></li>
          <li><a href="#benefits" className="hover:text-slate-900">Benefits</a></li>
          <li><Link to="/privacy-policy" className="hover:text-slate-900">Privacy Policy</Link></li>
          <li><Link to="/terms" className="hover:text-slate-900">Terms &amp; Conditions</Link></li>
        </ul>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900">Get started</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li><Link to="/register" className="hover:text-slate-900">Create account</Link></li>
          <li><Link to="/login" className="hover:text-slate-900">Log in</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-center md:text-left">
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Social Media Hub. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="/privacy-policy" className="text-xs text-slate-400 hover:text-blue-600 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="text-xs text-slate-400 hover:text-blue-600 transition-colors">Terms &amp; Conditions</Link>
        </div>
      </div>
    </div>
  </footer>
);

/* ----------------------------- Page ----------------------------- */
const Index = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="bg-white text-slate-900 min-h-screen scroll-smooth">
      <Navbar />
      <main>
        <Hero />
        <Trust />
        <Features />
        <Showcase />
        <MidCTA />
        <HowItWorks />
        <Benefits />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
