import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: Error }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full bg-card border border-line rounded-xl p-6 text-center">
            <h1 className="text-xl font-semibold text-foreground">Algo deu errado</h1>
            <p className="mt-2 text-sm text-muted-foreground">Tente recarregar a página ou voltar ao Dashboard.</p>
            <a href="/" className="mt-4 inline-block px-4 py-2 rounded-md bg-brand text-white">Ir para o início</a>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}