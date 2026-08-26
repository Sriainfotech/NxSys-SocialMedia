import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { cn } from '@/lib/utils';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { requestPasswordReset, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      toast.error(String(err ?? 'Could not send reset email'));
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

          {sent ? (
            <div className="text-center py-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Check your email</h2>
              <p className="mt-2 text-sm text-slate-500">
                If an account exists for <span className="font-medium text-slate-700">{email}</span>, we've sent a link to reset your password.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center justify-center w-full h-11 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white shadow-md shadow-blue-500/30"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-[11px] font-semibold tracking-widest text-blue-600 uppercase">
                  Reset password
                </p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Forgot your password?
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter your email and we'll send you a link to reset it.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-slate-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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

                <Button
                  className="w-full h-11 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white shadow-md shadow-blue-500/30"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                Remembered your password?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </AuthShell>
  );
};

export default ForgotPassword;
