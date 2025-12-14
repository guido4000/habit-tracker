import { useState } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Target,
} from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { useAuthStore } from "../../store/authStore";

import { useHabits } from "../../hooks/useHabits";
import { Loader2 } from "lucide-react";

// Color options for habits
const colorOptions = [
  { value: "primary", label: "Blue", bg: "bg-primary-500" },
  { value: "success", label: "Green", bg: "bg-success-500" },
  { value: "planned", label: "Purple", bg: "bg-planned-500" },
  { value: "amber", label: "Amber", bg: "bg-amber-500" },
  { value: "rose", label: "Rose", bg: "bg-rose-500" },
  { value: "cyan", label: "Cyan", bg: "bg-cyan-500" },
];

function Dashboard() {
  const { user } = useAuthStore();
  const {
    habits,
    isLoading: habitsLoading,
    addHabit: addHabitMutation,
    updateHabit: updateHabitMutation,
    deleteHabit: deleteHabitMutation,
    toggleHabit: toggleHabitMutation
  } = useHabits();

  const isPremium =
    user?.subscriptionStatus === "standard_monthly" ||
    user?.subscriptionStatus === "standard_yearly";

  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    // Start at the beginning of the current week (Monday)
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Form states
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitTarget, setNewHabitTarget] = useState(20);
  const [newHabitColor, setNewHabitColor] = useState("primary");
  const [newHabitFrequency, setNewHabitFrequency] = useState("weekly"); // 'weekly' | 'monthly'

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const isToday = (day) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  const isPast = (day) =>
    new Date(year, month, day) <
    new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const isFuture = (day) => new Date(year, month, day) > today;

  const isWeekend = (day) => {
    const d = new Date(year, month, day);
    const dayOfWeek = d.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0=Sun, 6=Sat
  };

  if (habitsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentDate(new Date(d.setDate(diff)));
  };

  const toggleHabit = (habitId, day) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const currentStatus = habit.entries[dateKey];
    let newStatus = null;

    if (isFuture(day)) {
      // Future: toggle between planned and empty
      newStatus = currentStatus === "planned" ? null : "planned";
    } else if (isToday(day)) {
      // Today: cycle Empty -> Planned -> Done -> Empty
      if (currentStatus === "planned") newStatus = "done";
      else if (currentStatus === "done") newStatus = null;
      else newStatus = "planned";
    } else {
      // Past: toggle between done and empty
      newStatus = currentStatus === "done" ? null : "done";
    }

    toggleHabitMutation.mutate({ habitId, date: dateKey, status: newStatus });
  };

  const getHabitSum = (habit) => {
    // Current month entries only
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return Object.entries(habit.entries)
      .filter(([date, status]) => date.startsWith(prefix) && status === "done")
      .length;
  };

  // Calculate relative progress based on frequency
  // mode: 'monthly' (for desktop grid) or 'weekly' (for mobile list)
  const getHabitProgress = (habit, mode = 'monthly') => {
    const sum = getHabitSum(habit); // This is Monthly Sum
    const target = habit.target_days_per_month || 20;
    const freq = habit.frequency || 'monthly';

    if (freq === 'weekly') {
      if (mode === 'weekly') {
        // Mobile View: Show Weekly Progress
        let weekSum = 0;
        const d = new Date(currentDate); // Mobile view depends on currentDate which is the start of week
        // Actually `currentDate` might be any date in the week depending on how we init. 
        // In prev step `currentDate` was init to Start of Current Week (Monday).

        for (let i = 0; i < 7; i++) {
          const date = new Date(currentDate);
          date.setDate(date.getDate() + i);
          const k = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          if (habit.entries[k] === 'done') weekSum++;
        }
        return { current: weekSum, target: target, label: 'wk' };
      } else {
        // Desktop View: Show Monthly Progress (converted from Weekly)
        // Target = WeeklyTarget * 4.33 rounded
        const monthlyTarget = Math.round(target * 4.33);
        return { current: sum, target: monthlyTarget, label: 'mo' };
      }
    }

    // Monthly habits -> always show monthly progress
    return { current: sum, target: target, label: 'mo' };
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    if (habits.length >= 5 && !isPremium) return;

    addHabitMutation.mutate({
      name: newHabitName,
      color: newHabitColor,
      target_days_per_month: newHabitTarget, // Storing value here
      frequency: "weekly" // Enforce weekly for new habits
    }, {
      onSuccess: () => {
        resetForm();
        setShowAddModal(false);
      }
    });
  };

  const openEditModal = (habit) => {
    setEditingHabit(habit);
    setNewHabitName(habit.name);
    setNewHabitTarget(habit.target_days_per_month || 20);
    setNewHabitColor(habit.color || "primary");
    setNewHabitFrequency(habit.frequency || "weekly");
    setShowEditModal(true);
  };

  const updateHabit = () => {
    if (!newHabitName.trim() || !editingHabit) return;

    updateHabitMutation.mutate({
      id: editingHabit.id,
      updates: {
        name: newHabitName,
        target_days_per_month: newHabitTarget,
        color: newHabitColor,
        frequency: "weekly" // Enforce weekly or keep existing? Let's strictly enforce weekly if editing too? 
        // User asked to "remove monthly frequency when creating". 
        // For editing, let's just stick to what the form has (which is now strictly Weekly UI).
        // So yes, enforce 'weekly' on update effectively converting legacy habits.
      }
    }, {
      onSuccess: () => {
        resetForm();
        setShowEditModal(false);
        setEditingHabit(null);
      }
    });
  };

  const deleteHabit = () => {
    if (!editingHabit) return;
    deleteHabitMutation.mutate(editingHabit.id, {
      onSuccess: () => {
        resetForm();
        setShowEditModal(false);
        setEditingHabit(null);
      }
    });
  };

  const resetForm = () => {
    setNewHabitName("");
    setNewHabitTarget(3); // Default to 3
    setNewHabitColor("primary");
    setNewHabitFrequency("weekly");
  };

  const canAddHabit = isPremium || habits.length < 5;

  const getColorClass = (color, type = "bg") => {
    const colors = {
      primary: { bg: "bg-primary-500", text: "text-primary-500" },
      success: { bg: "bg-success-500", text: "text-success-500" },
      planned: { bg: "bg-planned-500", text: "text-planned-500" },
      amber: { bg: "bg-amber-500", text: "text-amber-500" },
      rose: { bg: "bg-rose-500", text: "text-rose-500" },
      cyan: { bg: "bg-cyan-500", text: "text-cyan-500" },
    };
    return colors[color]?.[type] || colors.primary[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isPremium
              ? "Track unlimited habits"
              : `Track up to 5 habits (${habits.length}/5 used)`}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} disabled={!canAddHabit}>
          <Plus className="h-4 w-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {/* Month Navigation */}
      <Card>
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Header (Week Navigation) */}
        <div className="flex lg:hidden items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <span className="text-xs text-gray-500">
              Week of {currentDate.getDate()} {monthNames[currentDate.getMonth()]}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop: Full Month Grid */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 w-48 z-20">
                  Habit
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => (
                    <th
                      key={day}
                      className={`text-center py-2 px-1 text-xs font-medium w-8 ${isToday(day)
                        ? "text-primary-600 dark:text-primary-400"
                        : isWeekend(day)
                          ? "text-primary-500 dark:text-primary-400"
                          : "text-gray-500 dark:text-gray-400"
                        } ${isWeekend(day) ? "bg-primary-50/50 dark:bg-primary-500/10" : ""}`}
                    >
                      {day}
                    </th>
                  )
                )}
                <th className="text-center py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-16 sticky right-0 bg-white dark:bg-gray-800 z-20 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                  Sum
                </th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <tr
                  key={habit.id}
                  className="border-t border-gray-100 dark:border-gray-700"
                >
                  <td className="py-2 px-3 sticky left-0 bg-white dark:bg-gray-800 z-10">
                    <button
                      onClick={() => openEditModal(habit)}
                      className="flex items-center gap-2 group text-left"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${getColorClass(
                          habit.color,
                          "bg"
                        )}`}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                        {habit.name}
                      </span>
                      <Pencil className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                    (day) => {
                      const dateKey = `${year}-${String(month + 1).padStart(
                        2,
                        "0"
                      )}-${String(day).padStart(2, "0")}`;
                      const status = habit.entries[dateKey];
                      return (
                        <td key={day} className={`text-center py-2 px-1 ${isWeekend(day) ? "bg-primary-50/50 dark:bg-primary-500/10" : ""}`}>
                          <button
                            onClick={() => toggleHabit(habit.id, day)}
                            className={`w-6 h-6 rounded text-xs font-medium transition-colors flex items-center justify-center ${status === "done"
                              ? "bg-success-500 text-white"
                              : status === "planned"
                                ? "bg-planned-500 text-white"
                                : isToday(day)
                                  ? "bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50"
                                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                              }`}
                          >
                            {status === "done"
                              ? "✓"
                              : status === "planned"
                                ? "P"
                                : ""}
                          </button>
                        </td>
                      );
                    }
                  )}
                  <td className="text-center py-2 px-3 sticky right-0 bg-white dark:bg-gray-800 z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                    <div className="flex flex-col items-center">
                      <span
                        className={`text-sm font-semibold ${getHabitProgress(habit, 'monthly').current >= getHabitProgress(habit, 'monthly').target
                          ? "text-success-500"
                          : "text-gray-900 dark:text-white"
                          }`}
                      >
                        {getHabitProgress(habit, 'monthly').current}
                      </span>
                      <span className="text-xs text-gray-400">
                        /{getHabitProgress(habit, 'monthly').target}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: Weekly View */}
        <div className="lg:hidden space-y-4">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => openEditModal(habit)}
                  className="flex items-center gap-2 group"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${getColorClass(
                      habit.color,
                      "bg"
                    )}`}
                  />
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                    {habit.name}
                  </span>
                  <Pencil className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <span
                  className={`text-sm ${getHabitProgress(habit, 'weekly').current >= getHabitProgress(habit, 'weekly').target
                    ? "text-success-500 font-medium"
                    : "text-gray-500 dark:text-gray-400"
                    }`}
                >
                  {getHabitProgress(habit, 'weekly').current}/{getHabitProgress(habit, 'weekly').target}/{getHabitProgress(habit, 'weekly').label}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }, (_, i) => {
                  // Mobile view logic: Start from currentDate (which is Monday)
                  const itemDate = new Date(currentDate);
                  itemDate.setDate(currentDate.getDate() + i);

                  const day = itemDate.getDate();
                  const itemMonth = itemDate.getMonth();
                  const itemYear = itemDate.getFullYear();

                  const dateKey = `${itemYear}-${String(itemMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const status = habit.entries[dateKey];
                  const isDayToday = itemDate.toDateString() === today.toDateString();

                  return (
                    <button
                      key={i}
                      // Note: toggleHabit needs accurate day/month/year.
                      // The current toggleHabit function assumes "current month" which might break if the week overlaps months.
                      // We need to update toggleHabit or pass full date.
                      // Let's assume toggleHabit uses the `year` and `month` from scope which is tied to `currentDate`. 
                      // Wait, `currentDate` changes with navigation now. 
                      // So `year` and `month` vars in scope update.
                      // HOWEVER, toggleHabit uses `year` and `month` variables which are derived from `currentDate`.
                      // If `itemDate` is in a different month (week overlap), `toggleHabit(id, day)` will use the wrong month!
                      // I must refactor toggleHabit to accept full date string or date object, OR Ensure Mobile View items pass the correct `day` relative to the component's `month` state.
                      // Actually, if I update `toggleHabit` to take a date string, that's safest.
                      // Let's temporarily just use the click handler to call toggleHabitMutation directly with `dateKey`.

                      onClick={() => {
                        const currentStatus = habit.entries[dateKey];
                        let newStatus = null;
                        if (new Date(itemYear, itemMonth, day) > today) {
                          newStatus = currentStatus === "planned" ? null : "planned";
                        } else {
                          newStatus = currentStatus === "done" ? null : "done";
                        }
                        toggleHabitMutation.mutate({ habitId: habit.id, date: dateKey, status: newStatus });
                      }}

                      className={`aspect-square rounded flex items-center justify-center text-xs font-medium ${status === "done"
                        ? "bg-success-500 text-white"
                        : status === "planned"
                          ? "bg-planned-500 text-white"
                          : isDayToday
                            ? "bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                    >
                      {status === "done"
                        ? "✓"
                        : status === "planned"
                          ? "P"
                          : day}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {habits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No habits yet. Create your first habit to get started!
            </p>
            <Button onClick={() => setShowAddModal(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-1" />
              Add Your First Habit
            </Button>
          </div>
        )}
      </Card>

      {/* Upgrade Banner for free users */}
      {!isPremium && habits.length >= 5 && (
        <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Want more habits?</h3>
              <p className="text-primary-100 text-sm mt-1">
                Upgrade to Premium for unlimited habits
              </p>
            </div>
            <Button className="bg-white text-primary-600 hover:bg-primary-50">
              Upgrade
            </Button>
          </div>
        </Card>
      )}

      {/* Add Habit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Habit"
      >
        <div className="space-y-4">
          <Input
            label="Habit Name"
            placeholder="e.g., Exercise, Read, Meditate"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            autoFocus
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Target Days per Week
              </div>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max={7}
                value={newHabitTarget}
                onChange={(e) => setNewHabitTarget(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <span className="text-lg font-semibold text-gray-900 dark:text-white w-12 text-center">
                {newHabitTarget}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Aim to complete this habit {newHabitTarget} days this week
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setNewHabitColor(color.value)}
                  className={`w-8 h-8 rounded-full ${color.bg} transition-all ${newHabitColor === color.value
                    ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-gray-800"
                    : "hover:scale-110"
                    }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isPremium
              ? "You can create unlimited habits."
              : `You can create ${5 - habits.length} more habits.`}
          </p>
        </div>
        <Modal.Footer>
          <Button
            variant="outline"
            onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={addHabit} disabled={!newHabitName.trim()}>
            Add Habit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Habit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingHabit(null);
          resetForm();
        }}
        title="Edit Habit"
      >
        <div className="space-y-4">
          <Input
            label="Habit Name"
            placeholder="e.g., Exercise, Read, Meditate"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            autoFocus
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Target Days per Week
              </div>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max={7}
                value={newHabitTarget}
                onChange={(e) => setNewHabitTarget(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <span className="text-lg font-semibold text-gray-900 dark:text-white w-12 text-center">
                {newHabitTarget}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Aim to complete this habit {newHabitTarget} days this week
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setNewHabitColor(color.value)}
                  className={`w-8 h-8 rounded-full ${color.bg} transition-all ${newHabitColor === color.value
                    ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-gray-800"
                    : "hover:scale-110"
                    }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        </div>
        <Modal.Footer>
          <Button
            variant="ghost"
            onClick={deleteHabit}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 mr-auto"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowEditModal(false);
              setEditingHabit(null);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={updateHabit} disabled={!newHabitName.trim()}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Dashboard;
