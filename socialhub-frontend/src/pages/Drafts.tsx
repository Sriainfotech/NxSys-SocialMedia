import { useEffect, useState } from 'react';
import { usePostStore, type Platform, type Post } from '@/stores/postStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Trash2, Plus, Loader2, FileText, Twitter, Linkedin, Facebook, Instagram, Youtube, Pencil, Calendar,
} from 'lucide-react';
import PostForm from '@/components/PostForm';
import ConfirmDialog from '@/components/ConfirmDialog';

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  twitter: Twitter, linkedin: Linkedin, facebook: Facebook, instagram: Instagram, youtube: Youtube,
};

const Drafts = () => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [editingDraft, setEditingDraft] = useState<Post | null>(null);
  const { posts, fetchPosts, deletePost, isLoading } = usePostStore();

  useEffect(() => { fetchPosts().catch(() => {}); }, [fetchPosts]);

  const drafts = posts.filter(p => p.status === 'draft' || (p as unknown as { is_draft?: boolean }).is_draft);

  const editDraft = (post: Post) => {
    setEditingDraft(post);
    setView('create');
  };

  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePost(deleteTarget.id);
      toast.success('Draft deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(String(err ?? 'Failed to delete'));
    } finally {
      setDeleting(false);
    }
  };

  if (view === 'create') {
    return (
      <div className="max-w-4xl mx-auto">
        <PostForm
          mode="draft"
          editingPost={editingDraft}
          onSuccess={() => {
            fetchPosts().catch(() => {});
            setEditingDraft(null);
            setView('list');
          }}
          onCancel={() => {
            setEditingDraft(null);
            setView('list');
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 sm:p-5 shadow-sm">
        <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-gradient-to-br from-blue-400/15 to-blue-400/15 blur-3xl" />
        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
              <FileText className="w-3 h-3" />
              Drafts
            </div>
            <h2 className="mt-1.5 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Drafts</h2>
            <p className="text-xs sm:text-sm text-slate-500">Ideas in progress — polish, then ship.</p>
          </div>
          <Button
            onClick={() => setView('create')}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white rounded-full px-4 sm:px-5 h-10 sm:h-11 shadow-md shadow-blue-500/30 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">New Draft</span>
            <span className="xs:hidden">New</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : drafts.length === 0 ? (
        <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/70 p-8 text-center shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-sky-50/50" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/30">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-slate-900 mb-1">No drafts</p>
            <p className="text-sm text-slate-500 mb-4">Save an idea to work on it later.</p>
            <Button
              onClick={() => setView('create')}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white rounded-full px-4 h-9"
            >
              <Plus className="w-4 h-4" />
              Create one
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {drafts.map((post) => {
            const PREVIEW_LEN = 120;
            const needsMore = post.content && post.content.length > PREVIEW_LEN;
            const preview = needsMore ? post.content.slice(0, PREVIEW_LEN).trimEnd() : post.content;
            const when = post.updated_at || post.created_at;
            return (
              <div
                key={post.id}
                onClick={() => editDraft(post)}
                className="group bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm flex items-start gap-3 cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 mb-2 break-words leading-relaxed">
                    {preview || <span className="italic text-slate-400">(empty draft)</span>}
                    {needsMore && (
                      <>
                        …{' '}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); editDraft(post); }}
                          className="text-blue-600 hover:text-blue-700 hover:underline text-xs font-medium"
                        >
                          see more
                        </button>
                      </>
                    )}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-slate-700 bg-slate-50 border border-slate-200">
                      <FileText className="w-3 h-3" />
                      Draft
                    </span>
                    <div className="flex items-center gap-1.5">
                      {post.platforms.map((p) => {
                        const Icon = PLATFORM_ICONS[p];
                        return <Icon key={p} className="w-3.5 h-3.5 text-slate-400" />;
                      })}
                    </div>
                    {when && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(when).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); editDraft(post); }}
                    className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 rounded-lg"
                    title="Edit draft"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(post); }}
                    className="text-slate-400 hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open && !deleting) setDeleteTarget(null); }}
        title="Delete this draft?"
        description={
          deleteTarget
            ? `Draft #${deleteTarget.id} will be removed. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete draft"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Drafts;
