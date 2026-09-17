import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ModalProvider } from "./context/ModalContext";
import AppRoutes from "./routes/AppRoutes";
import AssistantWidget from "./components/assistant";
import "./styles/globals.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
            <BrowserRouter>
              <AppRoutes />
              <AssistantWidget />
            </BrowserRouter>
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

