<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Top Navigation Bar -->
    <div class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Back Button -->
          <button
            @click="goBack"
            class="flex items-center gap-2 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>

          <!-- File Name & Status -->
          <div class="flex-1 ml-6">
            <h1 class="text-2xl font-bold text-slate-800">{{ fileName }}</h1>
            <p class="text-sm text-slate-600">
              <span class="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">✓ Có thể đọc được</span>
            </p>
          </div>

          <!-- Navigation Controls -->
          <div class="flex items-center gap-4">
            <!-- Previous Button -->
            <button
              @click="goToPrevious"
              :disabled="currentIndex <= 0"
              class="flex items-center gap-2 px-4 py-2 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Trước
            </button>

            <!-- Page Indicator -->
            <div class="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
              <input
                v-model.number="jumpToIndex"
                type="number"
                :min="1"
                :max="records.length"
                class="w-12 px-2 py-1 text-center font-semibold text-slate-800 bg-white border border-slate-300 rounded"
              />
              <span class="text-slate-600 font-medium">/ {{ records.length }}</span>
            </div>

            <!-- Next Button -->
            <button
              @click="goToNext"
              :disabled="currentIndex >= records.length - 1"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Sau
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <!-- Download Button -->
            <button
              @click="downloadFile"
              class="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div v-if="currentRecord" class="grid grid-cols-3 gap-6">
        <!-- Messages Editor (Left + Center) -->
        <div class="col-span-2">
          <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 class="text-2xl font-bold text-slate-800 mb-6">
              Dòng {{ currentIndex + 1 }} / {{ records.length }}
            </h2>

            <!-- Messages List -->
            <div class="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-4">
              <div v-if="!currentRecord.messages || currentRecord.messages.length === 0" class="text-center py-12">
                <p class="text-slate-600 text-lg">Không có messages. Nhấp "Thêm Message" để bắt đầu.</p>
              </div>

              <template v-else>
                <div
                  v-for="(message, index) in currentRecord.messages"
                  :key="message.id"
                  class="border-2 border-slate-200 rounded-lg p-5 bg-gradient-to-br from-slate-50 to-white hover:border-slate-300 transition-colors"
                >
                  <!-- Message Header with Role -->
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold" :class="getRoleBadgeClass(message.role)">
                        {{ message.role.toUpperCase() }}
                      </span>
                      <span class="text-xs text-slate-500">Message {{ index + 1 }} / {{ currentRecord.messages?.length }}</span>
                    </div>
                    <button
                      @click="deleteMessage(message.id)"
                      class="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                    >
                      🗑️ Xóa
                    </button>
                  </div>

                  <!-- Role Selection -->
                  <div class="mb-4">
                    <label class="block text-xs font-semibold text-slate-700 mb-2 uppercase">Role</label>
                    <select
                      :value="message.role"
                      @change="updateMessage(message.id, ($event.target as HTMLSelectElement).value, message.content)"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    >
                      <option value="system">system</option>
                      <option value="user">user</option>
                      <option value="assistant">assistant</option>
                      <option value="model">model</option>
                    </select>
                  </div>

                  <!-- Content Textarea -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-2 uppercase">Content</label>
                    <textarea
                      :value="message.content"
                      @input="updateMessage(message.id, message.role, ($event.target as HTMLTextAreaElement).value)"
                      class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm min-h-32 max-h-48 resize-none"
                      placeholder="Nhập nội dung message..."
                    />
                  </div>
                </div>
              </template>
            </div>

            <div class="mt-6 pt-6 border-t border-slate-200">
                <button
                @click="saveChanges"
                class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Lưu Thay Đổi
              </button>
            </div>
            <!-- Add Message Button -->
            <!-- <div class="mt-6 pt-6 border-t border-slate-200">
              <button
                @click="addNewMessage"
                class="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Thêm Message
              </button>
            </div> -->

            <!-- Action Buttons -->
            <!-- <div class="mt-4 grid grid-cols-2 gap-3">
              <button
                @click="saveChanges"
                class="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Lưu Thay Đổi
              </button>
              <button
                @click="deleteRecord"
                class="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa Dòng
              </button>
            </div> -->
          </div>
        </div>

        <!-- JSON Preview (Right Sidebar) -->
        <div class="col-span-1">
          <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm sticky top-28">
            <h3 class="text-lg font-bold text-slate-800 mb-4">JSON Preview</h3>
            
            <!-- Validation Status -->
            <div class="mb-4">
              <div v-if="!currentRecord.isValid" class="p-3 bg-red-100 border border-red-400 rounded-lg">
                <p class="text-red-800 text-sm font-semibold">❌ Lỗi</p>
                <p class="text-red-700 text-xs mt-1">{{ currentRecord.error }}</p>
              </div>
              <div v-else class="p-3 bg-green-100 border border-green-400 rounded-lg">
                <p class="text-green-800 text-sm font-semibold">✅ JSON Hợp Lệ</p>
              </div>
            </div>

            <!-- JSON Display -->
            <div class="json-viewer max-h-96">
              <pre class="text-xs">{{ JSON.stringify(currentRecord.data, null, 2) }}</pre>
            </div>

            <!-- Stats -->
            <div class="mt-6 pt-6 border-t border-slate-200 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-slate-700">Tổng Messages:</span>
                <span class="text-lg font-bold text-slate-800">{{ currentRecord.messages?.length || 0 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-slate-700">Hợp Lệ:</span>
                <span class="text-lg font-bold" :class="currentRecord.isValid ? 'text-green-600' : 'text-red-600'">
                  {{ currentRecord.isValid ? '✓' : '✗' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useJsonlEditor } from '~/composables/useJsonlEditor'

defineProps<{
  fileName: string
}>()

const emit = defineEmits<{
  back: []
}>()

// Use injected composable from app.vue
const jsonlEditor = inject<ReturnType<typeof useJsonlEditor>>('jsonlEditor')
if (!jsonlEditor) {
  throw new Error('jsonlEditor not provided')
}

const {
  records,
  currentIndex,
  currentRecord,
  fileName,
  updateCurrentRecord,
  updateMessage,
  deleteMessage,
  addNewMessage,
  deleteCurrentRecord,
  addNewRecord,
  downloadJsonl,
  stats,
  goToNext,
  goToPrevious,
  goToRecord,
} = jsonlEditor

const jumpToIndex = computed({
  get: () => currentIndex.value + 1,
  set: (val: number) => {
    if (val >= 1 && val <= records.value.length) {
      goToRecord(val - 1)
    }
  }
})

const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    system: 'bg-purple-100 text-purple-800',
    user: 'bg-blue-100 text-blue-800',
    assistant: 'bg-green-100 text-green-800',
    model: 'bg-orange-100 text-orange-800',
  }
  return classes[role] || 'bg-slate-100 text-slate-800'
}

const saveChanges = () => {
  if (currentRecord.value && currentRecord.value.data) {
    // Ensure the raw JSON is updated with current messages
    currentRecord.value.raw = JSON.stringify(currentRecord.value.data)
    
    // Call updateCurrentRecord to mark record as valid
    updateCurrentRecord(currentRecord.value.data)
    
    console.log('Changes saved for record:', currentIndex.value)
    console.log('Updated data:', currentRecord.value.data)
    alert('Thay đổi đã được lưu!')
  }
}

const deleteRecord = () => {
  if (confirm('Bạn chắc chắn muốn xóa dòng này?')) {
    deleteCurrentRecord()
    if (records.value.length > 0) {
      // Refresh will happen through watchers
    }
  }
}

const downloadFile = () => {
  // Download file with original name
  downloadJsonl(fileName.value)
  alert('File JSONL đã được tải về!')
}

const goBack = () => {
  emit('back')
}

// Watch for changes in current record
watch(() => currentRecord.value?.id, () => {
  // Component will reactively update through currentRecord
})

// Initialize on mount
onMounted(() => {
  // Component ready
})
</script>

<style scoped>
.form-group {
  @apply flex flex-col;
}
</style>
