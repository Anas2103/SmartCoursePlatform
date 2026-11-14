import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, MessageSquare, Eye, Pin, Lock, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { studentApi } from '@/services/api';
import Spinner from '@/components/common/Spinner';

function Avatar({ user }) {
  const src = user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '?')}&background=6366f1&color=fff`;
  return <img src={src} alt={user?.name} className="w-9 h-9 rounded-full object-cover shrink-0" />;
}

function Reply({ reply, depth = 0 }) {
  return (
    <div className={depth ? 'ml-8 mt-3' : ''}>
      <div className="flex gap-3">
        <Avatar user={reply.user} />
        <div className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800/60 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{reply.user?.name}</span>
            <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-line">{reply.body}</p>
        </div>
      </div>
      {reply.children?.map((c) => <Reply key={c.id} reply={c} depth={depth + 1} />)}
    </div>
  );
}

export default function DiscussionDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data: discussion, isLoading, isError } = useQuery({
    queryKey: ['discussion', id],
    queryFn: () => studentApi.getDiscussion(id),
    select: (res) => res.data,
  });

  const replyMutation = useMutation({
    mutationFn: (data) => studentApi.replyDiscussion(id, data),
    onSuccess: () => {
      toast.success('Reply posted!');
      reset();
      qc.invalidateQueries({ queryKey: ['discussion', id] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not post reply'),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (isError || !discussion) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500 mb-4">This discussion could not be found.</p>
        <Link to="/student/forum" className="btn btn-primary">Back to forum</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <Link to="/student/forum" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
        <ArrowLeft className="w-4 h-4" /> Back to forum
      </Link>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-2">
          {discussion.is_pinned && <Pin className="w-4 h-4 text-amber-500" />}
          {discussion.is_locked && <Lock className="w-4 h-4 text-gray-400" />}
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{discussion.title}</h1>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <Avatar user={discussion.user} />
          <div className="text-sm">
            <div className="font-medium text-gray-900 dark:text-gray-100">{discussion.user?.name}</div>
            <div className="text-xs text-gray-400">{formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}</div>
          </div>
          <div className="ml-auto flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{discussion.replies_count}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{discussion.views}</span>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{discussion.body}</p>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
          {discussion.replies?.length || 0} {discussion.replies?.length === 1 ? 'reply' : 'replies'}
        </h2>
        {discussion.replies?.map((r) => <Reply key={r.id} reply={r} />)}

        {discussion.is_locked ? (
          <p className="text-sm text-gray-400 flex items-center gap-2"><Lock className="w-4 h-4" /> This discussion is locked.</p>
        ) : (
          <form onSubmit={handleSubmit((d) => replyMutation.mutate(d))} className="pt-2 space-y-3">
            <textarea
              {...register('body', { required: true, minLength: 5 })}
              rows={3}
              className="input"
              placeholder="Write a reply (at least 5 characters)..."
            />
            <div className="flex justify-end">
              <button type="submit" disabled={replyMutation.isPending} className="btn btn-primary">
                <Send className="w-4 h-4" /> Post reply
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
