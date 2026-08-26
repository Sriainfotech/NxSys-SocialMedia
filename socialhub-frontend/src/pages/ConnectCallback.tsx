import { useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAccountStore } from '@/stores/accountStore';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ConnectCallback = () => {
  const { platform } = useParams<{ platform: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeCallback, isLoading } = useAccountStore();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    if (!platform) return;
    
    called.current = true;
    const params = Object.fromEntries(searchParams.entries());
    
    // If the backend redirected us back with an explicit error in the URL
    if (params.status === 'error') {
      const errorMsg = params.message || 'Social connection failed';
      toast.error(errorMsg);
      setTimeout(() => navigate('/dashboard/accounts'), 3000);
      return;
    }
    
    // The store's completeCallback now internally deduplicates requests
    // so Mount 1 and Mount 2 will share the same backend call.
    completeCallback(platform, params)
      .then(() => {
        toast.success(`Successfully connected ${platform}!`);
        setTimeout(() => navigate('/dashboard/accounts'), 2000);
      })
      .catch((error) => {
        // If the error is 'cancelled' or similar from a previous unmount
        // the store handles the state, so we just show the message if it's a real error.
        if (error !== 'canceled') {
          toast.error(error.toString());
          setTimeout(() => navigate('/dashboard/accounts'), 3000);
        }
      });
  }, [platform, searchParams, completeCallback, navigate]);


  return (
    <div className="relative min-h-[60vh] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/15 to-pink-400/10 rounded-full blur-3xl" />

      <div className="relative bg-white border border-slate-200/70 rounded-3xl p-10 shadow-2xl shadow-blue-500/15 max-w-md w-full animate-in fade-in zoom-in duration-500">
        {isLoading ? (
          <>
            <div className="relative mb-6 mx-auto w-20 h-20">
              <Loader2 className="w-20 h-20 animate-spin text-blue-500 opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 animate-pulse shadow-lg shadow-blue-500/40" />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Finalizing Connection</h2>
            <p className="text-slate-500">
              Please wait while we securely connect your {platform} account...
            </p>
          </>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/40">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Connected!</h2>
              <p className="text-slate-500">
                Your {platform} account has been successfully linked.
              </p>
            </div>
            <Button
              onClick={() => navigate('/dashboard/accounts')}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white rounded-full shadow-md shadow-blue-500/30"
            >
              Go to Connected Accounts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectCallback;
