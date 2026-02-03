import { ref, computed } from 'vue'

export interface JsonlMessage {
  id: string
  role: string
  content: string
}

export interface JsonlRecord {
  id: string
  data: Record<string, any>
  raw: string
  isValid: boolean
  error?: string
  messages?: JsonlMessage[]
}

export const useJsonlEditor = () => {
  const records = ref<JsonlRecord[]>([])
  const currentIndex = ref<number>(-1)
  const fileName = ref<string>('')
  const originalFileName = ref<string>('')

  // Parse JSONL content
  const parseJsonl = (content: string, inputFileName: string = 'data.jsonl'): JsonlRecord[] => {
    console.log('parseJsonl called with content length:', content.length)
    const lines = content.trim().split('\n').filter(line => line.trim())
    console.log('Total lines:', lines.length)
    
    const parsedRecords: JsonlRecord[] = []

    lines.forEach((line, index) => {
      try {
        const data = JSON.parse(line)
        console.log(`Line ${index}:`, data.timestamp, 'messages:', data.messages?.length)
        
        // Extract messages array if it exists
        const messages: JsonlMessage[] = []
        if (data.messages && Array.isArray(data.messages)) {
          data.messages.forEach((msg: any, msgIndex: number) => {
            if (msg.role && msg.content !== undefined) {
              messages.push({
                id: `msg_${index}_${msgIndex}`,
                role: msg.role || 'unknown',
                content: msg.content || ''
              })
            }
          })
        }

        parsedRecords.push({
          id: `record_${index}`,
          data,
          raw: line,
          isValid: true,
          messages: messages.length > 0 ? messages : [],
        })
      } catch (error) {
        console.error(`Error parsing line ${index}:`, error)
        parsedRecords.push({
          id: `record_${index}`,
          data: {},
          raw: line,
          isValid: false,
          error: (error as Error).message,
          messages: [],
        })
      }
    })

    console.log('Parsed records:', parsedRecords.length)
    records.value = parsedRecords
    fileName.value = inputFileName
    originalFileName.value = inputFileName
    if (parsedRecords.length > 0) {
      currentIndex.value = 0
    }
    return parsedRecords
  }

  // Get current record
  const currentRecord = computed(() => {
    if (currentIndex.value < 0 || currentIndex.value >= records.value.length) {
      return null
    }
    return records.value[currentIndex.value]
  })

  // Update current record
  const updateCurrentRecord = (data: Record<string, any>) => {
    if (!currentRecord.value) return

    try {
      const record = records.value[currentIndex.value]
      if (!record) return
      record.data = data
      record.raw = JSON.stringify(data)
      record.isValid = true
      record.error = undefined
      
      // Update messages if they exist in data
      if (data.messages && Array.isArray(data.messages)) {
        record.messages = data.messages.map((msg: any, msgIndex: number) => ({
          id: `msg_${currentIndex.value}_${msgIndex}`,
          role: msg.role || 'unknown',
          content: msg.content || ''
        }))
      }
    } catch (error) {
      if (currentRecord.value) {
        currentRecord.value.error = (error as Error).message
        currentRecord.value.isValid = false
      }
    }
  }

  // Update specific message
  const updateMessage = (messageId: string, role: string, content: string) => {
    if (!currentRecord.value || !currentRecord.value.messages) return

    const msgIndex = currentRecord.value.messages.findIndex(m => m.id === messageId)
    if (msgIndex >= 0) {
      currentRecord.value.messages[msgIndex] = {
        id: messageId,
        role,
        content
      }

      // Update the data object
      if (currentRecord.value.data.messages && Array.isArray(currentRecord.value.data.messages)) {
        currentRecord.value.data.messages[msgIndex] = { role, content }
        currentRecord.value.raw = JSON.stringify(currentRecord.value.data)
      }
    }
  }

  // Delete specific message
  const deleteMessage = (messageId: string) => {
    if (!currentRecord.value || !currentRecord.value.messages) return

    const msgIndex = currentRecord.value.messages.findIndex(m => m.id === messageId)
    if (msgIndex >= 0) {
      currentRecord.value.messages.splice(msgIndex, 1)

      // Update the data object
      if (currentRecord.value.data.messages && Array.isArray(currentRecord.value.data.messages)) {
        currentRecord.value.data.messages.splice(msgIndex, 1)
        currentRecord.value.raw = JSON.stringify(currentRecord.value.data)
      }
    }
  }

  // Add new message
  const addNewMessage = () => {
    if (!currentRecord.value) return

    if (!Array.isArray(currentRecord.value.data.messages)) {
      currentRecord.value.data.messages = []
    }

    if (!currentRecord.value.messages) {
      currentRecord.value.messages = []
    }

    const newMessage = {
      role: 'user',
      content: ''
    }

    currentRecord.value.data.messages.push(newMessage)
    const msgIndex = currentRecord.value.data.messages.length - 1
    
    currentRecord.value.messages.push({
      id: `msg_${currentIndex.value}_${msgIndex}`,
      role: 'user',
      content: ''
    })

    currentRecord.value.raw = JSON.stringify(currentRecord.value.data)
  }

  // Delete current record
  const deleteCurrentRecord = () => {
    if (currentIndex.value >= 0 && currentIndex.value < records.value.length) {
      records.value.splice(currentIndex.value, 1)
      if (currentIndex.value >= records.value.length && currentIndex.value > 0) {
        currentIndex.value--
      }
    }
  }

  // Add new record
  const addNewRecord = (data: Record<string, any> = {}) => {
    const newRecord: JsonlRecord = {
      id: `record_${records.value.length}`,
      data,
      raw: JSON.stringify(data),
      isValid: true,
    }
    records.value.push(newRecord)
    currentIndex.value = records.value.length - 1
  }

  // Export to JSONL string
  const exportToJsonl = (): string => {
    return records.value
      .filter(r => r.isValid)
      .map(r => r.raw)
      .join('\n')
  }

  // Export and download
  const downloadJsonl = (customFileName?: string) => {
    const content = exportToJsonl()
    const fileNameToUse = customFileName || fileName.value || 'data.jsonl'
    
    const blob = new Blob([content], { type: 'application/jsonl' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileNameToUse
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Get statistics
  const stats = computed(() => {
    const total = records.value.length
    const valid = records.value.filter(r => r.isValid).length
    const invalid = total - valid

    return { total, valid, invalid }
  })

  // Navigate to next record
  const goToNext = () => {
    if (currentIndex.value < records.value.length - 1) {
      currentIndex.value++
    }
  }

  // Navigate to previous record
  const goToPrevious = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  // Go to specific record
  const goToRecord = (index: number) => {
    if (index >= 0 && index < records.value.length) {
      currentIndex.value = index
    }
  }

  // Clear all records
  const clearAll = () => {
    records.value = []
    currentIndex.value = -1
    fileName.value = ''
  }

  return {
    records,
    currentIndex,
    currentRecord,
    fileName,
    originalFileName,
    parseJsonl,
    updateCurrentRecord,
    updateMessage,
    deleteMessage,
    addNewMessage,
    deleteCurrentRecord,
    addNewRecord,
    exportToJsonl,
    downloadJsonl,
    stats,
    goToNext,
    goToPrevious,
    goToRecord,
    clearAll,
  }
}
