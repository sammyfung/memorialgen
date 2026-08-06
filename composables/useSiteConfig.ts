/**
 * Returns the resolved site title and subtitle.
 * NUXT_PUBLIC_SITE_TITLE / NUXT_PUBLIC_SITE_SUBTITLE override the i18n defaults.
 */
export function useSiteConfig() {
  const config = useRuntimeConfig()
  const { t }  = useI18n()

  const displayTitle    = computed(() => config.public.siteTitle    || t('site.title'))
  const displaySubtitle = computed(() => config.public.siteSubtitle || t('site.description'))

  /**
   * Browser tab title for a given page.
   * - Index page (no pageName): "{custom title} | Memorial Board"  or  "Memorial Board"
   * - Other pages:              "{pageName} — {custom title}"      or  "{pageName} — Memorial Board"
   */
  function pageTitle(pageName?: string) {
    const base = config.public.siteTitle || t('site.title')
    if (!pageName) {
      return config.public.siteTitle
        ? `${config.public.siteTitle} | Memorial Board`
        : base
    }
    return `${pageName} — ${base}`
  }

  return { displayTitle, displaySubtitle, pageTitle }
}
