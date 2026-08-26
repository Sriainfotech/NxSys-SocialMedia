import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

const ConfirmDialog = ({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) => {
  const handleConfirm = async (e: React.MouseEvent) => {
    // Keep the dialog open while the handler resolves so the button can show a spinner.
    e.preventDefault();
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
                destructive
                  ? 'bg-gradient-to-br from-rose-500 to-red-500 text-white'
                  : 'bg-gradient-to-br from-blue-600 to-blue-400 text-white'
              )}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <AlertDialogTitle className="text-lg tracking-tight text-slate-900">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-500 mt-1">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-end gap-2">
          <AlertDialogCancel
            disabled={loading}
            className="rounded-full border-slate-300"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={handleConfirm}
            className={cn(
              'rounded-full shadow-md',
              destructive
                ? 'bg-gradient-to-r from-rose-500 to-red-500 hover:opacity-95 text-white shadow-red-500/30'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-white shadow-blue-500/30'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Working…
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
