import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { cn } from '@/lib/utils';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { confirmPasswordReset, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const linkInvalid = !uid || !token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await confirmPasswordReset(uid!, token!, newPassword);
      toast.success('Password reset. Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(String(err ?? 'Could not reset password'));
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

          {linkInvalid ? (
            <div className="text-center py-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Invalid reset link</h2>
              <p className="mt-2 text-sm text-slate-500">
                This password reset link is missing or malformed. Please request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="mt-6 inline-flex items-center justify-center w-full h-11 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white shadow-md shadow-blue-500/30"
              >
                Request new link
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-[11px] font-semibold tracking-widest text-blue-600 uppercase">
                  Reset password
                </p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Set a new password
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a new password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-medium text-slate-700">
                    New password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-700">
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
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
                      Reset password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </AuthShell>
  );
};

export default ResetPassword;
