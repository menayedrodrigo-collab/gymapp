// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Necesario para que React Router funcione con rutas directas en Vercel
  // (sin esto, /admin y /entrenamiento devuelven 404 al refrescar)
});
