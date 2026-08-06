<template>
  <div class="max-w-6xl mx-auto px-4 py-10 space-y-12">
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
        <h2 class="text-xl font-serif text-stone-700 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {{ $t('home.featured') }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MessageCard v-for="msg in featuredMessages" :key="msg.id" :message="msg" />
        </div>
      </section>

      <!-- All messages -->
      <section>
        <h2 v-if="featuredMessages.length > 0" class="text-xl font-serif text-stone-700 mb-4">
          {{ $t('home.all') }}
        </h2>

        <div v-if="regularMessages.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MessageCard v-for="msg in regularMessages" :key="msg.id" :message="msg" />
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
