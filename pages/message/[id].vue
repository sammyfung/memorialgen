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
          <div class="flex gap-2">
            <button
              v-if="message.hasPassword && editState === 'view'"
              class="btn-secondary text-sm"
              @click="editState = 'gate'"
            >
              {{ $t('message.edit') }}
            </button>
            <button
              v-if="editState !== 'view'"
              class="btn-ghost text-sm"
              @click="cancelEdit"
            >
              {{ $t('form.cancel') }}
            </button>
          </div>
        </div>

        <!-- Message body (view mode) -->
        <div v-if="editState === 'view'" class="space-y-4">
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

        <!-- Credential gate -->
        <div v-else-if="editState === 'gate'" class="space-y-4">
          <h2 class="text-lg font-serif text-stone-700">{{ $t('message.verifyIdentity') }}</h2>
          <p class="text-sm text-stone-500 font-sans">{{ $t('message.verifyHint') }}</p>

          <form class="space-y-4" @submit.prevent="verifyCredentials">
            <div class="form-group">
              <label class="form-label">{{ $t('form.email') }}</label>
              <input
                v-model="gateEmail"
                type="email"
                class="form-input"
                :placeholder="$t('form.emailPlaceholder')"
                autocomplete="email"
              />
            </div>
            <div class="form-group">
              <label class="form-label">{{ $t('form.currentPassword') }} *</label>
              <input
                v-model="gatePassword"
                type="password"
                class="form-input"
                :placeholder="$t('form.currentPasswordPlaceholder')"
                required
                autocomplete="current-password"
              />
            </div>
            <p v-if="gateError" class="text-gray-500 text-sm font-sans">{{ gateError }}</p>
            <button type="submit" class="btn-primary" :disabled="gateLoading">
              {{ gateLoading ? '...' : $t('message.verifyButton') }}
            </button>
          </form>
        </div>

        <!-- Edit form (after credentials verified) -->
        <div v-else-if="editState === 'edit'">
          <h2 class="text-lg font-serif text-stone-700 mb-4">{{ $t('form.editTitle') }}</h2>

          <div v-if="editSuccess" class="text-center space-y-3 py-6">
            <p class="text-green-600 font-sans">{{ $t('form.successEdit') }}</p>
            <button class="btn-secondary" @click="onEditDone">OK</button>
          </div>

          <MessageForm
            v-else
            mode="edit"
            :initial="message"
            :message-id="message.id"
            :locked-credentials="{ email: gateEmail, password: gatePassword }"
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

const { apiFetch }      = useApi()
const { deleteMessage } = useMessages()

const id = parseInt(String(route.params.id))

// edit flow: view → gate → edit
const editState   = ref<'view' | 'gate' | 'edit'>('view')
const editSuccess = ref(false)

// credential gate state
const gateEmail    = ref('')
const gatePassword = ref('')
const gateError    = ref('')
const gateLoading  = ref(false)

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

function cancelEdit() {
  editState.value   = 'view'
  gateError.value   = ''
  editSuccess.value = false
}

async function verifyCredentials() {
  gateError.value   = ''
  gateLoading.value = true
  try {
    await apiFetch(`/api/messages/${id}/verify`, {
      method: 'POST',
      body: { email: gateEmail.value, password: gatePassword.value },
    })
    editState.value = 'edit'
  } catch (e: any) {
    gateError.value = e?.data?.statusMessage || t('errors.wrongPassword')
  } finally {
    gateLoading.value = false
  }
}

function onEdited(updated: Message) {
  message.value     = updated
  editSuccess.value = true
}

function onEditDone() {
  editSuccess.value = false
  editState.value   = 'view'
  refresh()
}

async function confirmDelete() {
  if (!confirm(t('message.confirmDelete'))) return
  try {
    await apiFetch(`/api/messages/${id}`, {
      method: 'DELETE',
      body: { email: gateEmail.value, password: gatePassword.value },
    })
    await navigateTo(localePath('/'))
  } catch (e: any) {
    alert(e?.data?.statusMessage || t('errors.serverError'))
  }
}
</script>
