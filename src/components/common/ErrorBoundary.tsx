/**
 * ErrorBoundary - React 에러 바운더리
 *
 * 하위 컴포넌트에서 발생한 JavaScript 에러를 캐치하고
 * 앱 전체가 크래시되는 것을 방지
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallbackUI from './ErrorFallbackUI';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 에러 발생 시 폴백 UI를 보여주도록 상태 업데이트
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 에러 정보 저장
    this.setState({ errorInfo });

    // 에러 로깅
    console.error('[ErrorBoundary] 에러 발생:', error);
    console.error('[ErrorBoundary] 컴포넌트 스택:', errorInfo.componentStack);

    // 외부 에러 핸들러 호출 (예: Sentry)
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 커스텀 폴백이 제공되면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 폴백 UI
      return (
        <ErrorFallbackUI
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
