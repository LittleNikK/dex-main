import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      nodePolyfills({
        include: ["buffer", "events", "util", "stream", "string_decoder", "process", "crypto"],
        globals: { Buffer: true, global: true, process: true },
        protocolImports: true,
        overrides: { fs: "memfs" },
      }),
    ],
    optimizeDeps: {
      esbuildOptions: { define: { global: "globalThis" } },
    },
    resolve: {
      alias: { events: "events" },
    },
  },
});
