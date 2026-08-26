import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Loader2,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { cn } from '@/lib/utils';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await login(identifier, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(String(err ?? 'Could not sign you in'));
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
          {/* Top gradient accent */}
          <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

          <div className="mb-6">
            <p className="text-[11px] font-semibold tracking-widest text-blue-600 uppercase">
              Sign in
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back.
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter your details to pick up where you left off.
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
              <Label htmlFor="identifier" className="text-xs font-medium text-slate-700">
                Username or email
              </Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="identifier"
                  type="text"
                  placeholder="you@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                  className={cn(
                    'w-full h-11 pl-10 pr-3 rounded-xl text-sm bg-slate-50 border border-slate-200',
                    'focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none',
                    'transition-colors'
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-slate-700">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
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
            </div>

            <Button
              className="w-full h-11 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white shadow-md shadow-blue-500/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            New here?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-[11px] text-slate-500">
          By signing in you agree to our{' '}
          <a href="#" className="text-slate-700 hover:text-slate-900 hover:underline">Terms</a> and{' '}
          <a href="#" className="text-slate-700 hover:text-slate-900 hover:underline">Privacy Policy</a>.
        </p>
      </motion.div>
    </AuthShell>
  );
};

export default Login;
