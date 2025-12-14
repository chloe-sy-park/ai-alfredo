import React, { useState } from 'react';
import { 
  ArrowLeft, Grid, Layout, Clock, Calendar, Target, 
  CheckCircle2, Zap, Heart, TrendingUp
} from 'lucide-react';

const WidgetGallery = ({ onBack, tasks, events, mood, energy, darkMode }) => {
  const [activeTab, setActiveTab] = useState('gallery'); // gallery, editor, myWidgets
  const [selectedWidget, setSelectedWidget] = useState(null); // 풀스크린 미리보기
  
  // 위젯 에디터 상태
  const [widgetConfig, setWidgetConfig] = useState({
    size: 'medium', // mini, small, medium, lockscreen
    showBig3: true,
    showSchedule: true,
    showEnergy: true,
    showMood: true,
    showAlfredo: true,
    theme: 'lavender', // lavender, dark, mint, coral, sunset
    bgStyle: 'gradient', // gradient, solid, glass
  });
  
  // 저장된 위젯 목록
  const [savedWidgets, setSavedWidgets] = useState([
    { id: 1, name: '기본 위젯', config: { size: 'medium', showBig3: true, showSchedule: true, showEnergy: true, showMood: false, showAlfredo: true, theme: 'lavender', bgStyle: 'gradient' } },
  ]);
  
  const hour = new Date().getHours();
  const now = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  
  // Big3 진행률
  const big3Done = tasks.filter(t => t.status === 'done').length;
  const big3Total = tasks.length;
  
  // 다음 일정
  const getNextEvent = () => {
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    
    for (const event of events) {
      if (event.time) {
        const [h, m] = event.time.split(':').map(Number);
        if (h > currentHour || (h === currentHour && m > currentMin)) {
          const diffMin = (h * 60 + m) - (currentHour * 60 + currentMin);
          const hours = Math.floor(diffMin / 60);
          const mins = diffMin % 60;
          return {
            ...event,
            timeLeft: hours > 0 ? `${hours}시간 ${mins}분 후` : `${mins}분 후`,
            isUrgent: diffMin <= 30
          };
        }
      }
    }
    return null;
  };
  
  const nextEvent = getNextEvent();
  
  // 기분 이모지
  const getMoodEmoji = () => {
    if (mood >= 80) return '😊';
    if (mood >= 60) return '🙂';
    if (mood >= 40) return '😐';
    if (mood >= 20) return '😔';
    return '😢';
  };
  
  // 알프레도 한마디
  const getAlfredoComment = () => {
    if (big3Done === big3Total && big3Total > 0) return '오늘 완벽해요! 🎉';
    if (big3Done >= 2) return '좋은 페이스예요! 💪';
    if (energy < 30) return '쉬어가도 괜찮아요 😴';
    if (hour < 12) return '좋은 아침이에요 ☀️';
    if (hour < 17) return '오후도 힘내요! 💪';
    return '마무리 잘 해요 🌙';
  };
  
  // 테마 색상
  const themes = {
    lavender: { 
      primary: '#A996FF', 
      secondary: '#8B7CF7', 
      bg: 'from-[#A996FF] to-[#8B7CF7]',
      name: '라벤더',
      cardBg: 'bg-white',
      textPrimary: 'text-gray-800',
      textSecondary: 'text-gray-500'
    },
    dark: { 
      primary: '#374151', 
      secondary: '#1F2937', 
      bg: 'from-gray-700 to-gray-900',
      name: '다크',
      cardBg: 'bg-gray-800',
      textPrimary: 'text-white',
      textSecondary: 'text-gray-400'
    },
    mint: { 
      primary: '#34D399', 
      secondary: '#10B981', 
      bg: 'from-emerald-400 to-emerald-600',
      name: '민트',
      cardBg: 'bg-white',
      textPrimary: 'text-gray-800',
      textSecondary: 'text-gray-500'
    },
    coral: { 
      primary: '#FB7185', 
      secondary: '#F43F5E', 
      bg: 'from-[#A996FF] to-[#8B7CF7]',
      name: '코랄',
      cardBg: 'bg-white',
      textPrimary: 'text-gray-800',
      textSecondary: 'text-gray-500'
    },
    sunset: { 
      primary: '#F59E0B', 
      secondary: '#EA580C', 
      bg: 'from-[#A996FF] to-[#EDE9FE]0',
      name: '선셋',
      cardBg: 'bg-white',
      textPrimary: 'text-gray-800',
      textSecondary: 'text-gray-500'
    },
  };
  
  const currentTheme = themes[widgetConfig.theme];
  
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // === 커스텀 위젯 렌더러 ===
  const CustomWidget = ({ config, preview = false }) => {
    const theme = themes[config.theme];
    const isLockscreen = config.size === 'lockscreen';
    
    // 배경 스타일
    const getBgClass = () => {
      if (config.bgStyle === 'gradient') {
        return `bg-gradient-to-br ${theme.bg}`;
      } else if (config.bgStyle === 'solid') {
        return theme.cardBg;
      } else { // glass
        return `${theme.cardBg} backdrop-blur-xl bg-opacity-70`;
      }
    };
    
    // 크기별 클래스
    const getSizeClass = () => {
      switch (config.size) {
        case 'mini': return 'w-20 h-20';
        case 'small': return 'w-44 h-20';
        case 'medium': return 'w-44 h-44';
        case 'lockscreen': return preview ? 'w-full h-72' : 'w-full h-screen';
        default: return 'w-44 h-44';
      }
    };
    
    const isGradient = config.bgStyle === 'gradient';
    const txtPrimary = isGradient ? 'text-white' : theme.textPrimary;
    const txtSecondary = isGradient ? 'text-white/70' : theme.textSecondary;
    
    // 미니 위젯
    if (config.size === 'mini') {
      return (
        <div className={`${getSizeClass()} ${getBgClass()} rounded-xl shadow-lg flex flex-col items-center justify-center`}>
          {config.showBig3 && (
            <>
              <span className="text-2xl">🎯</span>
              <p className={`text-sm font-bold ${txtPrimary}`}>{big3Done}/{big3Total}</p>
            </>
          )}
        </div>
      );
    }
    
    // 스몰 위젯
    if (config.size === 'small') {
      return (
        <div className={`${getSizeClass()} ${getBgClass()} rounded-xl shadow-lg flex items-center px-3 gap-3`}>
          {config.showBig3 && (
            <div className="flex flex-col items-center">
              <span className="text-xl">🎯</span>
              <p className={`text-xs font-bold ${txtPrimary}`}>{big3Done}/{big3Total}</p>
            </div>
          )}
          {config.showBig3 && config.showSchedule && (
            <div className={`w-px h-10 ${isGradient ? 'bg-white/30' : 'bg-gray-200'}`} />
          )}
          {config.showSchedule && (
            <div className="flex-1 min-w-0">
              {nextEvent ? (
                <>
                  <p className={`text-[11px] ${txtSecondary} truncate`}>📅 {nextEvent.title}</p>
                  <p className={`text-xs font-medium ${txtPrimary}`}>{nextEvent.timeLeft}</p>
                </>
              ) : (
                <p className={`text-xs ${txtSecondary}`}>일정 없음</p>
              )}
            </div>
          )}
        </div>
      );
    }
    
    // 미디엄 위젯
    if (config.size === 'medium') {
      return (
        <div className={`${getSizeClass()} ${getBgClass()} rounded-xl shadow-lg p-3 flex flex-col`}>
          {/* Big3 */}
          {config.showBig3 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎯</span>
              <div className="flex-1">
                <p className={`text-xs ${txtSecondary}`}>Big3</p>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 h-2 ${isGradient ? 'bg-white/30' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div 
                      className={`h-full ${isGradient ? 'bg-white' : `bg-gradient-to-r ${theme.bg}`} rounded-full`}
                      style={{ width: `${(big3Done / big3Total) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${txtPrimary}`}>{big3Done}/{big3Total}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* 다음 일정 */}
          {config.showSchedule && (
            <div className={`flex-1 ${isGradient ? 'bg-white/10' : (darkMode ? 'bg-gray-700' : 'bg-gray-50')} rounded-xl p-2 mb-2`}>
              {nextEvent ? (
                <>
                  <p className={`text-[11px] ${txtSecondary}`}>📅 다음 일정</p>
                  <p className={`text-xs font-medium ${txtPrimary} truncate`}>{nextEvent.title}</p>
                  <p className={`text-xs ${nextEvent.isUrgent ? 'text-red-400 font-medium' : txtSecondary}`}>
                    {nextEvent.timeLeft}
                  </p>
                </>
              ) : (
                <p className={`text-xs ${txtSecondary} text-center mt-2`}>오늘 남은 일정 없음</p>
              )}
            </div>
          )}
          
          {/* 에너지 & 기분 */}
          {(config.showEnergy || config.showMood) && (
            <div className="flex items-center justify-between">
              {config.showEnergy && (
                <div className="flex items-center gap-1">
                  <Zap size={12} className={isGradient ? 'text-white' : 'text-[#A996FF]'} />
                  <span className={`text-xs ${txtPrimary}`}>{energy}%</span>
                </div>
              )}
              {config.showMood && (
                <div className="flex items-center gap-1">
                  <span>{getMoodEmoji()}</span>
                  <span className={`text-xs ${txtSecondary}`}>기분</span>
                </div>
              )}
            </div>
          )}
          
          {/* 알프레도 */}
          {config.showAlfredo && (
            <div className={`mt-2 pt-2 border-t ${isGradient ? 'border-white/20' : 'border-gray-100'} flex items-center gap-1`}>
              <span className="text-sm">🐧</span>
              <span className={`text-[11px] ${txtSecondary}`}>{getAlfredoComment()}</span>
            </div>
          )}
        </div>
      );
    }
    
    // 잠금화면 위젯
    if (config.size === 'lockscreen') {
      return (
        <div 
          className={`${getSizeClass()} ${getBgClass()} rounded-xl flex flex-col items-center justify-center p-6 shadow-lg`}
          onClick={() => !preview && setSelectedWidget(null)}
        >
          {/* 시간 */}
          <p className={`text-5xl font-light ${txtPrimary} mb-1`}>
            {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}
          </p>
          <p className={`text-base ${txtSecondary} mb-6`}>
            {dayNames[now.getDay()]}요일, {monthNames[now.getMonth()]} {now.getDate()}일
          </p>
          
          {/* 핵심 정보 카드 */}
          <div className={`${isGradient ? 'bg-white/10' : (darkMode ? 'bg-gray-700' : 'bg-gray-100')} backdrop-blur-md rounded-xl p-4 w-full max-w-xs`}>
            {config.showBig3 && (
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <span className={`${txtPrimary} font-medium`}>Big3</span>
                </div>
                <span className={`${txtPrimary} font-bold`}>{big3Done}/{big3Total} 완료</span>
              </div>
            )}
            
            {config.showSchedule && nextEvent && (
              <div className={`flex items-center justify-between mb-3 ${config.showBig3 ? `pt-3 border-t ${isGradient ? 'border-white/20' : 'border-gray-200'}` : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  <span className={`${txtSecondary} text-sm truncate max-w-[120px]`}>{nextEvent.title}</span>
                </div>
                <span className={`text-sm font-medium ${nextEvent.isUrgent ? 'text-red-400' : txtSecondary}`}>
                  {nextEvent.timeLeft}
                </span>
              </div>
            )}
            
            {(config.showEnergy || config.showMood) && (
              <div className={`flex items-center justify-between ${(config.showBig3 || config.showSchedule) ? `pt-3 border-t ${isGradient ? 'border-white/20' : 'border-gray-200'}` : ''}`}>
                <div className="flex items-center gap-3">
                  {config.showEnergy && (
                    <div className="flex items-center gap-1">
                      <Zap size={14} className={isGradient ? 'text-white' : 'text-[#A996FF]'} />
                      <span className={`${txtSecondary} text-sm`}>{energy}%</span>
                    </div>
                  )}
                  {config.showMood && (
                    <div className="flex items-center gap-1">
                      <span>{getMoodEmoji()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* 알프레도 한마디 */}
          {config.showAlfredo && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-2xl">🐧</span>
              <span className={`${txtSecondary} text-sm`}>{getAlfredoComment()}</span>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  // 위젯 저장
  const handleSaveWidget = () => {
    const newWidget = {
      id: Date.now(),
      name: `내 위젯 ${savedWidgets.length + 1}`,
      config: { ...widgetConfig }
    };
    setSavedWidgets([...savedWidgets, newWidget]);
    setActiveTab('myWidgets');
  };
  
  // 위젯 삭제
  const handleDeleteWidget = (id) => {
    setSavedWidgets(savedWidgets.filter(w => w.id !== id));
  };
  
  // 위젯 불러오기
  const handleLoadWidget = (config) => {
    setWidgetConfig(config);
    setActiveTab('editor');
  };
  
  // === 기존 위젯 컴포넌트들 (갤러리용) ===
  const MiniWidget = () => (
    <div className={`w-20 h-20 ${cardBg} rounded-xl shadow-lg flex flex-col items-center justify-center`}>
      <span className="text-2xl">🎯</span>
      <p className={`text-sm font-bold ${textPrimary}`}>{big3Done}/{big3Total}</p>
    </div>
  );
  
  const SmallWidget = () => (
    <div className={`w-44 h-20 ${cardBg} rounded-xl shadow-lg flex items-center px-3 gap-3`}>
      <div className="flex flex-col items-center">
        <span className="text-xl">🎯</span>
        <p className={`text-xs font-bold ${textPrimary}`}>{big3Done}/{big3Total}</p>
      </div>
      <div className="w-px h-10 bg-gray-200" />
      <div className="flex-1 min-w-0">
        {nextEvent ? (
          <>
            <p className={`text-[11px] ${textSecondary} truncate`}>📅 {nextEvent.title}</p>
            <p className={`text-xs font-medium ${textPrimary}`}>{nextEvent.timeLeft}</p>
          </>
        ) : (
          <p className={`text-xs ${textSecondary}`}>일정 없음</p>
        )}
      </div>
    </div>
  );
  
  const MediumWidget = () => (
    <div className={`w-44 h-44 ${cardBg} rounded-xl shadow-lg p-3 flex flex-col`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🎯</span>
        <div className="flex-1">
          <p className={`text-xs ${textSecondary}`}>Big3</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full"
                style={{ width: `${(big3Done / big3Total) * 100}%` }}
              />
            </div>
            <span className={`text-xs font-bold ${textPrimary}`}>{big3Done}/{big3Total}</span>
          </div>
        </div>
      </div>
      <div className={`flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-2 mb-2`}>
        {nextEvent ? (
          <>
            <p className={`text-[11px] ${textSecondary}`}>📅 다음 일정</p>
            <p className={`text-xs font-medium ${textPrimary} truncate`}>{nextEvent.title}</p>
            <p className={`text-xs ${nextEvent.isUrgent ? 'text-red-500 font-medium' : textSecondary}`}>
              {nextEvent.timeLeft}
            </p>
          </>
        ) : (
          <p className={`text-xs ${textSecondary} text-center mt-2`}>오늘 남은 일정 없음</p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Zap size={12} className="text-[#A996FF]" />
          <span className={`text-xs ${textPrimary}`}>{energy}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{getMoodEmoji()}</span>
          <span className={`text-xs ${textSecondary}`}>기분</span>
        </div>
      </div>
    </div>
  );
  
  const WatchWidget = () => (
    <div className="w-12 h-12 bg-black rounded-full flex flex-col items-center justify-center shadow-lg">
      <span className="text-[11px] text-white font-bold">{big3Done}/{big3Total}</span>
      <span className="text-[11px] text-gray-400">🎯</span>
    </div>
  );
  
  const LockScreenWidget = ({ fullscreen = false }) => (
    <div 
      className={`${fullscreen ? 'fixed inset-0 z-50' : 'w-full h-80'} bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-xl flex flex-col items-center justify-center p-6 ${fullscreen ? '' : 'shadow-lg'}`}
      onClick={() => fullscreen && setSelectedWidget(null)}
    >
      <p className="text-6xl font-light text-white mb-1">
        {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}
      </p>
      <p className="text-lg text-gray-400 mb-8">
        {dayNames[now.getDay()]}요일, {monthNames[now.getMonth()]} {now.getDate()}일
      </p>
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 w-full max-w-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="text-white font-medium">Big3</span>
          </div>
          <span className="text-white font-bold">{big3Done}/{big3Total} 완료</span>
        </div>
        {nextEvent && (
          <div className="flex items-center justify-between mb-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <span className="text-white/80 text-sm truncate max-w-[120px]">{nextEvent.title}</span>
            </div>
            <span className={`text-sm font-medium ${nextEvent.isUrgent ? 'text-red-400' : 'text-white/60'}`}>
              {nextEvent.timeLeft}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-white/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Zap size={14} className="text-[#A996FF]" />
              <span className="text-white/80 text-sm">{energy}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{getMoodEmoji()}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <span className="text-2xl">🐧</span>
        <span className="text-white/70 text-sm">{getAlfredoComment()}</span>
      </div>
      {fullscreen && (
        <p className="absolute bottom-8 text-white/40 text-xs">탭하여 닫기</p>
      )}
    </div>
  );
  
  // 토글 컴포넌트
  const Toggle = ({ enabled, onChange, label }) => (
    <button
      onClick={() => onChange(!enabled)}
      className="flex items-center justify-between w-full py-2"
    >
      <span className={`text-sm ${textPrimary}`}>{label}</span>
      <div className={`w-10 h-6 rounded-full transition-all duration-200 ${enabled ? 'bg-[#A996FF]' : 'bg-gray-300'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 mt-1 ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
    </button>
  );
  
  return (
    <div className={`min-h-screen ${bgColor} pb-24`}>
      {/* 헤더 */}
      <div className={`${cardBg} px-4 py-3 flex items-center gap-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <button onClick={onBack} className={textSecondary}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={`text-lg font-bold ${textPrimary}`}>위젯</h1>
      </div>
      
      {/* 탭 */}
      <div className={`${cardBg} px-4 py-2 flex gap-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        {[
          { id: 'gallery', label: '갤러리' },
          { id: 'editor', label: '만들기' },
          { id: 'myWidgets', label: '내 위젯' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#A996FF] text-white'
                : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* 갤러리 탭 */}
      {activeTab === 'gallery' && (
        <div className="p-4 space-y-6">
          <div className={`${cardBg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🐧</span>
              <div>
                <p className={`text-sm ${textPrimary}`}>
                  기본 위젯들을 구경하고, "만들기" 탭에서 나만의 위젯을 만들어보세요!
                </p>
              </div>
            </div>
          </div>
          
          {/* 미니 */}
          <div>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>📱 미니 (1×1)</p>
            <div className="flex gap-3">
              <MiniWidget />
              <div className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-3`}>
                <p className={`text-xs ${textSecondary}`}>가장 작은 위젯</p>
                <p className={`text-xs ${textPrimary} mt-1`}>Big3 진행률만 한눈에</p>
              </div>
            </div>
          </div>
          
          {/* 스몰 */}
          <div>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>📱 스몰 (2×1)</p>
            <SmallWidget />
          </div>
          
          {/* 미디엄 */}
          <div>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>📱 미디엄 (2×2)</p>
            <div className="flex gap-3">
              <MediumWidget />
              <div className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-3`}>
                <p className={`text-xs ${textSecondary}`}>자세한 정보</p>
                <p className={`text-xs ${textPrimary} mt-1`}>Big3 + 일정 + 상태</p>
              </div>
            </div>
          </div>
          
          {/* 워치 */}
          <div>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>⌚ 워치</p>
            <div className="flex gap-3 items-center">
              <WatchWidget />
              <p className={`text-xs ${textSecondary}`}>애플워치용 초소형</p>
            </div>
          </div>
          
          {/* 잠금화면 */}
          <div>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>🔒 잠금화면</p>
            <div onClick={() => setSelectedWidget('lockscreen')} className="cursor-pointer">
              <LockScreenWidget />
            </div>
            <p className={`text-xs ${textSecondary} mt-2 text-center`}>탭하여 풀스크린 미리보기</p>
          </div>
        </div>
      )}
      
      {/* 에디터 탭 */}
      {activeTab === 'editor' && (
        <div className="p-4 space-y-4">
          {/* 실시간 미리보기 */}
          <div className={`${cardBg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>👀 미리보기</p>
            <div className="flex justify-center">
              <CustomWidget config={widgetConfig} preview />
            </div>
          </div>
          
          {/* 크기 선택 */}
          <div className={`${cardBg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>📐 크기</p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'mini', label: '미니' },
                { id: 'small', label: '스몰' },
                { id: 'medium', label: '미디엄' },
                { id: 'lockscreen', label: '잠금화면' },
              ].map(size => (
                <button
                  key={size.id}
                  onClick={() => setWidgetConfig({ ...widgetConfig, size: size.id })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    widgetConfig.size === size.id
                      ? 'bg-[#A996FF] text-white'
                      : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 표시 항목 */}
          <div className={`${cardBg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>📊 표시할 정보</p>
            <div className="space-y-1">
              <Toggle 
                enabled={widgetConfig.showBig3} 
                onChange={(v) => setWidgetConfig({ ...widgetConfig, showBig3: v })}
                label="🎯 Big3 진행률"
              />
              <Toggle 
                enabled={widgetConfig.showSchedule} 
                onChange={(v) => setWidgetConfig({ ...widgetConfig, showSchedule: v })}
                label="📅 다음 일정"
              />
              <Toggle 
                enabled={widgetConfig.showEnergy} 
                onChange={(v) => setWidgetConfig({ ...widgetConfig, showEnergy: v })}
                label="⚡ 에너지"
              />
              <Toggle 
                enabled={widgetConfig.showMood} 
                onChange={(v) => setWidgetConfig({ ...widgetConfig, showMood: v })}
                label="😊 기분"
              />
              <Toggle 
                enabled={widgetConfig.showAlfredo} 
                onChange={(v) => setWidgetConfig({ ...widgetConfig, showAlfredo: v })}
                label="🐧 알프레도 한마디"
              />
            </div>
          </div>
          
          {/* 테마 */}
          <div className={`${cardBg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>🎨 테마</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setWidgetConfig({ ...widgetConfig, theme: key })}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.bg} flex items-center justify-center transition-all ${
                    widgetConfig.theme === key ? 'ring-2 ring-offset-2 ring-[#A996FF]' : ''
                  }`}
                >
                  {widgetConfig.theme === key && <CheckCircle2 size={20} className="text-white" />}
                </button>
              ))}
            </div>
            <p className={`text-xs ${textSecondary} mt-2`}>선택: {themes[widgetConfig.theme].name}</p>
          </div>
          
          {/* 배경 스타일 */}
          <div className={`${cardBg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs font-semibold ${textSecondary} mb-3`}>🖼 배경 스타일</p>
            <div className="flex gap-2">
              {[
                { id: 'gradient', label: '그라데이션' },
                { id: 'solid', label: '단색' },
                { id: 'glass', label: '글래스' },
              ].map(style => (
                <button
                  key={style.id}
                  onClick={() => setWidgetConfig({ ...widgetConfig, bgStyle: style.id })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    widgetConfig.bgStyle === style.id
                      ? 'bg-[#A996FF] text-white'
                      : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 저장 버튼 */}
          <button
            onClick={handleSaveWidget}
            className="w-full py-4 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white font-semibold rounded-xl shadow-lg"
          >
            위젯 저장하기
          </button>
        </div>
      )}
      
      {/* 내 위젯 탭 */}
      {activeTab === 'myWidgets' && (
        <div className="p-4 space-y-4">
          {savedWidgets.length === 0 ? (
            <div className={`${cardBg} rounded-xl p-8 border ${darkMode ? 'border-gray-700' : 'border-gray-100'} text-center`}>
              <span className="text-4xl">📱</span>
              <p className={`${textPrimary} mt-2`}>저장된 위젯이 없어요</p>
              <p className={`text-sm ${textSecondary} mt-1`}>"만들기" 탭에서 위젯을 만들어보세요!</p>
            </div>
          ) : (
            savedWidgets.map(widget => (
              <div 
                key={widget.id}
                className={`${cardBg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className={`font-medium ${textPrimary}`}>{widget.name}</p>
                    <p className={`text-xs ${textSecondary}`}>
                      {widget.config.size} · {themes[widget.config.theme].name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadWidget(widget.config)}
                      className="px-3 py-1 bg-[#A996FF] text-white text-xs rounded-lg"
                    >
                      편집
                    </button>
                    <button
                      onClick={() => handleDeleteWidget(widget.id)}
                      className={`px-3 py-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary} text-xs rounded-lg`}
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="flex justify-center">
                  <CustomWidget config={widget.config} preview />
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* 풀스크린 미리보기 */}
      {selectedWidget === 'lockscreen' && (
        <LockScreenWidget fullscreen />
      )}
    </div>
  );
};

// === Settings Page ===

export default WidgetGallery;
