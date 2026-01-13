import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

// ============================================================
// 🔐 로그인 페이지
// ============================================================

export default function LoginPage() {
  var authStore = useAuthStore();
  var loginWithGoogle = authStore.loginWithGoogle;
  var isLoading = authStore.isLoading;
  
  var errorState = useState(null);
  var error = errorState[0];
  var setError = errorState[1];
  
  var handleGoogleLogin = function() {
    setError(null);
    loginWithGoogle().catch(function(err) {
      setError(err.message || '로그인에 실패했습니다.');
    });
  };
  
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #F3F0FF 0%, #FAFAFA 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }
  },
    // 펭귄 캐릭터
    React.createElement('div', {
      style: {
        position: 'relative',
        marginBottom: '32px'
      }
    },
      React.createElement('div', {
        style: {
          position: 'absolute',
          inset: '-16px',
          background: 'rgba(169, 150, 255, 0.3)',
          borderRadius: '50%',
          filter: 'blur(20px)',
          animation: 'pulse 2s infinite'
        }
      }),
      React.createElement('div', {
        style: {
          position: 'relative',
          width: '128px',
          height: '128px',
          background: 'linear-gradient(180deg, #A996FF 0%, #7C6BD6 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(169, 150, 255, 0.3)'
        }
      },
        React.createElement('span', { style: { fontSize: '64px' } }, '🐧')
      )
    ),
    
    // 타이틀
    React.createElement('h1', {
      style: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: '8px'
      }
    }, '알프레도'),
    
    React.createElement('p', {
      style: {
        color: '#6B7280',
        marginBottom: '32px',
        textAlign: 'center',
        lineHeight: '1.5'
      }
    }, '당신의 하루를 다정하게 돌봐드리는', React.createElement('br'), 'AI 버틀러 펭귄'),
    
    // 에러 메시지
    error && React.createElement('div', {
      style: {
        marginBottom: '16px',
        padding: '12px 16px',
        backgroundColor: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: '12px',
        color: '#DC2626',
        fontSize: '14px'
      }
    }, error),
    
    // Google 로그인 버튼
    React.createElement('button', {
      onClick: handleGoogleLogin,
      disabled: isLoading,
      style: {
        width: '100%',
        maxWidth: '280px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '14px 24px',
        backgroundColor: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.6 : 1,
        transition: 'all 0.2s ease'
      }
    },
      isLoading
        ? React.createElement(React.Fragment, null,
            React.createElement('div', {
              style: {
                width: '20px',
                height: '20px',
                border: '2px solid #A996FF',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }
            }),
            React.createElement('span', {
              style: { color: '#374151', fontWeight: '500' }
            }, '연결 중...')
          )
        : React.createElement(React.Fragment, null,
            React.createElement('svg', {
              width: '20',
              height: '20',
              viewBox: '0 0 24 24'
            },
              React.createElement('path', {
                fill: '#4285F4',
                d: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              }),
              React.createElement('path', {
                fill: '#34A853',
                d: 'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              }),
              React.createElement('path', {
                fill: '#FBBC05',
                d: 'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              }),
              React.createElement('path', {
                fill: '#EA4335',
                d: 'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              })
            ),
            React.createElement('span', {
              style: { color: '#374151', fontWeight: '500' }
            }, 'Google로 시작하기')
          )
    ),
    
    // 설명
    React.createElement('p', {
      style: {
        marginTop: '24px',
        fontSize: '12px',
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: '1.5'
      }
    }, '로그인 시 Google Calendar와 Gmail에 접근하여', React.createElement('br'), '일정 및 이메일을 관리할 수 있습니다.'),
    
    // 하단 펭귄 애니메이션
    React.createElement('div', {
      style: {
        position: 'absolute',
        bottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#9CA3AF',
        fontSize: '14px'
      }
    },
      React.createElement('span', {
        style: { animation: 'bounce 1s infinite' }
      }, '🐧'),
      React.createElement('span', null, '버틀러 펭귄이 대기 중...')
    )
  );
}
