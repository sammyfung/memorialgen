<template>
  <div class="flex items-center gap-1 border border-stone-200 rounded-md overflow-hidden">
    <button
      v-for="loc in locales"
      :key="loc.code"
      class="px-2 py-1 text-xs font-medium font-sans transition-colors"
      :class="locale === loc.code
        ? 'bg-memorial-700 text-white'
        : 'bg-white text-stone-600 hover:bg-stone-100'"
      @click="switchLocale(loc.code)"
    >
      {{ loc.code === 'en' ? 'EN' : '繁中' }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

async function switchLocale(code: string) {
  await setLocale(code)
}
</script>
