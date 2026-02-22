import React from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaHome, FaRedo } from 'react-icons/fa';
import { PATHS } from '../../routes/routePaths';
// Container not needed for ErrorBoundary - using full viewport

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-grey-50);
  padding: 2rem;
`;

const ErrorContent = styled.div`
  max-width: 600px;
  text-align: center;
  background: var(--color-white-0);
  padding: 3rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  color: var(--color-error-500);
  margin-bottom: 1.5rem;
`;

const ErrorTitle = styled.h1`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ErrorDetails = styled.details`
  margin: 2rem 0;
  text-align: left;
  background: var(--color-grey-50);
  padding: 1rem;
  border-radius: var(--radius-md);
  font-family: monospace;
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
`;

const ErrorSummary = styled.summary`
  cursor: pointer;
  font-weight: var(--font-semibold);
  margin-bottom: 0.5rem;
  color: var(--color-grey-800);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary-500);
  color: var(--color-white-0);
  text-decoration: none;
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  transition: background var(--transition-base);
  cursor: pointer;
  font-size: var(--font-size-md);

  &:hover {
    background: var(--color-primary-600);
  }

  &:last-child {
    background: var(--color-grey-200);
    color: var(--color-grey-800);

    &:hover {
      background: var(--color-grey-300);
    }
  }
`;

const HomeButton = styled(Button)`
  background: var(--color-primary-500);
  color: var(--color-white-0);

  &:hover {
    background: var(--color-primary-600);
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // In production, send to error reporting service (don't log to console)
    if (import.meta.env.PROD) {
      // TODO: Send to error reporting service (e.g., Sentry, LogRocket)
      // Do NOT log to console in production to prevent leaking sensitive data
      // errorReportingService.captureException(error, { extra: errorInfo });
    } else {
      // Only log in development
      console.error('Error caught by boundary:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = PATHS.HOME;
  };

  handleGoHome = () => {
    window.location.href = PATHS.HOME;
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorContent>
            <ErrorIcon>
              <FaExclamationTriangle />
            </ErrorIcon>
            <ErrorTitle>We hit an unexpected error</ErrorTitle>
            <ErrorMessage>
              We’re sorry, but an unexpected error occurred. Our team has been notified and is working on a fix.
            </ErrorMessage>

            {import.meta.env.DEV && this.state.error && (
              <ErrorDetails>
                <ErrorSummary>Error Details (Dev Only)</ErrorSummary>
                <div>
                  <strong>Error:</strong> {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      <br />
                      <br />
                      <strong>Stack Trace:</strong>
                      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </ErrorDetails>
            )}

            <ButtonGroup>
              <HomeButton onClick={this.handleGoHome} type="button">
                <FaHome /> Go Home
              </HomeButton>
              <Button onClick={this.handleReset} type="button">
                <FaRedo /> Try Again
              </Button>
            </ButtonGroup>
          </ErrorContent>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

