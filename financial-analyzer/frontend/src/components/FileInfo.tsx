import { UploadResponse } from '../services/api'

interface FileInfoProps {
  file: UploadResponse
  onClear?: () => void
}

export function FileInfo({ file, onClear }: FileInfoProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const getFileIcon = (type: string): string => {
    switch (type) {
      case 'video':
        return '🎬'
      case 'audio':
        return '🎵'
      case 'image':
        return '🖼️'
      default:
        return '📄'
    }
  }

  return (
    <div className="file-info">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p className="file-info-title">
            {getFileIcon(file.file_type)} File Uploaded Successfully
          </p>
          <div style={{ marginTop: '0.75rem' }}>
            <div className="file-info-item">
              <span className="file-info-label">Filename:</span>
              <span className="file-info-value">{file.original_filename}</span>
            </div>
            <div className="file-info-item">
              <span className="file-info-label">Type:</span>
              <span className="file-info-value">{file.file_type.toUpperCase()}</span>
            </div>
            <div className="file-info-item">
              <span className="file-info-label">Size:</span>
              <span className="file-info-value">{formatFileSize(file.file_size)}</span>
            </div>
          </div>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            🗑️ Clear
          </button>
        )}
      </div>
    </div>
  )
}
