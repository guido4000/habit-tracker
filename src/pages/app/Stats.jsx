import { BarChart3, TrendingUp, Target, Calendar, Loader2 } from "lucide-react";
import Card from "../../components/common/Card";
import { useHabits } from "../../hooks/useHabits";
import { calculateHabitStats, calculateMonthlyCompletion } from "../../lib/stats";
import { subMonths, format, startOfMonth } from "date-fns";
import { useAuthStore } from "../../store/authStore";

function Stats() {
  const { habits, isLoading } = useHabits();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Calculate Monthly Stats (Last 6 months)
  const user = useAuthStore((state) => state.user);

  // Calculate Monthly Stats (Last 6 months)
  const monthlyStats = Array.from({ length: 6 })
    .map((_, i) => {
      const date = subMonths(new Date(), 5 - i);
      const stats = calculateMonthlyCompletion(habits, date);
      return {
        month: format(date, "MMM"),
        completion: stats.completion,
        planned: stats.planned,
        fullDate: date
      };
    })
    .filter((stat) => {
      if (!user?.created_at) return true;
      const signupDate = new Date(user.created_at);
      // Show from 1 month before signup
      const cutoffDate = subMonths(startOfMonth(signupDate), 1);
      return stat.fullDate >= cutoffDate;
    });

  // Calculate Per-Habit Stats
  const habitStats = habits.map(calculateHabitStats);

  // Calculate Overview Stats
  const bestStreakAll = Math.max(...habitStats.map(h => h.bestStreak), 0);
  const currentStreakAll = Math.max(...habitStats.map(h => h.currentStreak), 0);
  const thisMonthCompletion = monthlyStats[monthlyStats.length - 1].completion;
  const totalDaysTracked = habits.reduce((acc, h) =>
    acc + Object.values(h.entries).filter(s => s === 'done').length, 0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Statistics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your progress over time
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Best Streak",
            value: `${bestStreakAll} days`,
            icon: Target,
            color: "text-primary-500",
          },
          {
            label: "Current Streak",
            value: `${currentStreakAll} days`,
            icon: TrendingUp,
            color: "text-success-500",
          },
          {
            label: "This Month",
            value: `${thisMonthCompletion}%`,
            icon: Calendar,
            color: "text-primary-500",
          },
          {
            label: "Total Days",
            value: totalDaysTracked.toString(),
            icon: BarChart3,
            color: "text-gray-500",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-800 ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Monthly Progress */}
      <Card>
        <Card.Header>
          <Card.Title>Monthly Completion Rate</Card.Title>
          <Card.Description>
            Your habit completion rate over the past 6 months
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex items-end gap-4 h-64">
            {monthlyStats.map((stat) => (
              <div
                key={stat.month}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-lg relative overflow-hidden"
                  style={{ height: "160px" }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-primary-500 transition-all z-10"
                    style={{ height: `${stat.completion}%` }}
                  />
                  {stat.planned > 0 && (
                    <div
                      className="absolute left-0 right-0 bg-primary-300 dark:bg-primary-500/30 transition-all"
                      style={{
                        bottom: `${stat.completion}%`,
                        height: `${stat.planned}%`
                      }}
                    />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.month}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stat.completion}%
                </span>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Per-Habit Stats */}
      <Card>
        <Card.Header>
          <Card.Title>Habit Performance</Card.Title>
          <Card.Description>Individual habit statistics (Last 30 Days)</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {habitStats.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No habits found. Start tracking to see stats!</p>
            ) : (
              habitStats.map((habit) => (
                <div key={habit.name} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {habit.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {habit.completionRate}% completion
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${habit.completionRate}%` }}
                    />
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Current streak:{" "}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {habit.currentStreak} days
                      </span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Best:{" "}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {habit.bestStreak} days
                      </span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}

export default Stats;
