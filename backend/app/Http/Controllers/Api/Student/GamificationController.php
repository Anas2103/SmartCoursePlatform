<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\UserXp;
use App\Models\Badge;
use App\Models\UserBadge;
use Illuminate\Http\JsonResponse;

class GamificationController extends Controller
{
    public function myProgress(): JsonResponse
    {
        $xp = UserXp::firstOrCreate(
            ['user_id' => auth()->id()],
            ['total_xp' => 0, 'weekly_xp' => 0, 'monthly_xp' => 0, 'streak_days' => 0]
        );

        $badges = auth()->user()->badges()->withPivot('earned_at')->get();
        $allBadges = Badge::all();
        $level = UserXp::getLevel($xp->total_xp);

        return response()->json([
            'xp' => $xp,
            'level' => $level,
            'badges' => $badges,
            'all_badges' => $allBadges,
        ]);
    }

    public function leaderboard(): JsonResponse
    {
        $leaderboard = UserXp::orderByDesc('total_xp')
            ->with('user:id,name,avatar')
            ->limit(50)
            ->get()
            ->map(fn($entry, $i) => [
                'rank' => $i + 1,
                'user' => $entry->user,
                'total_xp' => $entry->total_xp,
                'weekly_xp' => $entry->weekly_xp,
                'streak_days' => $entry->streak_days,
                'level' => UserXp::getLevel($entry->total_xp)['current']['name'],
            ]);

        $myRank = null;
        $myXp = UserXp::where('user_id', auth()->id())->first();
        if ($myXp) {
            $myRank = UserXp::where('total_xp', '>', $myXp->total_xp)->count() + 1;
        }

        return response()->json([
            'leaderboard' => $leaderboard,
            'my_rank' => $myRank,
            'my_xp' => $myXp,
        ]);
    }

    public static function awardXp(int $userId, int $amount, string $reason, string $refType = null, int $refId = null): void
    {
        $xp = UserXp::firstOrCreate(
            ['user_id' => $userId],
            ['total_xp' => 0, 'weekly_xp' => 0, 'monthly_xp' => 0, 'streak_days' => 0]
        );

        $today = now()->toDateString();
        $streak = $xp->streak_days;

        if ($xp->last_activity_date) {
            $diff = now()->diffInDays($xp->last_activity_date);
            if ($diff === 1) $streak++;
            elseif ($diff > 1) $streak = 1;
        } else {
            $streak = 1;
        }

        $xp->update([
            'total_xp' => $xp->total_xp + $amount,
            'weekly_xp' => $xp->weekly_xp + $amount,
            'monthly_xp' => $xp->monthly_xp + $amount,
            'streak_days' => $streak,
            'last_activity_date' => $today,
        ]);

        \App\Models\XpTransaction::create([
            'user_id' => $userId,
            'amount' => $amount,
            'reason' => $reason,
            'reference_type' => $refType,
            'reference_id' => $refId,
        ]);
    }
}
