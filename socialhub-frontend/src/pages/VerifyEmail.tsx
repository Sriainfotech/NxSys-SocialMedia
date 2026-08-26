import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';

type Status = 'verifying' | 'success' | 'error';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuthStore();
  const [status, setStatus] = useState<Status>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    if (!token) {
      setStatus('error');
      setErrorMessage('This verification link is missing a token.');
      return;
    }

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMessage(String(err ?? 'Could not verify your email.'));
      });
  }, [token, verifyEmail]);

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="relative bg-white rounded-3xl border border-slate-200/70 shadow-2xl shadow-blue-500/15 p-6 sm:p-8 text-center py-10">
          <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

          {status === 'verifying' && (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Verifying your email…</h2>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Email verified</h2>
              <p className="mt-2 text-sm text-slate-500">Your email has been confirmed.</p>
              <Link
                to="/dashboard"
                className="mt-6 inline-flex items-center justify-center w-full h-11 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white shadow-md shadow-blue-500/30"
              >
                Go to dashboard
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Verification failed</h2>
              <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center justify-center w-full h-11 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white shadow-md shadow-blue-500/30"
              >
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </AuthShell>
  );
};

export default VerifyEmail;
