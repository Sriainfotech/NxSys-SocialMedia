import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccountStore } from '@/stores/accountStore';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const SocialAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchAccounts } = useAccountStore();
  const handled = useRef(false);

  const params = new URLSearchParams(location.search);
  const status = params.get('status');
  const platform = params.get('platform') || 'account';
  const errorMessage = params.get('message');
  const isSuccess = status === 'success';

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    if (isSuccess) {
      fetchAccounts().catch(() => {});
      toast.success(`Successfully connected ${platform}!`);
      const t = setTimeout(() => navigate('/dashboard/accounts'), 2000);
      return () => clearTimeout(t);
    }

    if (status === 'error') {
      toast.error(errorMessage || `Failed to connect ${platform}`);
      const t = setTimeout(() => navigate('/dashboard/accounts'), 3000);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => navigate('/dashboard/accounts'), 3000);
    return () => clearTimeout(t);
  }, [isSuccess, status, platform, errorMessage, fetchAccounts, navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 text-center bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-white" />
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-gradient-to-br from-blue-400/25 to-blue-300/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] bg-gradient-to-br from-blue-400/20 to-blue-300/15 rounded-full blur-3xl" />

      <div className="relative bg-white border border-slate-200/70 rounded-3xl p-10 shadow-2xl shadow-blue-500/15 max-w-md w-full animate-in fade-in zoom-in duration-500">
        {isSuccess ? (
          <>
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/40">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Connected!</h2>
            <p className="text-slate-500">
              Your {platform} account has been successfully linked. Redirecting…
            </p>
          </>
        ) : status === 'error' ? (
          <>
            <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-red-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/40">
              <XCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Connection Failed</h2>
            <p className="text-slate-500">
              {errorMessage || `Could not connect ${platform}.`}
            </p>
            <p className="text-xs text-slate-400 mt-3">Redirecting…</p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Processing…</h2>
            <p className="text-slate-500">Finalizing your connection.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SocialAuthCallback;
