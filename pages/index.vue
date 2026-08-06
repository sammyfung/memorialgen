<template>
  <div class="max-w-7xl mx-auto px-4 py-10 space-y-12">
    <!-- Hero -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl sm:text-4xl font-serif text-stone-800">{{ displayTitle }}</h1>
      <p class="text-stone-500">{{ displaySubtitle }}</p>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex justify-center py-16">
      <svg class="animate-spin h-8 w-8 text-memorial-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <template v-else-if="data">
      <!-- Featured -->
      <section v-if="featuredMessages.length > 0">
        <div class="columns-1 sm:columns-2 lg:columns-3 gap-6">
          <MessageCard v-for="msg in featuredMessages" :key="msg.id" :message="msg" class="break-inside-avoid mb-6" />
        </div>
      </section>

      <!-- All messages -->
      <section>
        <div v-if="regularMessages.length > 0" class="columns-1 sm:columns-2 lg:columns-3 gap-6">
          <MessageCard v-for="msg in regularMessages" :key="msg.id" :message="msg" class="break-inside-avoid mb-6" />
        </div>

        <div v-else-if="featuredMessages.length === 0" class="text-center py-16 text-stone-400">
          <p>{{ $t('home.empty') }}</p>
          <NuxtLink :to="localePath('/submit')" class="btn-primary mt-4 inline-flex">
            {{ $t('nav.submit') }}
          </NuxtLink>
        </div>
      </section>

      <!-- Pagination -->
      <Pagination
        :current-page="page"
        :total-pages="data.totalPages"
        @change="onPageChange"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const { t }      = useI18n()
const { apiFetch } = useApi()
const { displayTitle, displaySubtitle, pageTitle } = useSiteConfig()

useHead(() => ({ title: pageTitle() }))

const page = ref(1)

const { data, pending, refresh } = await useAsyncData(
  () => `messages-p${page.value}`,
  () => apiFetch<any>('/api/messages', { query: { page: page.value, limit: 12 } }),
  { watch: [page] }
)

const featuredMessages = computed(() => data.value?.data.filter((m: any) => m.highlight) ?? [])
const regularMessages  = computed(() => data.value?.data.filter((m: any) => !m.highlight) ?? [])

function onPageChange(p: number) {
  page.value = p
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
