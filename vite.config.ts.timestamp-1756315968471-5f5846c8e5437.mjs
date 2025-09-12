// vite.config.ts
import { defineConfig } from "file:///C:/Users/User/Downloads/psc/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/User/Downloads/psc/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { viteSourceLocator } from "file:///C:/Users/User/Downloads/psc/node_modules/@metagptx/vite-plugin-source-locator/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\User\\Downloads\\psc";
var vite_config_default = defineConfig(({ mode }) => ({
  plugins: [
    viteSourceLocator({
      prefix: "mgx"
    }),
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVc2VyXFxcXERvd25sb2Fkc1xcXFxwc2NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFVzZXJcXFxcRG93bmxvYWRzXFxcXHBzY1xcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvVXNlci9Eb3dubG9hZHMvcHNjL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgdml0ZVNvdXJjZUxvY2F0b3IgfSBmcm9tIFwiQG1ldGFncHR4L3ZpdGUtcGx1Z2luLXNvdXJjZS1sb2NhdG9yXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBwbHVnaW5zOiBbXG4gICAgdml0ZVNvdXJjZUxvY2F0b3Ioe1xuICAgICAgcHJlZml4OiBcIm1neFwiLFxuICAgIH0pLFxuICAgIHJlYWN0KCksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlEsU0FBUyxvQkFBb0I7QUFDMVMsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHlCQUF5QjtBQUhsQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFNBQVM7QUFBQSxJQUNQLGtCQUFrQjtBQUFBLE1BQ2hCLFFBQVE7QUFBQSxJQUNWLENBQUM7QUFBQSxJQUNELE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
