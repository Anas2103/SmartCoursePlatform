<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserXp extends Model
{
    protected $table = 'user_xp';
    protected $fillable = ['user_id', 'total_xp', 'weekly_xp', 'monthly_xp', 'streak_days', 'last_activity_date'];
    protected $casts = ['last_activity_date' => 'date'];

    public function user() { return $this->belongsTo(User::class); }

    public static function getLevel(int $xp): array
    {
        $levels = [
            ['name' => 'Beginner', 'min' => 0, 'color' => '#9ca3af'],
            ['name' => 'Explorer', 'min' => 100, 'color' => '#3b82f6'],
            ['name' => 'Learner', 'min' => 500, 'color' => '#10b981'],
            ['name' => 'Scholar', 'min' => 1500, 'color' => '#6366f1'],
            ['name' => 'Expert', 'min' => 5000, 'color' => '#f59e0b'],
            ['name' => 'Master', 'min' => 15000, 'color' => '#ef4444'],
            ['name' => 'Legend', 'min' => 50000, 'color' => '#ec4899'],
        ];

        $current = $levels[0];
        $next = $levels[1] ?? null;

        foreach ($levels as $i => $level) {
            if ($xp >= $level['min']) {
                $current = $level;
                $next = $levels[$i + 1] ?? null;
            }
        }

        $progress = $next
            ? round((($xp - $current['min']) / ($next['min'] - $current['min'])) * 100)
            : 100;

        return ['current' => $current, 'next' => $next, 'progress' => $progress];
    }
}
