import React, { useState, useEffect } from 'react';
import { X, Star, Award, Flame, Sparkles } from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';
import { LEVEL_CONFIG, BADGES } from '../../constants/gamification';

const ConfettiEffect = ({ isActive, intensity = 'normal' }) => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }
    
    const count = intensity === 'high' ? 60 : intensity === 'low' ? 20 : 40;
    const colors = ['#A996FF', '#8B7CF7', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      type: Math.random() > 0.5 ? 'circle' : 'rect',
    }));
    
    setParticles(newParticles);
    
    const timer = setTimeout(() => setParticles([]), 3000);
    return () => clearTimeout(timer);
  }, [isActive, intensity]);
  
  if (particles.length === 0) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            animationDelay: `${p.delay}s`,
            '--confetti-color': p.color,
          }}
        >
          {p.type === 'circle' ? (
            <div 
              className="rounded-full"
              style={{ 
                width: p.size, 
                height: p.size, 
                backgroundColor: p.color,
                transform: `rotate(${p.rotation}deg)`,
              }} 
            />
          ) : (
            <div 
              style={{ 
                width: p.size, 
                height: p.size * 0.6, 
                backgroundColor: p.color,
                transform: `rotate(${p.rotation}deg)`,
              }} 
            />
          )}
        </div>
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti-fall 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// XP 획득 플로팅 표시
const XPFloater = ({ xp, isVisible, position = 'center' }) => {
  if (!isVisible || !xp) return null;
  
  const positionClass = {
    center: 'left-1/2 -translate-x-1/2 top-1/3',
    top: 'left-1/2 -translate-x-1/2 top-20',
    bottom: 'left-1/2 -translate-x-1/2 bottom-40',
  }[position] || 'left-1/2 -translate-x-1/2 top-1/3';
  
  return (
    <div className={`fixed ${positionClass} z-[90] pointer-events-none`}>
      <div className="animate-xp-float">
        <div className="bg-gradient-to-r from-[#A996FF] to-[#FFD700] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-2xl font-black">+{xp} XP</span>
        </div>
      </div>
      <style>{`
        @keyframes xp-float {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          20% { transform: translateY(-20px) scale(1.2); opacity: 1; }
          40% { transform: translateY(-40px) scale(1); opacity: 1; }
          100% { transform: translateY(-100px) scale(0.8); opacity: 0; }
        }
        .animate-xp-float {
          animation: xp-float 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// 스트릭 카운터 애니메이션
const StreakBurst = ({ streak, isVisible }) => {
  if (!isVisible || streak < 2) return null;
  
  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-1/4 z-[90] pointer-events-none">
      <div className="animate-streak-burst">
        <div className="relative">
          {/* 불꽃 이펙트 */}
          <div className="absolute inset-0 animate-ping">
            <div className="w-24 h-24 bg-orange-400/30 rounded-full" />
          </div>
          
          {/* 메인 배지 */}
          <div className="relative bg-gradient-to-br from-orange-400 to-red-500 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-2xl shadow-orange-500/50">
            <span className="text-3xl">🔥</span>
            <span className="text-white font-black text-xl">{streak}연속!</span>
          </div>
          
          {/* 파티클 */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-particle"
              style={{
                left: '50%',
                top: '50%',
                '--angle': `${i * 45}deg`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes streak-burst {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(5deg); opacity: 1; }
          70% { transform: scale(0.9) rotate(-2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes particle {
          0% { transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) rotate(var(--angle)) translateX(60px); opacity: 0; }
        }
        .animate-streak-burst {
          animation: streak-burst 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        .animate-particle {
          animation: particle 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// 레벨업 축하 모달 (강화)
const LevelUpCelebration = ({ isOpen, level, onClose }) => {
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowContent(true), 300);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const levelTitles = {
    1: '새싹 집사',
    2: '견습 집사', 
    3: '정식 집사',
    4: '숙련 집사',
    5: '전문 집사',
    6: '수석 집사',
    7: '마스터 집사',
    8: '그랜드 집사',
    9: '레전드 집사',
    10: '알프레도의 동료',
  };
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <ConfettiEffect isActive={isOpen} intensity="high" />
      
      <div className={`transform transition-all duration-500 ${showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
        <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl relative overflow-hidden">
          {/* 배경 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#A996FF]/20 to-transparent" />
          
          {/* 빛나는 효과 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#A996FF]/30 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative">
            {/* 레벨 배지 */}
            <div className="w-28 h-28 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-full animate-pulse" />
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-black text-[#A996FF]">{level}</p>
                  <p className="text-[10px] text-gray-500 font-medium">LEVEL</p>
                </div>
              </div>
            </div>
            
            {/* 텍스트 */}
            <h2 className="text-2xl font-black text-gray-800 mb-2">🎉 레벨 업!</h2>
            <p className="text-lg font-bold text-[#A996FF] mb-1">{levelTitles[level] || `레벨 ${level}`}</p>
            <p className="text-sm text-gray-500 mb-6">축하해요! 꾸준히 성장하고 있어요!</p>
            
            {/* 알프레도 메시지 */}
            <div className="bg-[#F5F3FF] rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🐧</span>
                <span className="font-semibold text-gray-700">알프레도</span>
              </div>
              <p className="text-sm text-gray-600">
                {level >= 5 
                  ? "정말 대단해요, Boss! 이제 저도 많이 배우고 있어요!"
                  : "멋져요! 이 기세로 계속 가요!"}
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl font-bold text-lg shadow-lg shadow-[#A996FF]/30 hover:opacity-90 transition-all"
            >
              계속하기 ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 완료 축하 통합 컴포넌트
const CompletionCelebration = ({ 
  type, // 'task', 'big3', 'all', 'streak', 'levelup'
  data, // { xp, streak, level, taskTitle, completedCount, totalCount }
  isVisible,
  onClose 
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  
  useEffect(() => {
    if (!isVisible) {
      setShowConfetti(false);
      setShowXP(false);
      setShowStreak(false);
      return;
    }
    
    // XP 표시
    if (data?.xp) {
      setShowXP(true);
      setTimeout(() => setShowXP(false), 2000);
    }
    
    // 스트릭 표시 (3연속 이상)
    if (data?.streak >= 3) {
      setTimeout(() => setShowStreak(true), 300);
      setTimeout(() => setShowStreak(false), 2500);
    }
    
    // Confetti (특별한 경우)
    if (type === 'all' || type === 'big3' || type === 'levelup' || data?.streak >= 5) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    
    // 자동 닫기
    const timer = setTimeout(() => {
      onClose?.();
    }, type === 'levelup' ? 5000 : 3000);
    
    return () => clearTimeout(timer);
  }, [isVisible, type, data]);
  
  if (!isVisible) return null;
  
  const confettiIntensity = type === 'all' || type === 'levelup' ? 'high' : 'normal';
  
  return (
    <>
      <ConfettiEffect isActive={showConfetti} intensity={confettiIntensity} />
      <XPFloater xp={data?.xp} isVisible={showXP} />
      <StreakBurst streak={data?.streak} isVisible={showStreak} />
    </>
  );
};

// === Phase 5: AlfredoContextActions ===

export { ConfettiEffect, XPFloater, StreakBurst, LevelUpCelebration, CompletionCelebration };
