<template>
  <article class="card flex flex-col hover:shadow-md transition-shadow">
    <!-- Image -->
    <div v-if="message.images.length > 0" class="relative h-48 overflow-hidden">
      <img
        :src="imageBase + message.images[0]"
        :alt="`Photo by ${message.name}`"
        class="w-full h-full object-cover"
      />
      <div v-if="message.images.length > 1" class="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
        +{{ message.images.length - 1 }}
      </div>
    </div>

    <div class="p-5 flex flex-col flex-1 gap-3">
      <!-- Header -->
      <div class="flex items-start justify-between gap-2">
        <div>
          <HighlightBadge v-if="message.highlight" />
          <h3 class="font-serif font-semibold text-stone-800 mt-1">{{ message.name }}</h3>
        </div>
        <time class="text-xs text-stone-400 font-sans whitespace-nowrap mt-1">
          {{ formatDate(message.createTime) }}
        </time>
      </div>

      <!-- Message -->
      <p class="text-stone-600 text-sm leading-relaxed line-clamp-4 flex-1">
        {{ message.message }}
      </p>

      <!-- Custom fields preview -->
      <dl v-if="customFieldEntries.length > 0" class="text-xs font-sans space-y-1 border-t border-stone-100 pt-2">
        <div v-for="[k, v] in customFieldEntries.slice(0, 2)" :key="k" class="flex gap-1">
          <dt class="text-stone-400 font-medium">{{ k }}:</dt>
          <dd class="text-stone-600 truncate">{{ v }}</dd>
        </div>
      </dl>

      <!-- Footer -->
      <NuxtLink
        :to="localePath(`/message/${message.id}`)"
        class="text-memorial-700 hover:text-memorial-900 text-sm font-sans font-medium mt-auto"
      >
        {{ $t('home.readMore') }} &rarr;
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Message } from '~/composables/useMessages'

const props = defineProps<{ message: Message }>()

const config      = useRuntimeConfig()
const imageBase   = (config.public.apiBaseUrl as string) || ''
const localePath  = useLocalePath()
const { locale }  = useI18n()

const customFieldEntries = computed(() =>
  props.message.customFields ? Object.entries(props.message.customFields) : []
)

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(locale.value === 'zh-TW' ? 'zh-TW' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
</script>
