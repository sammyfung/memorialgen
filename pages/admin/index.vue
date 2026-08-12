<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h1 class="text-2xl font-serif text-stone-800">{{ $t('admin.title') }}</h1>
      <div class="flex items-center gap-3">
        <NuxtLink :to="localePath('/')" class="btn-ghost text-sm">
          &larr; {{ $t('nav.home') }}
        </NuxtLink>
        <button class="btn-secondary text-sm" @click="logout">
          {{ $t('admin.logout') }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3 flex-wrap font-sans text-sm">
      <span class="text-stone-500">{{ $t('admin.filter') }}:</span>
      <button
        v-for="f in filters"
        :key="f.value"
        class="px-3 py-1 rounded-full border transition-colors"
        :class="activeFilter === f.value
          ? 'bg-memorial-700 text-white border-memorial-700'
          : 'border-stone-200 text-stone-600 hover:bg-stone-100'"
        @click="setFilter(f.value)"
      >
        {{ $t(f.label) }}
      </button>
    </div>

    <!-- Table -->
    <div class="card overflow-x-auto">
      <table class="w-full text-left min-w-[700px]">
        <thead class="bg-stone-50 text-xs font-sans text-stone-500 uppercase tracking-wide">
          <tr>
            <th class="px-4 py-3">ID</th>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Message</th>
            <th class="px-4 py-3">Date</th>
            <th class="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <AdminMessageRow
            v-for="msg in data?.data"
            :key="msg.id"
            :message="msg"
            @toggle-active="toggleActive"
            @toggle-highlight="toggleHighlight"
            @touch="touchMessage"
          />
        </tbody>
      </table>

      <div v-if="!data?.data?.length" class="text-center py-12 text-stone-400 font-sans">
        No messages found.
      </div>
    </div>

    <div class="flex items-center justify-between font-sans text-sm text-stone-500 flex-wrap gap-2">
      <span>{{ data?.total ?? 0 }} total</span>
      <Pagination
        :current-page="page"
        :total-pages="data?.totalPages ?? 1"
        @change="page = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const { t }      = useI18n()
const localePath = useLocalePath()
const { logout } = useAdminAuth()
const { apiFetch } = useApi()
const { pageTitle } = useSiteConfig()

useHead({ title: pageTitle(t('admin.title')) })

const page         = ref(1)
const activeFilter = ref<string>('all')

const filters = [
  { value: 'all',      label: 'admin.filterAll' },
  { value: 'active',   label: 'admin.filterActive' },
  { value: 'inactive', label: 'admin.filterInactive' },
]

function setFilter(v: string) {
  activeFilter.value = v
  page.value = 1
}

const { data, refresh } = await useAsyncData(
  () => `admin-messages-${page.value}-${activeFilter.value}`,
  () => {
    const query: Record<string, string> = { page: String(page.value), limit: '20' }
    if (activeFilter.value === 'active')   query.active = 'true'
    if (activeFilter.value === 'inactive') query.active = 'false'
    return apiFetch<any>('/api/admin/messages', { query })
  },
  { watch: [page, activeFilter] }
)

async function toggleActive(msg: any) {
  await apiFetch(`/api/admin/messages/${msg.id}/active`, {
    method: 'PATCH',
    body: { active: !msg.active },
  })
  refresh()
}

async function toggleHighlight(msg: any) {
  await apiFetch(`/api/admin/messages/${msg.id}/highlight`, {
    method: 'PATCH',
    body: { highlight: !msg.highlight },
  })
  refresh()
}

async function touchMessage(msg: any) {
  await apiFetch(`/api/admin/messages/${msg.id}/touch`, { method: 'PATCH' })
  refresh()
}
</script>
