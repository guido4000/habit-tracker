import { create } from "zustand";
import { supabase } from "../lib/supabase";

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start loading to check session
  error: null,

  // Initialize auth state
  initialize: async () => {
    set({ isLoading: true });
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch profile details
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        set({
          user: { ...session.user, ...profile },
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }

      // Listen for changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            set({
              user: { ...session.user, ...profile },
              isAuthenticated: true,
              isLoading: false
            });
          }
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      });

    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ user: null, isAuthenticated: false, isLoading: false, error: error.message });
    }
  },

  // Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Profile will be loaded by onAuthStateChange listener
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Signup
  signup: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      // Check if email confirmation is required
      if (data?.session) {
        return { success: true };
      } else if (data?.user && !data.session) {
        // Email confirmation required
        set({ isLoading: false });
        return { success: true, message: "Please check your email to confirm your account." };
      }

      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // State clear handled by onAuthStateChange
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Reset password
  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = get();
      if (!user) throw new Error("No user logged in");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      set({
        user: { ...user, ...data },
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Check if user has premium subscription
  isPremium: () => {
    const { user } = get();
    if (!user) return false;
    return (
      user.subscription_status === "standard_monthly" ||
      user.subscription_status === "standard_yearly"
    );
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
