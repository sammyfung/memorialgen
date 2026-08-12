<template>
  <tr class="border-t border-stone-100 hover:bg-stone-50">
    <td class="px-4 py-3 text-sm text-stone-500 font-sans w-12">{{ message.id }}</td>
    <td class="px-4 py-3">
      <div class="font-medium text-stone-800 text-sm">{{ message.name }}</div>
      <div class="text-stone-400 text-xs font-sans">{{ message.email || '—' }}</div>
    </td>
    <td class="px-4 py-3 max-w-xs">
      <p class="text-sm text-stone-600 line-clamp-2">{{ message.message }}</p>
    </td>
    <td class="px-4 py-3 text-xs font-sans text-stone-500 whitespace-nowrap">
      {{ formatDate(message.createTime) }}
    </td>
    <td class="px-4 py-3">
      <div class="flex gap-1 items-center">
        <!-- Toggle active (eye) -->
        <button
          class="icon-btn"
          :class="message.active ? 'text-stone-400 hover:text-gray-700 hover:bg-gray-100' : 'text-green-600 hover:bg-green-50'"
          :title="message.active ? $t('admin.hide') : $t('admin.show')"
          @click="$emit('toggle-active', message)"
        >
          <!-- Eye (active) -->
          <svg v-if="message.active" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <!-- Eye-off (inactive) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        </button>

        <!-- Toggle highlight (star) -->
        <button
          class="icon-btn"
          :class="message.highlight ? 'text-amber-500 hover:text-stone-500 hover:bg-stone-100' : 'text-stone-300 hover:text-amber-500 hover:bg-amber-50'"
          :title="message.highlight ? $t('admin.unhighlight') : $t('admin.highlight')"
          @click="$emit('toggle-highlight', message)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" :fill="message.highlight ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>

        <!-- Touch (clock) -->
        <button
          class="icon-btn text-stone-300 hover:text-blue-600 hover:bg-blue-50"
          :title="$t('admin.touchTime')"
          @click="$emit('touch', message)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </button>

        <!-- Edit (pencil) -->
        <NuxtLink
          :to="localePath(`/message/${message.id}`)"
          class="icon-btn text-stone-300 hover:text-memorial-700 hover:bg-memorial-50"
          :title="$t('admin.edit')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </NuxtLink>

        <!-- View (external link) -->
        <NuxtLink
          :to="localePath(`/message/${message.id}`)"
          class="icon-btn text-stone-300 hover:text-stone-600 hover:bg-stone-100"
          :title="$t('admin.view')"
          target="_blank"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </NuxtLink>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { Message } from '~/composables/useMessages'

const props = defineProps<{ message: Message & { email?: string } }>()
defineEmits<{
  (e: 'toggle-active',    m: typeof props.message): void
  (e: 'toggle-highlight', m: typeof props.message): void
  (e: 'touch',            m: typeof props.message): void
}>()

const localePath = useLocalePath()
const { locale } = useI18n()

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(locale.value === 'zh-TW' ? 'zh-TW' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
</script>
