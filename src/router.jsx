import { createBrowserRouter } from "react-router-dom";

// Layouts
import PublicLayout from "./components/layout/PublicLayout";
import AppLayout from "./components/layout/AppLayout";

// Public pages
import Landing from "./pages/public/Landing";
import Login from "./pages/public/Login";
import Signup from "./pages/public/Signup";
import ResetPassword from "./pages/public/ResetPassword";
import Pricing from "./pages/public/Pricing";
import Why from "./pages/public/Why";
import Contact from "./pages/public/Contact";
import Privacy from "./pages/public/Privacy";
import Terms from "./pages/public/Terms";

// App pages (authenticated)
import Dashboard from "./pages/app/Dashboard";
import Stats from "./pages/app/Stats";
import Settings from "./pages/app/Settings";
import Account from "./pages/app/Account";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "pricing", element: <Pricing /> },
      { path: "why", element: <Why /> },
      { path: "contact", element: <Contact /> },
      { path: "privacy", element: <Privacy /> },
      { path: "terms", element: <Terms /> },
    ],
  },
  {
    path: "/app",
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "stats", element: <Stats /> },
      { path: "settings", element: <Settings /> },
      { path: "account", element: <Account /> },
    ],
  },
]);
