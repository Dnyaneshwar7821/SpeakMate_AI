import { useLocation } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, user, onboardingCompleted } = useAuth();
  const location = useLocation();

  // Temporary: Skip authentication while developing the Admin Panel
  return children;
}

export default ProtectedRoute;