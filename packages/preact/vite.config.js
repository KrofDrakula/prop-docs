import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "@krofdrakula/prop-docs-preact",
      fileName: "index",
    },
    emptyOutDir: true,
    reportCompressedSize: true,
    rollupOptions: {
      external: ["preact", "ts-morph"],
    },
  },
  plugins: [dts()],
});
