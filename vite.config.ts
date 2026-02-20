import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

const getServerPortFromEnvFile = () => {
  const serverEnvPath = path.resolve(__dirname, "server/.env.local");
  if (!fs.existsSync(serverEnvPath)) return null;

  const envFile = fs.readFileSync(serverEnvPath, "utf8");
  const portMatch = envFile.match(/^\s*PORT\s*=\s*([^\s#]+)\s*$/m);
  return portMatch?.[1] ?? null;
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  let apiProxyTarget = "http://localhost:5000";
  const apiBaseUrl = env.VITE_API_BASE_URL;
  if (apiBaseUrl) {
    try {
      apiProxyTarget = new URL(apiBaseUrl).origin;
    } catch {
      // Keep default target when VITE_API_BASE_URL is not an absolute URL.
    }
  } else {
    const dynamicPort = env.VITE_API_PORT || getServerPortFromEnvFile();
    if (dynamicPort) {
      apiProxyTarget = `http://localhost:${dynamicPort}`;
    }
  }

  return {
    base: mode === "production" ? "/arduino-kit/" : "/",
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
