import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Loader2,
  User,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { cn } from '@/lib/utils';

// Cheap password strength heuristic: length + class coverage.
const scorePassword = (pw: string): number => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(4, score);
};

const STRENGTH_META = [
  { label: 'Too short', color: 'bg-slate-300', text: 'text-slate-500' },
  { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' },
  { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' },
  { label: 'Good', color: 'bg-emerald-500', text: 'text-emerald-600' },
  { label: 'Strong', color: 'bg-emerald-600', text: 'text-emerald-700' },
];

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const strength = useMemo(() => scorePassword(password), [password]);
  const strengthMeta = STRENGTH_META[strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      await register(name, email, password);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(String(err ?? 'Could not create your account'));
    }
  };

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="relative bg-white rounded-3xl border border-slate-200/70 shadow-2xl shadow-blue-500/15 p-6 sm:p-8">
          <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

          <div className="mb-6">
            <p className="text-[11px] font-semibold tracking-widest text-blue-600 uppercase">
              Get started
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Create your account.
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              7-day free trial · No credit card required.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium text-slate-700">
                Full name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  placeholder="Jane Cooper"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  autoComplete="name"
                  className={cn(
                    'w-full h-11 pl-10 pr-3 rounded-xl text-sm bg-slate-50 border border-slate-200',
                    'focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none',
                    'transition-colors'
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-slate-700">
                Email
              </Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  className={cn(
                    'w-full h-11 pl-10 pr-3 rounded-xl text-sm bg-slate-50 border border-slate-200',
                    'focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none',
                    'transition-colors'
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className={cn(
                    'w-full h-11 pl-10 pr-10 rounded-xl text-sm bg-slate-50 border border-slate-200',
                    'focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none',
                    'transition-colors'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {password && (
                <div className="pt-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex-1 h-1 rounded-full transition-colors',
                          i < strength ? strengthMeta.color : 'bg-slate-200'
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn('mt-1 text-[11px] font-medium', strengthMeta.text)}>
                    {strengthMeta.label}
                  </p>
                </div>
              )}
            </div>

            <Button
              className="w-full h-11 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white shadow-md shadow-blue-500/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Start free trial
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Reassurance row */}
          <div className="mt-5 flex items-center justify-between gap-2 text-[11px] text-slate-500">
            {['7-day trial', 'No card', 'Cancel anytime'].map((t) => (
              <span key={t} className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {t}
              </span>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already registered?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-[11px] text-slate-500">
          By creating an account you agree to our{' '}
          <a href="#" className="text-slate-700 hover:text-slate-900 hover:underline">Terms</a> and{' '}
          <a href="#" className="text-slate-700 hover:text-slate-900 hover:underline">Privacy Policy</a>.
        </p>
      </motion.div>
    </AuthShell>
  );
};

export default Register;
