import React from 'react'

interface ProgressStage {
  stage: number
  total: number
  name: string
  status: 'pending' | 'in_progress' | 'completed'
  progress_pct: number
}

interface ProgressTrackerProps {
  currentProgress?: ProgressStage
  message?: string
}

export function ProgressTracker({ currentProgress, message }: ProgressTrackerProps) {
  const stages = [
    { id: 0, name: 'Classification', icon: '🔍' },
    { id: 1, name: 'Extraction données', icon: '📊' },
    { id: 2, name: 'Analyse quantitative', icon: '🔢' },
    { id: 3, name: 'Analyse qualitative', icon: '🎓' },
    { id: 4, name: 'Analyse de risques', icon: '⚠️' },
    { id: 5, name: 'Évaluation comparative', icon: '📊' },
    { id: 6, name: 'Synthèse & décision', icon: '✅' },
    { id: 7, name: 'Visualisation', icon: '📈' }
  ]

  const getStageStatus = (stageId: number): 'pending' | 'in_progress' | 'completed' => {
    if (!currentProgress) return 'pending'
    if (stageId < currentProgress.stage) return 'completed'
    if (stageId === currentProgress.stage) return currentProgress.status
    return 'pending'
  }

  return (
    <div style={{
      padding: '30px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      border: '2px solid #d4af37',
      margin: '20px 0'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '25px',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '20px',
          color: '#d4af37',
          margin: '0 0 10px 0',
          fontWeight: 'bold'
        }}>
          🏆 Analyse Institutionnelle en 7 Étapes
        </h3>
        {message && (
          <p style={{
            color: '#666',
            fontSize: '14px',
            margin: 0,
            fontStyle: 'italic'
          }}>
            {message}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      {currentProgress && (
        <div style={{
          marginBottom: '25px',
          backgroundColor: '#e0e0e0',
          borderRadius: '10px',
          height: '12px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            width: `${currentProgress.progress_pct}%`,
            height: '100%',
            backgroundColor: '#d4af37',
            transition: 'width 0.5s ease-in-out',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(212, 175, 55, 0.4)'
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '10px',
            fontWeight: 'bold',
            color: currentProgress.progress_pct > 50 ? '#fff' : '#666'
          }}>
            {currentProgress.progress_pct}%
          </div>
        </div>
      )}

      {/* Stages List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {stages.map((stage) => {
          const status = getStageStatus(stage.id)
          const isActive = status === 'in_progress'
          const isCompleted = status === 'completed'

          return (
            <div
              key={stage.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '12px 15px',
                backgroundColor: isActive ? '#fff8e1' : isCompleted ? '#f1f8e9' : '#fff',
                border: `2px solid ${isActive ? '#d4af37' : isCompleted ? '#81c784' : '#e0e0e0'}`,
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isActive ? '0 4px 8px rgba(212, 175, 55, 0.2)' : 'none'
              }}
            >
              {/* Icon/Status */}
              <div style={{
                fontSize: '24px',
                minWidth: '30px',
                textAlign: 'center'
              }}>
                {isCompleted ? '✅' : isActive ? (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: '3px solid #d4af37',
                    borderTop: '3px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : stage.icon}
              </div>

              {/* Stage Info */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: isActive ? 'bold' : '500',
                  color: isCompleted ? '#4caf50' : isActive ? '#d4af37' : '#666',
                  marginBottom: '2px'
                }}>
                  Étape {stage.id + 1}/8: {stage.name}
                </div>
                {isActive && currentProgress && (
                  <div style={{
                    fontSize: '12px',
                    color: '#888',
                    fontStyle: 'italic'
                  }}>
                    {currentProgress.name}
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div style={{
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '4px 10px',
                borderRadius: '12px',
                backgroundColor: isCompleted ? '#4caf50' : isActive ? '#d4af37' : '#e0e0e0',
                color: isCompleted || isActive ? '#fff' : '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {isCompleted ? 'Terminé' : isActive ? 'En cours' : 'En attente'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Animation CSS */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}
