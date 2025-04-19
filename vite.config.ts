import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Ensures compatibility with IPv4
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(), // Ensure componentTagger is only used in development
  ].filter(Boolean), // Filters out falsy values
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Alias for cleaner imports
      crypto: "crypto-browserify", // Polyfill for crypto
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis", // Ensures global is defined correctly
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true, // Polyfill for Buffer
        }),
      ],
    },
  },
}));

