import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set, get) => ({
      // Theme: 'light', 'dark', or 'system'
      theme: "system",

      // Sidebar state for mobile
      sidebarOpen: false,

      // Sidebar collapsed state for desktop
      sidebarCollapsed: true, // Default to collapsed

      // Modal states
      activeModal: null,
      modalData: null,

      // Actions
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleSidebarCollapse: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      openModal: (modalName, data = null) =>
        set({ activeModal: modalName, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      // Initialize theme on app load
      initializeTheme: () => {
        const { theme } = get();
        applyTheme(theme);
      },
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }), // Persist theme and sidebar state
    }
  )
);

// Helper function to apply theme to document
function applyTheme(theme) {
  const root = window.document.documentElement;

  // Remove existing theme classes
  root.classList.remove("light", "dark");

  if (theme === "system") {
    // Check system preference
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}

// Listen for system theme changes
if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      const store = useUIStore.getState();
      if (store.theme === "system") {
        applyTheme("system");
      }
    });
}
