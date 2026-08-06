<template>
  <div class="max-w-2xl mx-auto px-4 py-10">
    <div class="card p-6 sm:p-8">
      <h1 class="text-2xl font-serif text-stone-800 mb-6">{{ $t('form.createTitle') }}</h1>

      <div v-if="submitted" class="text-center space-y-4 py-8">
        <svg class="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-lg font-serif text-stone-700">{{ $t('form.success') }}</p>
        <div class="flex gap-3 justify-center flex-wrap">
          <NuxtLink :to="localePath(`/message/${submittedId}`)" class="btn-primary">
            {{ $t('form.viewMessage') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/')" class="btn-secondary">
            {{ $t('nav.home') }}
          </NuxtLink>
        </div>
      </div>

      <MessageForm
        v-else
        mode="create"
        @submitted="onSubmitted"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '~/composables/useMessages'

const { t }      = useI18n()
const localePath = useLocalePath()

useHead({ title: `${t('form.createTitle')} — ${t('site.title')}` })

const submitted   = ref(false)
const submittedId = ref<number>()

function onSubmitted(msg: Message) {
  submittedId.value = msg.id
  submitted.value   = true
}
</script>
