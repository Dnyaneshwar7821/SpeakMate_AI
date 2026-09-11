import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@admin": path.resolve(__dirname, "./admin-dashboard"),
      "@school-admin": path.resolve(__dirname, "./school-admin-dashboard"),
      "@components": path.resolve(__dirname, "./Admin_panel/components"),
      "@constants": path.resolve(__dirname, "./Admin_panel/constants"),
      "@/constants": path.resolve(__dirname, "./Admin_panel/constants"),
      "@context": path.resolve(__dirname, "./Admin_panel/context"),
      "@animations": path.resolve(__dirname, "./Admin_panel/animations"),
      "@utils": path.resolve(__dirname, "./Admin_panel/utils"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@": path.resolve(__dirname, "."),
    },
  },
});
