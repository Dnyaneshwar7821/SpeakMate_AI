import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@context/AuthContext";
import AppRoutes from "@routes/AppRoutes";
import "@styles/globals.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
