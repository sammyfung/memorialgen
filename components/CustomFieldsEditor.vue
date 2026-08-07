<template>
  <div class="space-y-2">
    <div
      v-for="(field, i) in fields"
      :key="i"
      class="flex gap-2 items-center"
    >
      <input
        v-model="field.key"
        type="text"
        class="form-input flex-1"
        :placeholder="$t('form.fieldName')"
        @input="emit"
      />
      <input
        v-model="field.value"
        type="text"
        class="form-input flex-[2]"
        :placeholder="$t('form.fieldValue')"
        @input="emit"
      />
      <button
        type="button"
        class="btn-ghost text-gray-500 hover:text-gray-700 px-2 shrink-0"
        :aria-label="$t('form.removeField')"
        @click="remove(i)"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <button
      type="button"
      class="btn-ghost text-sm text-memorial-700 hover:text-memorial-900"
      @click="add"
    >
      + {{ $t('form.addField') }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Field { key: string; value: string }

const props = defineProps<{
  modelValue: Record<string, string> | null
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', val: Record<string, string>): void
}>()

const fields = ref<Field[]>([])

// Initialize from prop
watch(() => props.modelValue, (val) => {
  if (val && Object.keys(val).length > 0) {
    fields.value = Object.entries(val).map(([key, value]) => ({ key, value }))
  }
}, { immediate: true })

function add() {
  fields.value.push({ key: '', value: '' })
}

function remove(i: number) {
  fields.value.splice(i, 1)
  emit()
}

function emit() {
  const result: Record<string, string> = {}
  for (const f of fields.value) {
    if (f.key.trim()) result[f.key.trim()] = f.value
  }
  emits('update:modelValue', result)
}
</script>
