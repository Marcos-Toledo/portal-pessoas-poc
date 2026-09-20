import { Component, type ReactNode } from 'react';

interface Props {
  journeyId: string;
  onRetry?: () => void;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Cada jornada renderiza dentro do próprio Error Boundary:
 * uma falha em um MFE nunca derruba o shell nem as outras jornadas.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        style={{
          border: '1px solid var(--portal-color-danger)',
          borderRadius: 'var(--portal-radius-lg)',
          padding: 'var(--portal-space-lg)',
          background: '#fef2f2',
        }}
      >
        <strong>Jornada "{this.props.journeyId}" indisponível.</strong>
        <p style={{ color: 'var(--portal-color-text-muted)' }}>
          {this.state.error.message}
        </p>
        {this.props.onRetry && (
          <button onClick={this.props.onRetry}>Tentar novamente</button>
        )}
      </div>
    );
  }
}
