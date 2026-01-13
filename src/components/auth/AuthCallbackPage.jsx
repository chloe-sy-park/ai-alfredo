import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';

// ============================================================
// 🔐 OAuth 콜백 페이지
// ============================================================

export default function AuthCallbackPage(props) {
  var onSuccess = props.onSuccess;
  var authStore = useAuthStore();
  var handleCallback = authStore.handleCallback;
  
  var statusState = useState('processing');
  var status = statusState[0];
  var setStatus = statusState[1];
  
  useEffect(function() {
    var urlParams = new URLSearchParams(window.location.search);
    var code = urlParams.get('code');
    
    if (code) {
      handleCallback(code).then(function(success) {
        if (success) {
          setStatus('success');
          // URL 정리
          window.history.replaceState({}, document.title, '/');
          setTimeout(function() {
            onSuccess();
          }, 1000);
        } else {
          setStatus('error');
        }
      });
    } else {
      setStatus('error');
    }
  }, []);
  
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FAFAFA'
    }
  },
    React.createElement('div', {
      style: {
        textAlign: 'center'
      }
    },
      React.createElement('span', {
        style: {
          fontSize: '64px',
          display: 'block',
          marginBottom: '24px',
          animation: status === 'processing' ? 'bounce 1s infinite' : 'none'
        }
      }, status === 'success' ? '🎉' : status === 'error' ? '😢' : '🐧'),
      
      React.createElement('p', {
        style: {
          fontSize: '18px',
          color: '#374151',
          fontWeight: '500'
        }
      }, status === 'processing' ? '로그인 처리 중...'
         : status === 'success' ? '로그인 성공!'
         : '로그인에 실패했습니다.')
    )
  );
}
