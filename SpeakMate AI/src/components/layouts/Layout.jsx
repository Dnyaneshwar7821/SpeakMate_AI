import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ROUTES from "../../constants/routes";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import MobileDrawer from "./MobileDrawer";
import useSpeechCleanup from "../../hooks/useSpeechCleanup";

const NO_SIDEBAR_PATHS = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.ONBOARDING,
  ROUTES.NOT_FOUND,
];

export function Layout({ children }) {
  useSpeechCleanup();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const showSidebar = isAuthenticated && !NO_SIDEBAR_PATHS.includes(location.pathname);
  const showFooter = NO_SIDEBAR_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] relative">
      <Navbar onOpenMobileDrawer={() => setMobileDrawerOpen(true)} />

      <div className="flex-1 flex flex-col md:flex-row">
        {showSidebar && <Sidebar />}

        <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
            {children || <Outlet />}
          </div>

          {showFooter && <Footer />}
        </main>
      </div>

      {showSidebar && (
        <>
          <BottomNav onOpenMobileDrawer={() => setMobileDrawerOpen(true)} />
          <MobileDrawer isOpen={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} />
        </>
      )}
    </div>
  );
}

export default Layout;
