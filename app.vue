<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <NuxtPage />
    </main>
    <footer class="border-t border-stone-200 py-6 text-center text-xs text-stone-400 font-sans">
      {{ $t('site.title') }} &bull; {{ new Date().getFullYear() }}
    </footer>
  </div>
</template>
