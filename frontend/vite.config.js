import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "production" ? "/" : "/p/rkhub/proxy/5173/",
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
      protocol: "wss",
    },
  },
}));
