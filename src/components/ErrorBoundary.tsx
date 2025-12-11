import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary pour capturer les crashs React
 * Affiche un écran de récupération au lieu d'un écran blanc/bleu
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#0f172a',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1.5rem'
          }}>
            🌿
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: 'rgba(255,255,255,0.95)'
          }}>
            Un moment de pause
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '2rem',
            maxWidth: '300px',
            lineHeight: 1.6
          }}>
            Une petite turbulence s'est produite. Prends un moment pour respirer, puis réessaie.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'white',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
            }}
          >
            Réessayer
          </button>
          {this.state.error && (
            <details style={{
              marginTop: '2rem',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.4)',
              maxWidth: '300px'
            }}>
              <summary style={{ cursor: 'pointer' }}>Détails techniques</summary>
              <pre style={{
                marginTop: '0.5rem',
                textAlign: 'left',
                overflow: 'auto',
                padding: '0.5rem',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '4px'
              }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
