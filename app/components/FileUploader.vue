<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-slate-800 mb-2">JSONL Editor</h1>
      <p class="text-slate-600">
        Tải lên file JSONL của bạn để chỉnh sửa conversations
      </p>
    </div>

    <div class="w-full max-w-md">
      <!-- Upload Zone -->
      <div
        class="upload-zone"
        :class="{ dragover: isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <div class="mb-4">
          <svg
            class="w-16 h-16 mx-auto text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <p class="text-lg font-semibold text-slate-800 mb-2">
          Kéo thả file JSONL vào đây
        </p>
        <p class="text-slate-600 mb-4">hoặc click để chọn file</p>

        <button
          @click="($refs.fileInput as HTMLInputElement)?.click()"
          class="btn-primary"
        >
          Chọn file từ máy tính
        </button>

        <input
          ref="fileInput"
          type="file"
          accept=".jsonl,.json"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>

      <!-- Supported Format Info -->
      <div class="mt-6 p-4 bg-white rounded-lg border border-slate-200">
        <p class="text-sm text-slate-600">
          <span class="font-semibold">Định dạng hỗ trợ:</span> .jsonl (JSON Lines)
        </p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 rounded-lg">
        <p class="text-red-800 text-sm">{{ error }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="mt-4 text-center">
        <div class="inline-block animate-spin">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { useJsonlEditor } from '~/composables/useJsonlEditor'

const emit = defineEmits<{
  fileLoaded: [fileName: string, recordCount: number]
}>()

// Try to use injected composable, fall back to creating new one
const jsonlEditor = inject<ReturnType<typeof useJsonlEditor>>('jsonlEditor')
const { parseJsonl } = jsonlEditor || useJsonlEditor()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const error = ref('')
const isLoading = ref(false)

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file !== undefined) {
      await processFile(file)
    }
  }
}

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file !== undefined) {
      await processFile(file)
    }
  }
}

const processFile = async (file: File) => {
  error.value = ''
  isLoading.value = true

  try {
    // Validate file extension
    if (!file.name.endsWith('.jsonl') && !file.name.endsWith('.json')) {
      error.value = 'Vui lòng chọn file .jsonl hoặc .json'
      isLoading.value = false
      return
    }

    // Read file content
    const content = await file.text()
    console.log('File content:', content.substring(0, 200))
    
    // Parse JSONL
    const records = parseJsonl(content, file.name)
    console.log('Parsed records:', records.length, records)

    if (records.length === 0) {
      error.value = 'File không chứa dữ liệu hợp lệ'
      isLoading.value = false
      return
    }

    // Check if records have messages
    const recordsWithMessages = records.filter(r => r.messages && r.messages.length > 0)
    console.log('Records with messages:', recordsWithMessages.length)
    
    if (recordsWithMessages.length === 0) {
      error.value = 'File không chứa messages. Vui lòng chọn file JSONL với structure: {"timestamp": "...", "messages": [...]}'
      isLoading.value = false
      return
    }

    emit('fileLoaded', file.name, records.length)
  } catch (err) {
    console.error('Error:', err)
    error.value = `Lỗi khi đọc file: ${(err as Error).message}`
  } finally {
    isLoading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}
</script>
