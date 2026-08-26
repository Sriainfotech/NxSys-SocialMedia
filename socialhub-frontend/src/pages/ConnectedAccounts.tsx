import { useEffect, useMemo, useState } from 'react';
import { useAccountStore } from '@/stores/accountStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Loader2, Twitter, Linkedin, Facebook, Instagram, Youtube,
  CheckCircle2, Link2Off, Plus, UserPlus, Sparkles, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Platform } from '@/stores/postStore';
import AccountForm from '@/components/AccountForm';
import ConfirmDialog from '@/components/ConfirmDialog';

interface PlatformMeta {
  label: string;
  icon: React.ElementType;
  color: string;
  soft: string;
  text: string;
  description: string;
}

const PLATFORM_META: Record<Platform, PlatformMeta> = {
  twitter: {
    label: 'Twitter',
    icon: Twitter,
    color: 'bg-[hsl(203,89%,53%)]',
    soft: 'bg-[hsl(203,89%,53%)]/10',
    text: 'text-[hsl(203,89%,42%)]',
    description: 'Share tweets and threads',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-[hsl(210,80%,42%)]',
    soft: 'bg-[hsl(210,80%,42%)]/10',
    text: 'text-[hsl(210,80%,35%)]',
    description: 'Professional updates and articles',
  },
  facebook: {
    label: 'Facebook',
    icon: Facebook,
    color: 'bg-[hsl(221,44%,41%)]',
    soft: 'bg-[hsl(221,44%,41%)]/10',
    text: 'text-[hsl(221,44%,35%)]',
    description: 'Page posts and stories',
  },
  instagram: {
    label: 'Instagram',
    icon: Instagram,
    color: 'bg-[hsl(340,75%,54%)]',
    soft: 'bg-[hsl(340,75%,54%)]/10',
    text: 'text-[hsl(340,75%,45%)]',
    description: 'Photos, reels, and stories',
  },
  youtube: {
    label: 'YouTube',
    icon: Youtube,
    color: 'bg-[hsl(0,100%,50%)]',
    soft: 'bg-[hsl(0,100%,50%)]/10',
    text: 'text-[hsl(0,85%,42%)]',
    description: 'Videos and shorts',
  },
};

const PLATFORM_ORDER: Platform[] = ['twitter', 'linkedin', 'facebook', 'instagram', 'youtube'];

const ConnectedAccounts = () => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const { accounts, disconnectAccount, isConnecting, startConnection, fetchAccounts, isLoading } = useAccountStore();

  useEffect(() => { fetchAccounts().catch(() => { }); }, [fetchAccounts]);

  const accountsByPlatform = useMemo(() => {
    const map = {} as Record<Platform, typeof accounts>;
    PLATFORM_ORDER.forEach((p) => { map[p] = []; });
    accounts.forEach((a) => {
      if (map[a.platform]) map[a.platform].push(a);
    });
    return map;
  }, [accounts]);

  const connectedPlatforms = useMemo(
    () => PLATFORM_ORDER.filter((p) => accountsByPlatform[p].length > 0),
    [accountsByPlatform]
  );
  const availablePlatforms = useMemo(
    () => PLATFORM_ORDER.filter((p) => accountsByPlatform[p].length === 0),
    [accountsByPlatform]
  );

  const [disconnectTarget, setDisconnectTarget] = useState<{ id: number; label: string; handle?: string } | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const confirmDisconnect = async () => {
    if (!disconnectTarget) return;
    setDisconnecting(true);
    try {
      await disconnectAccount(disconnectTarget.id);
      toast.success(`${disconnectTarget.label} disconnected`);
      setDisconnectTarget(null);
    } catch (error: any) {
      toast.error(error.toString());
    } finally {
      setDisconnecting(false);
    }
  };

  const handleConnect = async (platform: Platform, force = false) => {
    try {
      await startConnection(platform, { force });
    } catch (error: any) {
      toast.error(error.toString?.() || 'Failed to start connection');
    }
  };

  if (view === 'add') {
    return (
      <div className="max-w-3xl mx-auto">
        <AccountForm
          initialPlatform={selectedPlatform}
          onSuccess={() => {
            setView('list');
            setSelectedPlatform(null);
          }}
          onCancel={() => {
            setView('list');
            setSelectedPlatform(null);
          }}
        />
      </div>
    );
  }

  const totalAccounts = accounts.length;
  const platformsWithAccounts = connectedPlatforms.length;

  return (
    <div className="max-w-3xl mx-auto animate-slide-up space-y-4">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-blue-600 to-blue-400 p-5 sm:p-6 text-white shadow-xl shadow-blue-500/30">
        <div className="absolute -top-20 -left-10 w-60 h-60 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-start justify-between gap-3 flex-wrap">
          <div className="max-w-md min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/90 bg-white/15 backdrop-blur px-2 py-0.5 rounded-full border border-white/20">
              <Sparkles className="w-3 h-3" />
              Accounts
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
              {totalAccounts === 0 ? 'Connect your first account' : 'Your social accounts'}
            </h2>
            <p className="mt-1 text-sm text-white/80">
              {totalAccounts === 0
                ? 'Link Twitter, LinkedIn, Facebook, Instagram, or YouTube.'
                : 'Link multiple profiles per platform — pick any mix when you post.'}
            </p>
          </div>
          {totalAccounts > 0 && (
            <div className="flex gap-2">
              <div className="bg-white/15 backdrop-blur border border-white/20 rounded-xl px-3 py-2 text-center min-w-[80px]">
                <p className="text-xl font-bold tabular-nums leading-tight">{totalAccounts}</p>
                <p className="text-[10px] text-white/80 uppercase tracking-wide">
                  {totalAccounts === 1 ? 'Account' : 'Accounts'}
                </p>
              </div>
              <div className="bg-white/15 backdrop-blur border border-white/20 rounded-xl px-3 py-2 text-center min-w-[80px]">
                <p className="text-xl font-bold tabular-nums leading-tight">{platformsWithAccounts}</p>
                <p className="text-[10px] text-white/80 uppercase tracking-wide">
                  {platformsWithAccounts === 1 ? 'Platform' : 'Platforms'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Connected platforms */}
          {connectedPlatforms.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Connected
                </h3>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-3">
                {connectedPlatforms.map((platform, pIndex) => {
                  const meta = PLATFORM_META[platform];
                  const Icon = meta.icon;
                  const list = accountsByPlatform[platform];
                  const count = list.length;
                  const connecting = isConnecting === platform;

                  return (
                    <article
                      key={platform}
                      className="group bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden animate-slide-up hover:shadow-xl hover:shadow-blue-500/10 transition-all"
                      style={{ animationDelay: `${pIndex * 50}ms` }}
                    >
                      {/* Platform strip */}
                      <div className={cn('flex items-center gap-4 p-4 border-b', meta.soft)}>
                        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm', meta.color)}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-base">{meta.label}</p>
                            <span className={cn(
                              'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/70 backdrop-blur',
                              meta.text
                            )}>
                              {count} {count === 1 ? 'account' : 'accounts'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={connecting}
                          onClick={() => handleConnect(platform, true)}
                          className="gap-1.5 shrink-0 bg-white/80 backdrop-blur hover:bg-gray-200 hover:text-gray-800"
                          title={`Add another ${meta.label} account`}
                        >
                          {connecting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Add another</span>
                              <span className="sm:hidden">Add</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Accounts */}
                      <ul className="divide-y">
                        {list.map((account, index) => (
                          <li
                            key={account.id ?? `${account.platform}-${account.platform_username || account.username || index}`}
                            className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                          >
                            {account.avatar ? (
                              <img
                                src={account.avatar}
                                alt={account.username}
                                className="w-11 h-11 rounded-full object-cover shrink-0 border-2 border-background shadow-sm"
                              />
                            ) : (
                              <div className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm', meta.color)}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-sm truncate">
                                  {account.username || account.platform_username || meta.label}
                                </p>
                                {account.connected !== false && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    Live
                                  </span>
                                )}
                              </div>
                              {account.platform_username && account.username !== account.platform_username && (
                                <p className="text-xs text-muted-foreground truncate">
                                  @{account.platform_username}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                account.id &&
                                setDisconnectTarget({
                                  id: account.id,
                                  label: meta.label,
                                  handle: account.username || account.platform_username,
                                })
                              }
                              className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1"
                              title="Disconnect this account"
                            >
                              <Link2Off className="w-4 h-4" />
                              <span className="hidden sm:inline">Disconnect</span>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* Available to connect */}
          {availablePlatforms.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Plus className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {connectedPlatforms.length === 0 ? 'Available to connect' : 'Add more'}
                </h3>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {availablePlatforms.map((platform, pIndex) => {
                  const meta = PLATFORM_META[platform];
                  const Icon = meta.icon;
                  const connecting = isConnecting === platform;
                  return (
                    <button
                      key={platform}
                      onClick={() => handleConnect(platform)}
                      disabled={connecting}
                      className={cn(
                        'group relative text-left bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 overflow-hidden',
                        'hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all animate-slide-up',
                        'disabled:opacity-60 disabled:cursor-not-allowed'
                      )}
                      style={{ animationDelay: `${pIndex * 50}ms` }}
                    >
                      <div className={cn(
                        'absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity',
                        meta.color
                      )} />
                      <div className="relative flex items-start gap-3">
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md', meta.color)}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{meta.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {meta.description}
                          </p>
                          <div className="flex items-center gap-1 mt-3 text-xs font-medium text-primary">
                            {connecting ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Connecting…
                              </>
                            ) : (
                              <>
                                Connect
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      <ConfirmDialog
        open={disconnectTarget !== null}
        onOpenChange={(open) => { if (!open && !disconnecting) setDisconnectTarget(null); }}
        title={`Disconnect ${disconnectTarget?.label ?? 'this account'}?`}
        description={
          disconnectTarget
            ? `${disconnectTarget.handle ? `@${disconnectTarget.handle} will be removed.` : 'This account will be removed.'} Scheduled posts targeting it may fail to publish.`
            : undefined
        }
        confirmLabel="Disconnect"
        destructive
        loading={disconnecting}
        onConfirm={confirmDisconnect}
      />
    </div>
  );
};

export default ConnectedAccounts;
