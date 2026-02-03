<template>
  <div>
    <FileUploader
      v-if="!isEditing"
      @file-loaded="handleFileLoaded"
    />
    <JsonlEditor
      v-else
      :file-name="loadedFileName"
      @back="handleBack"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import FileUploader from '~/components/FileUploader.vue'
import JsonlEditor from '~/components/JsonlEditor.vue'
import { useJsonlEditor } from '~/composables/useJsonlEditor'

const isEditing = ref(false)
const loadedFileName = ref('')

// Create single composable instance and provide to all components
const jsonlEditor = useJsonlEditor()
provide('jsonlEditor', jsonlEditor)

const handleFileLoaded = (fileName: string, recordCount: number) => {
  loadedFileName.value = fileName
  isEditing.value = true
}

const handleBack = () => {
  isEditing.value = false
  loadedFileName.value = ''
}
</script>
