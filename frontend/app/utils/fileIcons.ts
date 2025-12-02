// File type to emoji mapping for clean UI
export const getFileEmoji = (filename: string, isFolder = false): string => {
  if (isFolder) return '📁'
  
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  
  const emojiMap: Record<string, string> = {
    // Documents
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📃',
    md: '📃',
    rtf: '📃',
    
    // Spreadsheets
    xls: '📊',
    xlsx: '📊',
    csv: '📊',
    
    // Presentations
    ppt: '📽️',
    pptx: '📽️',
    key: '📽️',
    
    // Images
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    svg: '🖼️',
    webp: '🖼️',
    bmp: '🖼️',
    ico: '🖼️',
    
    // Audio
    mp3: '🎵',
    wav: '🎵',
    flac: '🎵',
    aac: '🎵',
    ogg: '🎵',
    
    // Video
    mp4: '🎬',
    avi: '🎬',
    mkv: '🎬',
    mov: '🎬',
    wmv: '🎬',
    webm: '🎬',
    
    // Archives
    zip: '📦',
    rar: '📦',
    '7z': '📦',
    tar: '📦',
    gz: '📦',
    
    // Code
    js: '💻',
    ts: '💻',
    jsx: '💻',
    tsx: '💻',
    vue: '💚',
    html: '🌐',
    css: '🎨',
    scss: '🎨',
    json: '📋',
    xml: '📋',
    yml: '📋',
    yaml: '📋',
    
    // Programming languages
    py: '🐍',
    rb: '💎',
    java: '☕',
    c: '⚙️',
    cpp: '⚙️',
    h: '⚙️',
    rs: '🦀',
    go: '🐹',
    php: '🐘',
    
    // Executables
    exe: '⚡',
    dmg: '💿',
    app: '📱',
    
    // Design
    psd: '🎨',
    ai: '🎨',
    fig: '🎨',
    sketch: '🎨',
    
    // Data
    sql: '🗃️',
    db: '🗃️',
    sqlite: '🗃️',
  }
  
  return emojiMap[ext] || '📄'
}

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '—'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let size = bytes
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`
}

// Format date for display
export const formatFileDate = (timestamp: number | string | Date): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

// Get file extension
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : ''
}

// Check if file is an image
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico']
  return imageExtensions.includes(getFileExtension(filename))
}

// Check if file is a video
export const isVideoFile = (filename: string): boolean => {
  const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'webm']
  return videoExtensions.includes(getFileExtension(filename))
}

// Check if file is audio
export const isAudioFile = (filename: string): boolean => {
  const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg']
  return audioExtensions.includes(getFileExtension(filename))
}
