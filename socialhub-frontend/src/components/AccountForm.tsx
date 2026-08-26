import { useState } from 'react';
import { useAccountStore } from '@/stores/accountStore';
import type { Platform } from '@/stores/postStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Loader2, Twitter, Linkedin, Facebook, Instagram, Youtube,
  ArrowLeft, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PLATFORMS: { id: Platform; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'twitter', label: 'Twitter', icon: Twitter, color: 'bg-[hsl(203,89%,53%)]' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-[hsl(210,80%,42%)]' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-[hsl(221,44%,41%)]' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-[hsl(340,75%,54%)]' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'bg-[hsl(0,100%,50%)]' },
];

interface AccountFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialPlatform?: Platform | null;
}

const AccountForm = ({ onSuccess, onCancel, initialPlatform = null }: AccountFormProps) => {
  const [platform, setPlatform] = useState<Platform | null>(initialPlatform);
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [accountId, setAccountId] = useState('');
  const [expiresAt, setExpiresAt] = useState('2026-12-31T10:00:00Z');
  const { startConnection, isConnecting } = useAccountStore();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform) {
      toast.error('Please select a platform');
      return;
    }
    setError(null);
    try {
      const result = await startConnection(platform);
      // The user will be redirected, so we don't need onSuccess here
      // unless the backend returns immediately (unlikely for start)
      console.log(result);
    } catch (err: any) {
      setError(err.toString());
      toast.error(err.toString());
    }
  };

  return (
    <div className="animate-slide-up bg-white rounded-2xl border border-slate-200/70 p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 rounded-lg">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Connect New Account</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label className="text-base text-slate-900">Select Platform</Label>
            <p className="text-sm text-slate-500">Choose a social media platform to connect your account.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PLATFORMS.map((p) => {
              const Icon = p.icon;
              const isSelected = platform === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={cn(
                    'flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all relative group bg-white',
                    isSelected
                      ? 'border-transparent bg-gradient-to-br from-blue-50 to-blue-50 ring-4 ring-blue-500/20 shadow-md shadow-blue-500/15'
                      : 'border-slate-200 hover:border-blue-300 hover:-translate-y-0.5 hover:shadow-md'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110',
                    p.color
                  )}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{p.label}</span>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-full p-1 shadow-md">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 pt-4 border-t border-slate-200">
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white rounded-full shadow-md shadow-blue-500/30"
              disabled={!platform || !!isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                `Connect ${platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Account'}`
              )}
            </Button>
            <Button type="button" variant="outline" className="h-12 px-6 rounded-full border-slate-300" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          <p className="text-center text-xs text-slate-500 px-4">
            You will be redirected to the platform to authorize access to your account.
            We only request permissions necessary to post on your behalf.
          </p>
        </div>
      </form>
    </div>
  );
};

export default AccountForm;
