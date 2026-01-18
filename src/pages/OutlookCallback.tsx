import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { handleOutlookCallback } from '../services/auth';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function OutlookCallback() {
  var [searchParams] = useSearchParams();
  var [error, setError] = useState('');
  var [status, setStatus] = useState('processing');

  useEffect(function handleCallback() {
    var code = searchParams.get('code');
    var errorParam = searchParams.get('error');

    // Handle error from Microsoft
    if (errorParam) {
      setError('Microsoft 로그인이 취소되었습니다.');
      setStatus('error');
      setTimeout(function() { window.location.href = '/settings'; }, 2000);
      return;
    }

    // No code - invalid callback
    if (!code) {
      setError('인증 코드가 없습니다.');
      setStatus('error');
      setTimeout(function() { window.location.href = '/settings'; }, 2000);
      return;
    }

    // Exchange code for tokens
    setStatus('exchanging');

    handleOutlookCallback(code)
      .then(function(result) {
        console.log('Outlook auth success:', result.user.email);
        setStatus('success');

        // Redirect to home after success - use window.location for full page reload
        setTimeout(function() { window.location.href = '/'; }, 1500);
      })
      .catch(function(err) {
        console.error('Outlook auth failed:', err);
        setError(err.message || '인증에 실패했습니다.');
        setStatus('error');

        setTimeout(function() { window.location.href = '/settings'; }, 3000);
      });
  }, [searchParams]);

  function getStatusMessage() {
    switch (status) {
      case 'processing':
        return '인증 처리 중...';
      case 'exchanging':
        return 'Outlook 캘린더 연결 중...';
      case 'success':
        return '연결 완료! 🎉';
      case 'error':
        return error || '오류가 발생했습니다';
      default:
        return '처리 중...';
    }
  }

  return (
    <div className="min-h-screen bg-lavender-50 flex flex-col items-center justify-center p-4">
      {status === 'error' ? (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">😢</span>
          </div>
          <p className="text-red-600 font-medium">{getStatusMessage()}</p>
          <p className="text-sm text-gray-500 mt-2">설정으로 돌아갑니다...</p>
        </div>
      ) : status === 'success' ? (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
            <img
              src="/assets/alfredo/avatar/alfredo-avatar-64.png"
              alt="알프레도"
              className="w-12 h-12 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-2xl">🎩</span>'; }}
            />
          </div>
          <p className="text-green-600 font-medium">{getStatusMessage()}</p>
          <p className="text-sm text-gray-500 mt-2">홈으로 이동합니다...</p>
        </div>
      ) : (
        <LoadingSpinner size="lg" message={getStatusMessage()} />
      )}
    </div>
  );
}
