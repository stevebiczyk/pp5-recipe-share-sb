import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const target = env.VITE_API_URL || "http://127.0.0.1:8000";
  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api(?=\/|$)/, "") || "/",
        },
        "/media": { target: new URL(target).origin, changeOrigin: true },
      },
    },
    build: {
      outDir: "build",
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/setupTests.js",
      env: { VITE_API_URL: "http://localhost:8000" },
      restoreMocks: true,
    },
  };
});

