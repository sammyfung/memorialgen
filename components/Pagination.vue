<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-2 font-sans">
    <button
      class="btn-secondary text-sm"
      :disabled="currentPage <= 1"
      @click="$emit('change', currentPage - 1)"
    >
      &larr; {{ $t('pagination.prev') }}
    </button>

    <span class="text-sm text-stone-500 px-2">
      {{ $t('pagination.page', { current: currentPage, total: totalPages }) }}
    </span>

    <button
      class="btn-secondary text-sm"
      :disabled="currentPage >= totalPages"
      @click="$emit('change', currentPage + 1)"
    >
      {{ $t('pagination.next') }} &rarr;
    </button>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
}>()
defineEmits<{ (e: 'change', page: number): void }>()
</script>
