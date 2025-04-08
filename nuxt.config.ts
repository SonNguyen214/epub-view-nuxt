// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from "@primeuix/themes/aura";
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "@primevue/nuxt-module",
    "nuxt-lodash",
  ],
  plugins: [],
  css: [
    "~/assets/main.scss",
    "primeicons/primeicons.css",
    "tailwindcss-primeui",
  ],
  primevue: {
    autoImport: true,
    options: {
      theme: {
        preset: Aura,
        options: {
          cssLayer: {
            name: "primevue",
            // order: 'primevue,base,tailwindcss-primeui',
          },
          darkModeSelector: ".my-app-dark",
        },
      },
    },
  },
  alias: {
    "~components": "/components",
    "~assets": "/assets",
    "~composables": "/composables",
    "~stores": "/stores",
    "~utils": "/utils",
  },
});
