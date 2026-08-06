<template>
  <div class="space-y-3">
    <!-- Drop zone -->
    <div
      class="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer"
      :class="isDragging ? 'border-memorial-400 bg-memorial-50' : 'border-stone-300 hover:border-memorial-300'"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
      @click="fileInput?.click()"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/gif,image/webp"
        class="hidden"
        @change="onFileChange"
      />
      <svg class="mx-auto h-10 w-10 text-stone-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-sm text-stone-500">{{ $t('upload.dragDrop') }}</p>
      <p class="text-xs text-stone-400 mt-1">{{ $t('form.imagesHint', { max: maxSizeMb }) }}</p>
    </div>

    <!-- Previews -->
    <div v-if="previews.length > 0" class="grid grid-cols-3 sm:grid-cols-4 gap-2">
      <div
        v-for="(prev, i) in previews"
        :key="i"
        class="relative group rounded-lg overflow-hidden aspect-square bg-stone-100"
      >
        <img :src="prev.src" alt="" class="w-full h-full object-cover" />
        <div v-if="prev.uploading" class="absolute inset-0 bg-black/50 flex items-center justify-center">
          <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <button
          v-else
          class="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          :aria-label="$t('upload.remove')"
          @click.stop="removePrev(i)"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <p v-if="error" class="text-red-600 text-xs font-sans">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface Preview {
  src: string
  uploading: boolean
  path?: string
}

const emit = defineEmits<{
  (e: 'update:paths', paths: string[]): void
}>()

const { apiFetch } = useApi()
const { t }        = useI18n()
const config       = useRuntimeConfig()
const maxSizeMb    = 5

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const previews   = ref<Preview[]>([])
const error      = ref('')

function currentPaths(): string[] {
  return previews.value.filter(p => p.path).map(p => p.path!)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? [])
  addFiles(files)
}

function onFileChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  addFiles(files)
  if (fileInput.value) fileInput.value.value = ''
}

async function addFiles(files: File[]) {
  error.value = ''
  const imageFiles = files.filter(f => f.type.startsWith('image/'))
  if (!imageFiles.length) return

  for (const file of imageFiles) {
    if (file.size > maxSizeMb * 1024 * 1024) {
      error.value = t('errors.uploadFailed') + `: ${file.name} too large`
      continue
    }

    const src     = URL.createObjectURL(file)
    const preview: Preview = { src, uploading: true }
    previews.value.push(preview)
    const idx = previews.value.length - 1

    try {
      const form = new FormData()
      form.append('files', file)
      const result = await apiFetch<{ paths: string[] }>('/api/uploads', { method: 'POST', body: form })
      previews.value[idx].path      = result.paths[0]
      previews.value[idx].uploading = false
      emit('update:paths', currentPaths())
    } catch {
      previews.value.splice(idx, 1)
      error.value = t('errors.uploadFailed')
    }
  }
}

function removePrev(i: number) {
  previews.value.splice(i, 1)
  emit('update:paths', currentPaths())
}
</script>
