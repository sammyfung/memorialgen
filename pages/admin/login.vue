<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4">
    <div class="card p-8 w-full max-w-sm space-y-6">
      <h1 class="text-xl font-serif text-stone-800 text-center">{{ $t('admin.login') }}</h1>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">{{ $t('admin.password') }}</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            autocomplete="current-password"
            required
          />
        </div>

        <p v-if="error" class="text-gray-500 text-sm font-sans">{{ $t('errors.wrongPassword') }}</p>

        <button type="submit" class="btn-primary w-full" :disabled="loading">
          {{ loading ? '...' : $t('admin.loginButton') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { t }      = useI18n()
const localePath = useLocalePath()
const { pageTitle } = useSiteConfig()

useHead({ title: pageTitle(t('admin.login')) })

const { login } = useAdminAuth()

const password = ref('')
const loading  = ref(false)
const error    = ref(false)

async function handleLogin() {
  loading.value = true
  error.value   = false
  const ok = await login(password.value)
  loading.value = false
  if (ok) {
    await navigateTo(localePath('/admin'))
  } else {
    error.value = true
  }
}
</script>
