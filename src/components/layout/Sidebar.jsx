import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  User,
  Crown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Statistics", href: "/app/stats", icon: BarChart3 },
  { name: "Settings", href: "/app/settings", icon: Settings },
  { name: "Account", href: "/app/account", icon: User },
];

function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    toggleSidebarCollapse,
  } = useUIStore();
  const { user } = useAuthStore();
  const isPremium =
    user?.subscriptionStatus === "standard_monthly" ||
    user?.subscriptionStatus === "standard_yearly";

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-900",
          "md:translate-x-0 md:static md:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed ? "md:w-16" : "md:w-64",
          "w-64" // Mobile always full width
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
          {!sidebarCollapsed && (
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Easy Habit
            </span>
          )}
          {sidebarCollapsed && (
            <span className="mx-auto text-lg font-bold text-primary-600 dark:text-primary-400">
              EH
            </span>
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={toggleSidebarCollapse}
            className={cn(
              "hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors",
              sidebarCollapsed && "mx-auto"
            )}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === "/app"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                  sidebarCollapsed && "md:justify-center md:px-2"
                )
              }
              title={sidebarCollapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className={cn(sidebarCollapsed && "md:hidden")}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Upgrade Banner (for free users) - Hide when collapsed on desktop */}
        {!isPremium && (
          <div
            className={cn(
              "border-t border-gray-200 p-4 dark:border-gray-700",
              sidebarCollapsed && "md:hidden"
            )}
          >
            <div className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                <span className="font-semibold">Go Premium</span>
              </div>
              <p className="mt-1 text-sm text-primary-100">
                Unlock unlimited habits and advanced stats
              </p>
              <NavLink
                to="/app/account"
                onClick={() => setSidebarOpen(false)}
                className="mt-3 block rounded-lg bg-white px-3 py-2 text-center text-sm font-medium text-primary-600 hover:bg-primary-50"
              >
                Upgrade Now
              </NavLink>
            </div>
          </div>
        )}

        {/* Collapsed upgrade button */}
        {!isPremium && sidebarCollapsed && (
          <div className="hidden md:block border-t border-gray-200 p-3 dark:border-gray-700">
            <NavLink
              to="/app/account"
              onClick={() => setSidebarOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 mx-auto"
              title="Go Premium"
            >
              <Crown className="h-5 w-5" />
            </NavLink>
          </div>
        )}

        {/* User info */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <div
            className={cn(
              "flex items-center gap-3",
              sidebarCollapsed && "md:justify-center"
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400 flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div
              className={cn("flex-1 min-w-0", sidebarCollapsed && "md:hidden")}
            >
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {isPremium ? "Premium" : "Free Plan"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
