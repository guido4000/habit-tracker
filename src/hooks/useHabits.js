import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";

export function useHabits() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    // Fetch habits with their entries
    const {
        data: habits = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["habits", user?.id],
        queryFn: async () => {
            if (!user) return [];

            const { data, error } = await supabase
                .from("habits")
                .select("*, entries:habit_entries(*)")
                .order("sort_order", { ascending: true })
                .order("created_at", { ascending: true });

            if (error) throw error;

            // Transform array of entries into an object map for easier lookup in UI
            // { "2023-10-01": "done", ... }
            return data.map(habit => ({
                ...habit,
                entries: habit.entries.reduce((acc, entry) => {
                    acc[entry.date] = entry.status;
                    return acc;
                }, {})
            }));
        },
        enabled: !!user,
    });

    // Add Habit
    const addHabit = useMutation({
        mutationFn: async (newHabit) => {
            const { data, error } = await supabase
                .from("habits")
                .insert([{ ...newHabit, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["habits", user?.id]);
        },
    });

    // Update Habit
    const updateHabit = useMutation({
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase
                .from("habits")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["habits", user?.id]);
        },
    });

    // Delete Habit
    const deleteHabit = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from("habits").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["habits", user?.id]);
        },
    });

    // Toggle Habit Entry
    const toggleHabit = useMutation({
        mutationFn: async ({ habitId, date, status }) => {
            // Logic:
            // if status is null -> we want to delete any entry for this date
            // if status is 'done' or 'planned' -> upsert entry

            if (!status) {
                const { error } = await supabase
                    .from("habit_entries")
                    .delete()
                    .eq("habit_id", habitId)
                    .eq("date", date);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("habit_entries")
                    .upsert({
                        habit_id: habitId,
                        user_id: user.id,
                        date,
                        status
                    }, { onConflict: 'habit_id, date' });

                if (error) throw error;
            }
        },
        // Optimistic update
        onMutate: async ({ habitId, date, status }) => {
            await queryClient.cancelQueries(["habits", user?.id]);
            const previousHabits = queryClient.getQueryData(["habits", user?.id]);

            queryClient.setQueryData(["habits", user?.id], (old) => {
                return old.map((h) => {
                    if (h.id !== habitId) return h;

                    const newEntries = { ...h.entries };
                    if (!status) {
                        delete newEntries[date];
                    } else {
                        newEntries[date] = status;
                    }

                    return { ...h, entries: newEntries };
                });
            });

            return { previousHabits };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(["habits", user?.id], context.previousHabits);
        },
        onSettled: () => {
            queryClient.invalidateQueries(["habits", user?.id]);
        },
    });

    return {
        habits,
        isLoading,
        error,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabit,
    };
}
