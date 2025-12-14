import { Link, useLocation } from "react-router-dom";
import { Menu, Moon, Sun, Monitor, X, LogOut, User } from "lucide-react";
import { cn } from "../../lib/utils";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import Button from "../common/Button";

function Header({ variant = "public" }) {
  const location = useLocation();
  const { theme, setTheme, sidebarOpen, toggleSidebar } = useUIStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const publicLinks = [
    { href: "/", label: "Home" },
    { href: "/why", label: "Why Easy Habit" },
    { href: "/pricing", label: "Pricing" },
  ];

  const ThemeToggle = () => {
    const icons = {
      light: Sun,
      dark: Moon,
      system: Monitor,
    };
    const Icon = icons[theme];
    const nextTheme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(nextTheme)}
        aria-label={`Switch to ${nextTheme} mode`}
      >
        <Icon className="h-5 w-5" />
      </Button>
    );
  };

  if (variant === "app") {
    return (
      <header className="sticky top-0 z-40 flex h-16 items-center border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
        <div className="flex w-full items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <Link to="/app" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white font-bold">
                EH
              </div>
              <span className="hidden font-semibold text-gray-900 dark:text-white sm:block">
                Easy Habit
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="User menu"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                  {user?.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
              </Button>
              <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg group-hover:block dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-100 px-4 py-2 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
                <Link
                  to="/app/account"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Account Settings
                </Link>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Public header
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white font-bold">
            EH
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            Easy Habit Pro
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                location.pathname === link.href
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link to="/app">
              <Button size="sm">Go to App</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Start Free</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
