import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ROUTES from "../../constants/routes";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
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

  const showSidebar = isAuthenticated && !NO_SIDEBAR_PATHS.includes(location.pathname);
  const showFooter = NO_SIDEBAR_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] relative">
      <Navbar />

      <div className="flex-1 flex flex-row min-w-0">
        {showSidebar && <Sidebar />}

        <main className="flex-1 flex flex-col min-w-0 pb-0">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-8">
            {children || <Outlet />}
          </div>

          {showFooter && <Footer />}
        </main>
      </div>
    </div>
  );
}

export default Layout;
