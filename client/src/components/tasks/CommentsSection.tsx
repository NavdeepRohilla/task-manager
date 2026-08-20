import { useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { useCommentsQuery, useAddComment, useDeleteComment } from '@/hooks/useComments';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/errors';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentsSectionProps {
  taskId: string;
  /** True if the current user is the task owner or an admin — they can moderate any comment, not just their own. */
  canModerate: boolean;
}

export function CommentsSection({ taskId, canModerate }: CommentsSectionProps) {
  const currentUser = useAuthStore((s) => s.user);
  const { data: comments, isLoading } = useCommentsQuery(taskId);
  const addComment = useAddComment(taskId);
  const deleteComment = useDeleteComment(taskId);
  const [message, setMessage] = useState('');

  const handleAdd = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    addComment.mutate(trimmed, {
      onSuccess: () => setMessage(''),
      onError: (error) => toast.error(getErrorMessage(error, 'Could not add comment')),
    });
  };

  return (
    <div>
      <h3 className="font-display text-sm font-semibold text-ink">Comments</h3>

      <div className="mt-3 space-y-3">
        {isLoading && <p className="text-sm text-muted">Loading comments…</p>}
        {comments?.length === 0 && <p className="text-sm text-muted">No comments yet.</p>}
        {comments?.map((comment) => {
          const canDeleteThis = canModerate || comment.userId === currentUser?.id;
          return (
            <div key={comment.id} className="flex items-start justify-between gap-2 rounded-sm bg-flap p-3">
              <div className="min-w-0">
                <p className="text-sm text-ink">{comment.message}</p>
                <p className="mt-1 text-xs text-muted">
                  {comment.user.name} · {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
              {canDeleteThis && (
                <button
                  type="button"
                  onClick={() => deleteComment.mutate(comment.id)}
                  className="shrink-0 text-muted hover:text-danger"
                  aria-label="Delete comment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        <Textarea
          rows={2}
          placeholder="Add a comment…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type="button" size="sm" variant="outline" onClick={handleAdd} disabled={addComment.isPending || !message.trim()}>
          {addComment.isPending ? 'Posting…' : 'Post comment'}
        </Button>
      </div>
    </div>
  );
}
