import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import fs from "fs-extra";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    {
      name: "copy-fonts",
      async generateBundle() {
        const srcFonts = path.resolve(__dirname, "src/assets/fonts");
        const destFonts = path.resolve(__dirname, "docs/assets/fonts");
        await fs.copy(srcFonts, destFonts);
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: { api: "modern-compiler" },
    },
  },
  build: {
    rollupOptions: {
      output: {
        dir: "docs",
        manualChunks: {
          vue: ["vue", "vuex", "pinia", "vue-i18n"],
          element: ["element-plus"],
          lodash: ["lodash"],
          mobx: ["mobx"],
        },
      },
    },
  },
});
