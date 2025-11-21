import { useState, useEffect } from 'react'
import { uploadFile, analyzeFile, UploadResponse } from './services/api'
import { FileUploadZone } from './components/FileUploadZone'
import { FileInfo } from './components/FileInfo'
import { AnalysisResult } from './components/AnalysisResult'
import { HistoryPanel } from './components/HistoryPanel'
import { AnalysisHistory } from './types'
import { exportToPDF } from './utils/exportPDF'

const HISTORY_STORAGE_KEY = 'financial_analyzer_history'

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
  const [analysisMode, setAnalysisMode] = useState<'quick' | 'premium'>('premium')

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
    setProcessingTime(undefined)

    try {
      const response = await analyzeFile(uploadedFile.file_id, userQuery, analysisMode)
      setAnalysis(response.analysis)
      setProcessingTime(response.processing_time)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsLoading(false)
    }
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

              {/* Analysis Mode Toggle */}
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--gray-800)',
                borderRadius: 'var(--radius-md)'
              }}>
                <label style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-tertiary)',
                  marginBottom: '0.75rem',
                  display: 'block'
                }}>
                  🎯 Analysis Mode
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setAnalysisMode('quick')}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      border: `2px solid ${analysisMode === 'quick' ? 'var(--gold)' : 'var(--gray-800)'}`,
                      background: analysisMode === 'quick' ? 'var(--gold-subtle)' : 'var(--bg-card)',
                      color: analysisMode === 'quick' ? 'var(--gold)' : 'var(--text-secondary)',
                      borderRadius: 'var(--radius-md)',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: analysisMode === 'quick' ? '700' : '500',
                      fontSize: '0.9375rem'
                    }}
                  >
                    <div>⚡ Quick Mode</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.8 }}>
                      2 stages • ~30-60s
                    </div>
                  </button>
                  <button
                    onClick={() => setAnalysisMode('premium')}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      border: `2px solid ${analysisMode === 'premium' ? 'var(--gold)' : 'var(--gray-800)'}`,
                      background: analysisMode === 'premium' ? 'var(--gold-subtle)' : 'var(--bg-card)',
                      color: analysisMode === 'premium' ? 'var(--gold)' : 'var(--text-secondary)',
                      borderRadius: 'var(--radius-md)',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: analysisMode === 'premium' ? '700' : '500',
                      fontSize: '0.9375rem'
                    }}
                  >
                    <div>🏆 Premium Mode</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.8 }}>
                      7 stages • ~90-180s • Maximum Precision
                    </div>
                  </button>
                </div>
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
                      {analysisMode === 'premium' ? 'Analyzing (7 stages)...' : 'Analyzing...'}
                    </>
                  ) : (
                    <>
                      {analysisMode === 'premium' ? '🏆 Analyze (Premium)' : '⚡ Analyze (Quick)'}
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
            <div className="loading">
              <div className="spinner"></div>
              <span>
                {analysisMode === 'premium'
                  ? '🏆 Premium Analysis in progress (7 institutional-grade stages)... This will take 90-180 seconds.'
                  : '⚡ Quick Analysis in progress (2 stages)... This will take 30-60 seconds.'}
              </span>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <strong>❌ Error:</strong> {error}
            </div>
          )}

          {analysis && (
            <AnalysisResult
              analysis={analysis}
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
