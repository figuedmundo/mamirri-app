import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundaryClass extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      hasError: true,
    });
  }

  handleTryAgain = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails } = this.state;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription className="mt-2">
                An unexpected error occurred. Please try again or contact
                support if the problem persists.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={this.handleTryAgain} variant="default">
                  Try Again
                </Button>
                <Button onClick={this.handleGoHome} variant="outline">
                  Go to Dashboard
                </Button>
              </div>

              {showDetails && (
                <div className="mt-4 rounded-md bg-muted p-4">
                  <h4 className="mb-2 font-semibold text-sm">Error Details</h4>
                  {error && (
                    <div className="mb-2">
                      <span className="text-xs text-muted-foreground">
                        Message:
                      </span>
                      <p className="mt-1 text-sm break-all font-mono">
                        {error.message}
                      </p>
                    </div>
                  )}
                  {errorInfo && (
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Component Stack:
                        </span>
                        <pre className="mt-1 text-xs break-all overflow-auto max-h-48 font-mono text-muted-foreground">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={this.toggleDetails}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                {showDetails ? 'Hide Details' : 'Show Technical Details'}
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = ErrorBoundaryClass;
