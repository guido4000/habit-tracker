import { startOfMonth, endOfMonth, eachDayOfInterval, format, subMonths, isSameMonth, differenceInDays, parseISO, isToday, isBefore } from "date-fns";

/**
 * Calculate current and best streak for a habit
 * @param {Object} entries - Map of date strings to status ("2023-10-01": "done")
 * @returns {Object} { currentStreak, bestStreak }
 */
export const calculateStreak = (entries) => {
    const dates = Object.keys(entries)
        .filter(date => entries[date] === "done")
        .sort()
        .reverse(); // Newest first

    if (dates.length === 0) return { currentStreak: 0, bestStreak: 0 };

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Check if streak is active (today or yesterday)
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const yesterdayStr = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");

    const hasToday = dates.includes(todayStr);
    const hasYesterday = dates.includes(yesterdayStr);

    // Current streak calculation
    if (!hasToday && !hasYesterday) {
        currentStreak = 0;
    } else {
        // Basic consecutive day check
        // This is a simplified version. For a robust one we'd iterate days.
        // Given the dates are sorted reverse:
        let lastDate = new Date(dates[0]);
        // If the latest done date is older than yesterday, streak is broken.
        if (differenceInDays(new Date(), lastDate) > 1) {
            currentStreak = 0;
        } else {
            currentStreak = 1;
            for (let i = 0; i < dates.length - 1; i++) {
                const d1 = new Date(dates[i]);
                const d2 = new Date(dates[i + 1]);
                if (differenceInDays(d1, d2) === 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }
    }

    // Best streak calculation
    // Iterate all sorted dates
    if (dates.length > 0) {
        tempStreak = 1;
        bestStreak = 1;
        for (let i = 0; i < dates.length - 1; i++) {
            const d1 = new Date(dates[i]);
            const d2 = new Date(dates[i + 1]);
            if (differenceInDays(d1, d2) === 1) {
                tempStreak++;
            } else {
                bestStreak = Math.max(bestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        bestStreak = Math.max(bestStreak, tempStreak);
    }

    return { currentStreak, bestStreak };
};

/**
 * Calculate completion rate for a specific month
 * @param {Object} entries - Map of date strings
 * @param {Date} month - Date object in the target month
 * @returns {Number} percentage 0-100
 */
export const calculateMonthlyCompletion = (habits, month) => {
    if (!habits.length) return { completion: 0, planned: 0 };

    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const daysInMonth = differenceInDays(end, start) + 1;

    let totalTarget = 0;
    let totalDone = 0;
    let totalPlanned = 0;

    habits.forEach(habit => {
        // Calculate monthly target based on frequency
        let monthlyHabitTarget = 0;
        const target = habit.target_days_per_month || 20;

        if (habit.frequency === 'weekly') {
            // Weekly target * 4.33 approx, or simple ratio
            monthlyHabitTarget = Math.round(target * (daysInMonth / 7));
        } else {
            // Monthly target (legacy or explicit)
            monthlyHabitTarget = target;
        }

        // Cap target at days in month just in case
        monthlyHabitTarget = Math.min(monthlyHabitTarget, daysInMonth);
        totalTarget += monthlyHabitTarget;

        // Count status in this month
        const days = eachDayOfInterval({ start, end });
        days.forEach(day => {
            const dateKey = format(day, "yyyy-MM-dd");
            const status = habit.entries[dateKey];
            if (status === "done") {
                totalDone++;
            } else if (status === "planned") {
                totalPlanned++;
            }
        });
    });

    if (totalTarget === 0) return { completion: 0, planned: 0 };

    return {
        completion: Math.min(Math.round((totalDone / totalTarget) * 100), 100),
        planned: Math.min(Math.round((totalPlanned / totalTarget) * 100), 100)
    };
};

export const calculateHabitStats = (habit) => {
    const { currentStreak, bestStreak } = calculateStreak(habit.entries);

    // Calculate total completion rate (all time)
    const entriesCount = Object.keys(habit.entries).filter(k => habit.entries[k] === 'done').length;
    // This is a bit arbitrary for "all time", maybe last 30 days is better?
    // Let's do last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

    let doneInLast30 = 0;
    days.forEach(day => {
        const k = format(day, "yyyy-MM-dd");
        if (habit.entries[k] === 'done') doneInLast30++;
    });

    const completionRate = Math.round((doneInLast30 / 30) * 100);

    return {
        name: habit.name,
        currentStreak,
        bestStreak,
        completionRate
    };
};
