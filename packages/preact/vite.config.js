import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "@krofdrakula/prop-docs-preact",
      fileName: "index",
    },
    rollupOptions: {
      external: ["preact"],
    },
  },
});
