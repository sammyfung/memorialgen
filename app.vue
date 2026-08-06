<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <NuxtPage />
    </main>
    <footer class="border-t border-stone-200 py-6 text-center text-xs text-stone-400 font-sans space-y-1">
      <div>{{ displayTitle }} &bull; {{ new Date().getFullYear() }}</div>
      <div>
        Powered by
        <a
          href="https://github.com/sammyfung/memorialgen"
          target="_blank"
          rel="noopener noreferrer"
          class="underline hover:text-stone-600 transition-colors"
        >memorialgen</a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { displayTitle } = useSiteConfig()
</script>
