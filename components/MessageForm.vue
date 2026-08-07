<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- Name -->
    <div class="form-group">
      <label class="form-label">{{ $t('form.name') }} *</label>
      <input
        v-model="form.name"
        type="text"
        class="form-input"
        :placeholder="$t('form.namePlaceholder')"
        required
      />
    </div>

    <!-- Message -->
    <div class="form-group">
      <label class="form-label">{{ $t('form.message') }} *</label>
      <textarea
        v-model="form.message"
        rows="5"
        class="form-input resize-y"
        :placeholder="$t('form.messagePlaceholder')"
        required
      />
    </div>

    <!-- Images (create mode only) -->
    <div v-if="mode === 'create'" class="form-group">
      <label class="form-label">{{ $t('form.images') }}</label>
      <ImageUploader
        :initial-paths="[]"
        @update:paths="form.imagePaths = $event"
      />
    </div>

    <!-- Custom fields (create mode only) -->
    <div v-if="mode === 'create'" class="form-group">
      <label class="form-label">{{ $t('form.customFields') }}</label>
      <CustomFieldsEditor v-model="form.customFields" />
    </div>

    <!-- Auth section — hidden when credentials are pre-verified (edit gate) -->
    <template v-if="!lockedCredentials">
      <details class="border border-stone-200 rounded-lg">
        <summary class="px-4 py-3 cursor-pointer text-sm font-sans text-stone-600 hover:bg-stone-50 rounded-lg">
          {{ mode === 'edit' ? $t('form.currentPassword') : $t('form.email') }} / {{ $t('form.password') }}
          <span class="text-stone-400 text-xs ml-1">({{ $t('form.emailPlaceholder').split('(')[1]?.replace(')', '') }})</span>
        </summary>
        <div class="px-4 pb-4 pt-2 space-y-4 border-t border-stone-100">
          <div class="form-group">
            <label class="form-label">{{ $t('form.email') }} <span class="text-stone-400 font-normal text-xs">({{ $t('form.optional') }})</span></label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              :placeholder="$t('form.emailPlaceholder')"
            />
          </div>

          <div v-if="mode === 'create'" class="form-group">
            <label class="form-label">{{ $t('form.password') }} <span class="text-stone-400 font-normal text-xs">({{ $t('form.optional') }})</span></label>
            <input
              v-model="form.password"
              type="password"
              class="form-input"
              :placeholder="$t('form.passwordPlaceholder')"
            />
          </div>

          <template v-if="mode === 'edit'">
            <div class="form-group">
              <label class="form-label">{{ $t('form.currentPassword') }} <span class="text-stone-400 font-normal text-xs">({{ $t('form.optional') }})</span></label>
              <input
                v-model="form.password"
                type="password"
                class="form-input"
                :placeholder="$t('form.currentPasswordPlaceholder')"
              />
            </div>
            <div class="form-group">
              <label class="form-label">{{ $t('form.newPassword') }} <span class="text-stone-400 font-normal text-xs">({{ $t('form.optional') }})</span></label>
              <input
                v-model="form.newPassword"
                type="password"
                class="form-input"
                :placeholder="$t('form.newPasswordPlaceholder')"
              />
            </div>
          </template>
        </div>
      </details>
    </template>

    <!-- New password change when credentials are pre-verified -->
    <template v-else-if="mode === 'edit'">
      <div class="form-group">
        <label class="form-label">{{ $t('form.newPassword') }} <span class="text-stone-400 font-normal text-xs">({{ $t('form.optional') }})</span></label>
        <input
          v-model="form.newPassword"
          type="password"
          class="form-input"
          :placeholder="$t('form.newPasswordPlaceholder')"
        />
      </div>
    </template>

    <!-- Error -->
    <p v-if="errorMsg" class="text-gray-500 text-sm font-sans">{{ errorMsg }}</p>

    <!-- Actions -->
    <div class="flex gap-3">
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading
          ? (mode === 'edit' ? $t('form.saving') : $t('form.submitting'))
          : (mode === 'edit' ? $t('form.save') : $t('form.submit'))
        }}
      </button>
      <slot name="actions" />
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Message } from '~/composables/useMessages'

const props = defineProps<{
  mode: 'create' | 'edit'
  initial?: Message | null
  messageId?: number
  /** Pre-verified credentials from the edit gate — skips re-entry of email/password */
  lockedCredentials?: { email: string; password: string }
}>()

const emit = defineEmits<{
  (e: 'submitted', msg: Message): void
}>()

const { t }                           = useI18n()
const { createMessage, updateMessage } = useMessages()

const loading  = ref(false)
const errorMsg = ref('')

const form = reactive({
  name:         props.initial?.name    ?? '',
  message:      props.initial?.message ?? '',
  email:        props.lockedCredentials?.email    ?? '',
  password:     props.lockedCredentials?.password ?? '',
  newPassword:  '',
  customFields: (props.initial?.customFields ?? {}) as Record<string, string>,
  imagePaths:   props.initial?.images ?? [] as string[],
})

async function handleSubmit() {
  errorMsg.value = ''
  loading.value  = true
  try {
    let result: Message
    if (props.mode === 'create') {
      result = await createMessage({
        name:         form.name,
        message:      form.message,
        email:        form.email  || undefined,
        password:     form.password || undefined,
        customFields: Object.keys(form.customFields).length ? form.customFields : undefined,
        imagePaths:   form.imagePaths.length ? form.imagePaths : undefined,
      })
    } else {
      result = await updateMessage(props.messageId!, {
        name:         form.name,
        message:      form.message,
        email:        form.email     || undefined,
        password:     form.password  || undefined,
        newPassword:  form.newPassword || undefined,
        customFields: Object.keys(form.customFields).length ? form.customFields : undefined,
        imagePaths:   form.imagePaths,
      })
    }
    emit('submitted', result)
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || t('errors.submitFailed')
  } finally {
    loading.value = false
  }
}
</script>
