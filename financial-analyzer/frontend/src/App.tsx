import { useState, useRef } from 'react'
import { uploadFile, analyzeFile, UploadResponse } from './services/api'

function App() {
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null)
  const [userQuery, setUserQuery] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setError('')
    setIsLoading(true)
    setAnalysis('')

    try {
      console.log('Uploading file:', file.name)
      const response = await uploadFile(file)
      setUploadedFile(response)
      console.log('File uploaded successfully:', response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      console.error('Upload error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      setError('Please upload a file first')
      return
    }

    if (!userQuery.trim()) {
      setError('Please enter a question')
      return
    }

    setError('')
    setIsLoading(true)
    setAnalysis('')

    try {
      console.log('Analyzing file:', uploadedFile.file_id)
      const response = await analyzeFile(uploadedFile.file_id, userQuery)
      setAnalysis(response.analysis)
      console.log(`Analysis completed in ${response.processing_time.toFixed(2)}s`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
      console.error('Analysis error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Financial Analyzer</h1>
      <p>Upload audio, video, or image files to analyze financial opportunities</p>

      {/* File Upload Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging ? '3px dashed #007bff' : '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging ? '#f0f8ff' : '#fafafa',
          marginBottom: '20px'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="audio/*,video/*,image/*"
        />
        <p style={{ fontSize: '18px', margin: 0 }}>
          {isDragging
            ? 'Drop file here...'
            : 'Drag and drop a file here, or click to select'}
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          Supported: Audio (mp3, wav, m4a, etc.), Video (mp4, avi, mov, etc.), Images (jpg, png, etc.)
        </p>
      </div>

      {/* Uploaded File Info */}
      {uploadedFile && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
          <p><strong>File uploaded:</strong> {uploadedFile.original_filename}</p>
          <p><strong>Type:</strong> {uploadedFile.file_type}</p>
          <p><strong>Size:</strong> {formatFileSize(uploadedFile.file_size)}</p>
        </div>
      )}

      {/* Query Input */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="query" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Your Question:
        </label>
        <textarea
          id="query"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder="Ex: Ce duplex à 450k$ est-il un bon investissement?"
          rows={4}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '14px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={isLoading || !uploadedFile}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: isLoading || !uploadedFile ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading || !uploadedFile ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {isLoading ? 'Processing...' : 'Analyser'}
      </button>

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
          <p>⏳ Processing your file... This may take a minute.</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8d7da', borderRadius: '4px', color: '#721c24' }}>
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {/* Analysis Result */}
      {analysis && (
        <div style={{ marginTop: '20px' }}>
          <h2>Analysis Result:</h2>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            fontSize: '14px',
            lineHeight: '1.6',
            border: '1px solid #ddd'
          }}>
            {analysis}
          </pre>
        </div>
      )}
    </div>
  )
}

export default App
