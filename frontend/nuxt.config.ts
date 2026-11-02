import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  compatibilityDate: "2026-11-01",
  // Client-only app: auth token lives in the browser
  ssr: false,
  devtools: { enabled: false },
  app: {
    head: { title: "Customer Management" },
  },
  build: { transpile: ["vuetify"] },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        config.plugins?.push(vuetify({ autoImport: true }));
      });
    },
  ],
  vite: {
    vue: { template: { transformAssetUrls } },
  },
  runtimeConfig: {
    public: {
      // override with NUXT_PUBLIC_API_BASE
      apiBase: "http://localhost:5000/api",
    },
  },
});
