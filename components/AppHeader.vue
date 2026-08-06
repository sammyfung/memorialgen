<template>
  <header class="bg-white border-b border-stone-200 shadow-sm">
    <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
      <NuxtLink :to="localePath('/')" class="text-xl font-serif font-semibold text-memorial-800 hover:text-memorial-900 transition-colors">
        {{ $t('site.title') }}
      </NuxtLink>

      <nav class="flex items-center gap-2 flex-wrap">
        <NuxtLink :to="localePath('/')" class="btn-ghost text-sm">
          {{ $t('nav.home') }}
        </NuxtLink>
        <NuxtLink :to="localePath('/submit')" class="btn-primary text-sm">
          {{ $t('nav.submit') }}
        </NuxtLink>
        <LangSwitcher />
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
</script>
