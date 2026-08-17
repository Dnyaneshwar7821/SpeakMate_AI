import { Outlet } from "react-router-dom";
import Navbar from "@components/common/Navbar";
import Footer from "@components/common/Footer";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
