import React, { useState } from 'react';
import { MoreVertical, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface MessageActionsProps {
  /** Runs the real deletion (RPC + storage cleanup). Resolve true when done. */
  onDelete: () => void | boolean | Promise<unknown>;
  /** Bubble sits on the primary colour (own message) — use light icon colours. */
  onPrimary?: boolean;
  /** Wording shown in the confirmation dialog. */
  title?: string;
  description?: string;
  /** Extra label under "Delete" for staff moderation. */
  moderation?: boolean;
  className?: string;
}

/**
 * Per-message "⋮" menu with a confirmed Delete action.
 * Shown only for messages the viewer is allowed to remove; the backend
 * re-validates permissions so this is never the only guard.
 */
const MessageActions: React.FC<MessageActionsProps> = ({
  onDelete,
  onPrimary = false,
  title = 'Delete this message?',
  description = 'It will be permanently removed from the conversation for everyone. Files and images are deleted from storage too. This cannot be undone.',
  moderation = false,
  className = '',
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await onDelete();
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Message options"
            title="Message options"
            disabled={busy}
            className={`h-6 w-6 rounded-full shrink-0 transition-opacity ${
              onPrimary
                ? 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/15'
                : 'text-muted-foreground hover:text-foreground'
            } ${className}`}
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MoreVertical className="w-3.5 h-3.5" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => { e.preventDefault(); setConfirmOpen(true); }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            <span className="flex flex-col leading-tight">
              Delete message
              {moderation && <span className="text-[10px] text-muted-foreground">Staff moderation</span>}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={(v) => !busy && setConfirmOpen(v)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => { e.preventDefault(); run(); }}
            >
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MessageActions;
