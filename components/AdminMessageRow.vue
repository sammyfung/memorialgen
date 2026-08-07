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
    <td class="px-4 py-3 text-center">
      <span
        class="inline-block w-2 h-2 rounded-full"
        :class="message.active ? 'bg-green-400' : 'bg-stone-300'"
      />
    </td>
    <td class="px-4 py-3 text-center">
      <span
        class="inline-block w-2 h-2 rounded-full"
        :class="message.highlight ? 'bg-amber-400' : 'bg-stone-300'"
      />
    </td>
    <td class="px-4 py-3">
      <div class="flex gap-2 flex-wrap">
        <button
          class="btn-ghost text-xs border border-stone-200"
          :class="message.active ? 'text-gray-600 hover:bg-gray-100' : 'text-green-700 hover:bg-green-50'"
          @click="$emit('toggle-active', message)"
        >
          {{ message.active ? $t('admin.hide') : $t('admin.show') }}
        </button>
        <button
          class="btn-ghost text-xs border border-stone-200"
          :class="message.highlight ? 'text-stone-600' : 'text-amber-700 hover:bg-amber-50'"
          @click="$emit('toggle-highlight', message)"
        >
          {{ message.highlight ? $t('admin.unhighlight') : $t('admin.highlight') }}
        </button>
        <NuxtLink
          :to="localePath(`/message/${message.id}`)"
          class="btn-ghost text-xs border border-stone-200"
          target="_blank"
        >
          ↗
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
}>()

const localePath = useLocalePath()
const { locale } = useI18n()

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(locale.value === 'zh-TW' ? 'zh-TW' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
</script>
