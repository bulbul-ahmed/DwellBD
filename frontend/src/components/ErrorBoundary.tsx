import React, { ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('Caught error in ErrorBoundary:', error)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
            <div className="flex justify-center">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="mt-4 text-center text-2xl font-bold text-gray-900">
              Something Went Wrong
            </h1>
            <p className="mt-2 text-center text-gray-600">
              We encountered an unexpected error. Please try again.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 rounded bg-gray-100 p-3">
                <p className="text-xs font-mono text-gray-700">
                  {this.state.error?.message}
                </p>
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Go Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
