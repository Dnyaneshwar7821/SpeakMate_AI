/**
 * components/layouts/Layout.jsx
 *
 * Master Layout wrapping all views. Displays top navbar, and conditionally sidebar
 * if the route is a protected user dashboard/session page.
 */

import { useLocation } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import ROUTES from "@constants/routes";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

// Paths that do not show the sidebar (public screens, errors, premium signup)
const NO_SIDEBAR_PATHS = [ROUTES.HOME, ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD, ROUTES.NOT_FOUND];

export function Layout({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Show sidebar only if user is authenticated and is on a dashboard/module screen
  const showSidebar = isAuthenticated && !NO_SIDEBAR_PATHS.includes(location.pathname);
  const showFooter = NO_SIDEBAR_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Sticky top nav */}
      <Navbar />

      {/* Main body containing sidebar and page view */}
      <div className="flex-1 flex flex-col md:flex-row">
        {showSidebar && <Sidebar />}

        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1">
            {children}
          </div>
          
          {/* Footer shows on marketing / auth pages */}
          {showFooter && <Footer />}
        </main>
      </div>
    </div>
  );
}

export default Layout;
