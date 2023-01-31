// vite.config.js
import { resolve } from "path";
import { defineConfig } from "file:///Users/klemen/Projects/prop-docs/node_modules/.pnpm/vite@4.0.4/node_modules/vite/dist/node/index.js";
import dts from "file:///Users/klemen/Projects/prop-docs/node_modules/.pnpm/vite-plugin-dts@1.7.1_vite@4.0.4/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/klemen/Projects/prop-docs/packages/storybook";
var vite_config_default = defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "@krofdrakula/prop-docs-storybook",
      fileName: "index"
    },
    rollupOptions: {
      external: ["ts-morph"]
    }
  },
  plugins: [dts()]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMva2xlbWVuL1Byb2plY3RzL3Byb3AtZG9jcy9wYWNrYWdlcy9zdG9yeWJvb2tcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9rbGVtZW4vUHJvamVjdHMvcHJvcC1kb2NzL3BhY2thZ2VzL3N0b3J5Ym9vay92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMva2xlbWVuL1Byb2plY3RzL3Byb3AtZG9jcy9wYWNrYWdlcy9zdG9yeWJvb2svdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgZHRzIGZyb20gXCJ2aXRlLXBsdWdpbi1kdHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYnVpbGQ6IHtcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL2luZGV4LnRzXCIpLFxuICAgICAgbmFtZTogXCJAa3JvZmRyYWt1bGEvcHJvcC1kb2NzLXN0b3J5Ym9va1wiLFxuICAgICAgZmlsZU5hbWU6IFwiaW5kZXhcIixcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbXCJ0cy1tb3JwaFwiXSxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbZHRzKCldLFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJVLFNBQVMsZUFBZTtBQUNuVyxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFGaEIsSUFBTSxtQ0FBbUM7QUFJekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsS0FBSztBQUFBLE1BQ0gsT0FBTyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUN4QyxNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsSUFDWjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsVUFBVSxDQUFDLFVBQVU7QUFBQSxJQUN2QjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFDakIsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
