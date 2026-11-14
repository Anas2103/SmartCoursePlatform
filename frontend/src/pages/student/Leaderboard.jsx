import { useQuery } from '@tanstack/react-query';
import { studentApi } from '@/services/api';
import { Trophy, Zap, Flame, Award } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const RANK_COLORS = ['text-amber-400', 'text-gray-400', 'text-amber-600'];
const RANK_BG = ['bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700', 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'];

const XP_LEVELS = [
  { name: 'Beginner', min: 0, color: '#9ca3af', emoji: '🌱' },
  { name: 'Explorer', min: 100, color: '#3b82f6', emoji: '🧭' },
  { name: 'Learner', min: 500, color: '#10b981', emoji: '📚' },
  { name: 'Scholar', min: 1500, color: '#6366f1', emoji: '🎓' },
  { name: 'Expert', min: 5000, color: '#f59e0b', emoji: '⭐' },
  { name: 'Master', min: 15000, color: '#ef4444', emoji: '🔥' },
  { name: 'Legend', min: 50000, color: '#ec4899', emoji: '👑' },
];

function getLevelInfo(xp) {
  let level = XP_LEVELS[0];
  for (const l of XP_LEVELS) { if (xp >= l.min) level = l; }
  return level;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => studentApi.getLeaderboard(),
    select: (res) => res.data,
  });

  const { data: myProgress } = useQuery({
    queryKey: ['my-progress'],
    queryFn: () => studentApi.getMyProgress(),
    select: (res) => res.data,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const myXp = myProgress?.xp;
  const myLevel = myXp ? getLevelInfo(myXp.total_xp) : XP_LEVELS[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">{t('leaderboard.title')}</h1>
        <p className="section-subtitle">{t('leaderboard.subtitle')}</p>
      </div>

      {/* My Stats */}
      {myXp && (
        <div className="card p-6 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{myLevel.emoji}</div>
              <div>
                <p className="text-white/70 text-sm">{t('leaderboard.yourLevel')}</p>
                <p className="text-2xl font-bold">{myLevel.name}</p>
                <p className="text-white/70 text-sm">{myXp.total_xp.toLocaleString()} XP total</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
                <p className="text-xl font-bold">{myXp.weekly_xp}</p>
                <p className="text-xs text-white/60">{t('leaderboard.thisWeek')}</p>
              </div>
              <div>
                <Flame className="w-5 h-5 mx-auto mb-1 text-orange-300" />
                <p className="text-xl font-bold">{myXp.streak_days}</p>
                <p className="text-xs text-white/60">{t('leaderboard.dayStreak')}</p>
              </div>
              <div>
                <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-300" />
                <p className="text-xl font-bold">#{data?.my_rank || '—'}</p>
                <p className="text-xs text-white/60">{t('leaderboard.yourRank')}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>{myLevel.name}</span>
              {XP_LEVELS[XP_LEVELS.indexOf(myLevel) + 1] && (
                <span>{XP_LEVELS[XP_LEVELS.indexOf(myLevel) + 1].name} ({XP_LEVELS[XP_LEVELS.indexOf(myLevel) + 1].min.toLocaleString()} XP)</span>
              )}
            </div>
            <div className="bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${myProgress?.level?.progress || 0}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Badges */}
      {myProgress?.badges?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> {t('leaderboard.yourBadges')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {myProgress.badges.map((badge) => (
              <div key={badge.id} title={badge.description} className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border" style={{ borderColor: badge.color + '40', background: badge.color + '15', color: badge.color }}>
                <span>{badge.icon || '🏆'}</span>{badge.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Learners */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t('leaderboard.topLearners')}</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {data?.leaderboard?.map((entry) => {
            const isMe = entry.user?.id === user?.id;
            const rankColor = entry.rank <= 3 ? RANK_COLORS[entry.rank - 1] : 'text-gray-500';
            const rowBg = entry.rank <= 3 ? RANK_BG[entry.rank - 1] : '';
            const level = getLevelInfo(entry.total_xp);
            return (
              <div key={entry.user?.id} className={clsx('flex items-center gap-4 px-4 py-3 transition-colors', rowBg, isMe && 'ring-2 ring-inset ring-primary-500')}>
                <div className={clsx('w-8 text-center font-bold text-lg', rankColor)}>
                  {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}
                </div>
                <img src={entry.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.user?.name || 'U')}&background=6366f1&color=fff`} alt="" className="w-10 h-10 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className={clsx('font-medium text-sm text-gray-900 dark:text-gray-100', isMe && 'text-primary-600 dark:text-primary-400')}>
                    {entry.user?.name} {isMe && `(${t('leaderboard.you')})`}
                  </p>
                  <p className="text-xs" style={{ color: getLevelInfo(entry.total_xp).color }}>{level.emoji} {entry.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1 justify-end"><Zap className="w-3 h-3 text-yellow-500" />{entry.total_xp.toLocaleString()}</p>
                  {entry.streak_days > 0 && <p className="text-xs text-orange-500 flex items-center gap-0.5 justify-end"><Flame className="w-3 h-3" />{entry.streak_days}d</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
