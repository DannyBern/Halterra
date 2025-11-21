import { useRef } from 'react'

interface FileUploadZoneProps {
  isDragging: boolean
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}

export function FileUploadZone({
  isDragging,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
  disabled = false
}: FileUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="card">
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={onFileSelect}
          style={{ display: 'none' }}
          accept="audio/*,video/*,image/*"
          disabled={disabled}
        />
        <div className="drop-zone-icon">📁</div>
        <p className="drop-zone-text">
          {isDragging
            ? '📥 Drop file here...'
            : '📤 Drag and drop a file here, or click to select'}
        </p>
        <p className="drop-zone-subtext">
          Audio (mp3, wav, m4a...) • Video (mp4, avi, mov...) • Images (jpg, png...)
        </p>
        <p className="drop-zone-subtext" style={{ marginTop: '0.5rem', fontWeight: 600 }}>
          Maximum size: 500MB
        </p>
      </div>
    </div>
  )
}
