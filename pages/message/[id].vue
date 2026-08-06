<template>
  <div class="max-w-3xl mx-auto px-4 py-10">
    <!-- Loading -->
    <div v-if="pending" class="flex justify-center py-16">
      <svg class="animate-spin h-8 w-8 text-memorial-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="message" class="space-y-6">
      <!-- Back -->
      <NuxtLink :to="localePath('/')" class="text-sm text-stone-400 hover:text-stone-600 font-sans">
        &larr; {{ $t('nav.home') }}
      </NuxtLink>

      <div class="card p-6 sm:p-8 space-y-6">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <HighlightBadge v-if="message.highlight" class="mb-2" />
            <h1 class="text-2xl font-serif text-stone-800">{{ message.name }}</h1>
            <p class="text-stone-400 text-sm font-sans mt-1">
              {{ $t('message.posted') }}: {{ formatDate(message.createTime) }}
              <template v-if="message.updateTime !== message.createTime">
                &bull; {{ $t('message.updated') }}: {{ formatDate(message.updateTime) }}
              </template>
            </p>
          </div>
          <button
            v-if="message.hasPassword"
            class="btn-secondary text-sm"
            @click="showEdit = !showEdit"
          >
            {{ showEdit ? $t('form.cancel') : $t('message.edit') }}
          </button>
        </div>

        <!-- Message body -->
        <div v-if="!showEdit" class="space-y-4">
          <p class="text-stone-700 leading-relaxed whitespace-pre-wrap">{{ message.message }}</p>

          <!-- Custom fields -->
          <dl v-if="customEntries.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-stone-100 pt-4">
            <div v-for="[k, v] in customEntries" :key="k">
              <dt class="text-xs font-medium text-stone-400 font-sans">{{ k }}</dt>
              <dd class="text-sm text-stone-700 mt-0.5">{{ v }}</dd>
            </div>
          </dl>

          <!-- Images -->
          <div v-if="message.images.length > 0" class="border-t border-stone-100 pt-4">
            <p class="text-sm font-medium text-stone-500 font-sans mb-3">{{ $t('message.images') }}</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <a
                v-for="(img, i) in message.images"
                :key="i"
                :href="imageBase + img"
                target="_blank"
                class="block rounded-lg overflow-hidden aspect-square bg-stone-100 hover:opacity-90 transition-opacity"
              >
                <img :src="imageBase + img" :alt="`Photo ${i + 1}`" class="w-full h-full object-cover" />
              </a>
            </div>
          </div>

          <!-- No password notice -->
          <p v-if="!message.hasPassword" class="text-xs text-stone-400 font-sans border-t border-stone-100 pt-4">
            {{ $t('message.noPassword') }}
          </p>
        </div>

        <!-- Edit form -->
        <div v-else>
          <h2 class="text-lg font-serif text-stone-700 mb-4">{{ $t('form.editTitle') }}</h2>

          <div v-if="editSuccess" class="text-center space-y-3 py-6">
            <p class="text-green-600 font-sans">{{ $t('form.successEdit') }}</p>
            <button class="btn-secondary" @click="editSuccess = false; showEdit = false; refresh()">
              OK
            </button>
          </div>

          <MessageForm
            v-else
            mode="edit"
            :initial="message"
            :message-id="message.id"
            @submitted="onEdited"
          >
            <template #actions>
              <button
                type="button"
                class="btn-danger text-sm"
                @click="confirmDelete"
              >
                {{ $t('message.delete') }}
              </button>
            </template>
          </MessageForm>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16 text-stone-400">
      <p>{{ $t('errors.notFound') }}</p>
      <NuxtLink :to="localePath('/')" class="btn-secondary mt-4 inline-flex">
        {{ $t('nav.home') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '~/composables/useMessages'

const route      = useRoute()
const localePath = useLocalePath()
const { t }      = useI18n()
const config     = useRuntimeConfig()
const imageBase  = (config.public.apiBaseUrl as string) || ''

const { apiFetch }     = useApi()
const { deleteMessage } = useMessages()

const id        = parseInt(String(route.params.id))
const showEdit  = ref(false)
const editSuccess = ref(false)

const { data: message, pending, refresh } = await useAsyncData<Message | null>(
  `message-${id}`,
  async () => {
    try { return await apiFetch<Message>(`/api/messages/${id}`) }
    catch { return null }
  }
)

const { pageTitle } = useSiteConfig()

useHead(() => ({
  title: message.value
    ? pageTitle(message.value.name)
    : t('errors.notFound'),
}))

const customEntries = computed(() =>
  message.value?.customFields ? Object.entries(message.value.customFields) : []
)

function formatDate(ts: number) {
  const locale = useI18n().locale.value
  return new Date(ts).toLocaleDateString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function onEdited(updated: Message) {
  message.value  = updated
  editSuccess.value = true
}

async function confirmDelete() {
  const pwd = prompt(t('message.passwordRequired'))
  if (pwd === null) return
  if (!confirm(t('message.confirmDelete'))) return
  try {
    await deleteMessage(id, pwd)
    await navigateTo(localePath('/'))
  } catch (e: any) {
    alert(e?.data?.statusMessage || t('errors.serverError'))
  }
}
</script>
