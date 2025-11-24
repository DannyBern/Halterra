import { useState, useEffect } from 'react'
import { uploadFile, analyzeFileWithProgress, UploadResponse, ProgressEvent } from './services/api'
import { FileUploadZone } from './components/FileUploadZone'
import { FileInfo } from './components/FileInfo'
import { AnalysisResult } from './components/AnalysisResult'
import { HistoryPanel } from './components/HistoryPanel'
import { ProgressTracker } from './components/ProgressTracker'
import { AnalysisHistory } from './types'
import { exportToPDF } from './utils/exportPDF'

const HISTORY_STORAGE_KEY = 'financial_analyzer_history'

interface ProgressState {
  stage: number
  total: number
  name: string
  status: 'pending' | 'in_progress' | 'completed'
  progress_pct: number
}

function App() {
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null)
  const [userQuery, setUserQuery] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [processingTime, setProcessingTime] = useState<number | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [progressState, setProgressState] = useState<ProgressState | undefined>()
  const [progressMessage, setProgressMessage] = useState<string>('')

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  }, [history])

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
    setProcessingTime(undefined)

    try {
      const response = await uploadFile(file)
      setUploadedFile(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyze = () => {
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
    setProcessingTime(undefined)
    setProgressState(undefined)
    setProgressMessage('Démarrage de l\'analyse...')

    analyzeFileWithProgress(
      uploadedFile.file_id,
      userQuery,
      (event: ProgressEvent) => {
        // Handle progress events
        if (event.type === 'progress' && event.stage !== undefined) {
          setProgressState({
            stage: event.stage,
            total: event.total || 7,
            name: event.name || '',
            status: event.status as any || 'in_progress',
            progress_pct: event.progress_pct || 0
          })
        } else if (event.message) {
          setProgressMessage(event.message)
        }
      },
      (analysisText: string, time: number) => {
        // On complete
        setAnalysis(analysisText)
        setProcessingTime(time)
        setIsLoading(false)
        setProgressState(undefined)
        setProgressMessage('')
      },
      (errorMsg: string) => {
        // On error
        setError(errorMsg)
        setIsLoading(false)
        setProgressState(undefined)
        setProgressMessage('')
      }
    )
  }

  const handleSaveToHistory = () => {
    if (!uploadedFile || !analysis) return

    const newItem: AnalysisHistory = {
      id: Date.now().toString(),
      filename: uploadedFile.original_filename,
      fileType: uploadedFile.file_type,
      query: userQuery,
      analysis: analysis,
      timestamp: Date.now(),
      processingTime: processingTime || 0
    }

    setHistory([newItem, ...history])
    alert('✅ Analysis saved to history!')
  }

  const handleSelectHistory = (item: AnalysisHistory) => {
    setUserQuery(item.query)
    setAnalysis(item.analysis)
    setProcessingTime(item.processingTime)
    setShowHistory(false)
    setTimeout(() => {
      document.querySelector('.analysis-result')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleDeleteHistory = (id: string) => {
    if (confirm('Are you sure you want to delete this analysis?')) {
      setHistory(history.filter((item) => item.id !== id))
    }
  }

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      setHistory([])
      localStorage.removeItem(HISTORY_STORAGE_KEY)
    }
  }

  const handleExportPDF = () => {
    if (!uploadedFile || !analysis) return
    exportToPDF(analysis, uploadedFile.original_filename, userQuery)
  }

  const handleClearFile = () => {
    setUploadedFile(null)
    setAnalysis('')
    setProcessingTime(undefined)
    setError('')
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">💼 Financial Analyzer</h1>
        <p className="app-subtitle">
          AI-powered financial opportunity analysis with Claude
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: showHistory ? '1fr 400px' : '1fr', gap: '1.5rem' }}>
        <div>
          <FileUploadZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            disabled={isLoading}
          />

          {uploadedFile && (
            <FileInfo file={uploadedFile} onClear={handleClearFile} />
          )}

          {uploadedFile && (
            <div className="card">
              <div className="input-group">
                <label htmlFor="query" className="input-label">
                  💬 Your Financial Question
                </label>
                <textarea
                  id="query"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Ex: Ce duplex à 450k$ est-il un bon investissement? Analyse les risques et opportunités."
                  className="textarea"
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading || !uploadedFile || !userQuery.trim()}
                  className="btn btn-primary"
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Analyzing (7-stage deep analysis)...
                    </>
                  ) : (
                    <>
                      🎯 Analyze Document
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="btn btn-secondary"
                >
                  {showHistory ? '❌ Hide History' : '📜 Show History'}
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <ProgressTracker
              currentProgress={progressState}
              message={progressMessage}
            />
          )}

          {error && (
            <div className="alert alert-error">
              <strong>❌ Error:</strong> {error}
            </div>
          )}

          {analysis && uploadedFile && (
            <AnalysisResult
              analysis={analysis}
              fileId={uploadedFile.file_id}
              processingTime={processingTime}
              onExportPDF={handleExportPDF}
              onSaveToHistory={handleSaveToHistory}
            />
          )}
        </div>

        {showHistory && (
          <div>
            <HistoryPanel
              history={history}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
              onClear={handleClearHistory}
            />
          </div>
        )}
      </div>

      <footer style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
        <p>
          Powered by Claude AI • Financial Analyzer v1.0
        </p>
      </footer>
    </div>
  )
}

export default App
