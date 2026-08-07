export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: true,

  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
  ],

  i18n: {
    bundle: {
      optimizeTranslationDirective: false,
    },
    locales: [
      { code: 'en',    language: 'en-US', file: 'en.json',    name: 'English' },
      { code: 'zh-TW', language: 'zh-TW', file: 'zh-TW.json', name: '繁體中文' },
    ],
    defaultLocale: (process.env.DEFAULT_LOCALE || 'en') as 'en' | 'zh-TW',
    strategy: 'prefix_except_default',
    langDir: '../i18n/',
    lazy: true,
    detectBrowserLanguage: process.env.DETECT_BROWSER_LANGUAGE === 'false' ? false : {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },

  runtimeConfig: {
    dbDialect: 'sqlite',
    dbUrl: './data/memorial.db',
    adminPassword: 'admin123',
    sessionSecret: 'change-me-to-a-random-32-char-string',
    uploadMaxSizeMb: 5,
    public: {
      apiBaseUrl: '',
      siteUrl: '',
      siteTitle: '',
      siteSubtitle: '',
    },
  },

  nitro: {
    externals: {
      // Native modules (.node bindings) must stay external (not bundled)
      external: ['better-sqlite3', 'pg', 'mysql2'],
      // Hint the file tracer to include dynamically-loaded dependencies
      traceInclude: [
        './node_modules/better-sqlite3/**',
        './node_modules/drizzle-orm/better-sqlite3/**',
      ],
    },
  },

  app: {
    head: {
      title: 'Memorial Board',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A place to share memories and messages' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],
})
