import React, { useEffect } from 'react';
import { Sparkles, Coins } from 'lucide-react';
import { usePenguinStore } from '../../stores/penguinStore';
import { COLORS } from '../../constants/colors';

// ============================================================
// 🐧 펭귄 상태바 컴포넌트
// ============================================================

export default function PenguinStatusBar() {
  var penguinStore = usePenguinStore();
  var status = penguinStore.status;
  var fetchStatus = penguinStore.fetchStatus;
  
  useEffect(function() {
    fetchStatus();
  }, []);
  
  if (!status) {
    return React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: 'rgba(169, 150, 255, 0.1)',
        borderRadius: '20px'
      }
    },
      React.createElement('span', { style: { fontSize: '16px' } }, '🐧'),
      React.createElement('span', {
        style: { fontSize: '12px', color: '#8E8E93' }
      }, 'Lv.1')
    );
  }
  
  var xpPercent = Math.round((status.current_xp / status.xp_for_next_level) * 100);
  
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '6px 14px',
      backgroundColor: 'rgba(169, 150, 255, 0.1)',
      borderRadius: '20px',
      border: '1px solid rgba(169, 150, 255, 0.2)'
    }
  },
    // 펭귄 아이콘 + 레벨
    React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }
    },
      React.createElement('span', { style: { fontSize: '18px' } }, '🐧'),
      React.createElement('span', {
        style: {
          fontSize: '12px',
          fontWeight: '600',
          color: COLORS.primary
        }
      }, 'Lv.' + status.level)
    ),
    
    // XP 바
    React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    },
      React.createElement(Sparkles, {
        size: 12,
        color: '#FFB800'
      }),
      React.createElement('div', {
        style: {
          width: '40px',
          height: '4px',
          backgroundColor: 'rgba(169, 150, 255, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden'
        }
      },
        React.createElement('div', {
          style: {
            width: xpPercent + '%',
            height: '100%',
            backgroundColor: COLORS.primary,
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }
        })
      ),
      React.createElement('span', {
        style: {
          fontSize: '10px',
          color: '#8E8E93'
        }
      }, xpPercent + '%')
    ),
    
    // 코인
    React.createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }
    },
      React.createElement(Coins, {
        size: 12,
        color: '#FFB800'
      }),
      React.createElement('span', {
        style: {
          fontSize: '12px',
          fontWeight: '500',
          color: '#1F2937'
        }
      }, status.coins)
    )
  );
}
