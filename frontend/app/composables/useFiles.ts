import { ref } from 'vue'
import api from '~/utils/apiClient'

export type FileItem = {
  id: number
  filename: string
  size: number
  created_at: string
}

export function useFilesState() {
  const files = ref<FileItem[]>([])
  const loading = ref(false)
  const error = ref('')

  async function fetchFiles() {
    error.value = ''
    loading.value = true

    try {
      const res = await api.get('/files')
      files.value = res.data.files as FileItem[]
    } catch (e: any) {
      error.value = e?.response?.data?.detail || 'Failed to load files'
    } finally {
      loading.value = false
    }
  }

  async function upload(file: File) {
    error.value = ''
    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      await fetchFiles()
    } catch (e: any) {
      error.value = e?.response?.data?.detail || 'Upload failed'
    }
  }

  async function download(file: FileItem) {
    error.value = ''

    if (!process.client) return

    try {
      const res = await api.get(`/files/${file.id}/download`, {
        responseType: 'blob'
      })

      const blob = new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.filename
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (e: any) {
      error.value = e?.response?.data?.detail || 'Download failed'
    }
  }

  return {
    files,
    loading,
    error,
    fetchFiles,
    upload,
    download
  }
}
