// Settings.tsx - 설정 페이지
import React, { useState } from 'react';
import { ArrowLeft, Users, Volume2, Palette, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserPreferencesStore } from '../stores/userPreferencesStore';
import { useAuthStore } from '../stores/authStore';
import { useLiftStore } from '../stores/liftStore';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { roleBlend, interventionLevel, updatePreferences } = useUserPreferencesStore();
  const { signOut } = useAuthStore();
  const { addLift } = useLiftStore();
  
  const [currentRoleBlend, setCurrentRoleBlend] = useState(roleBlend);
  const [currentInterventionLevel, setCurrentInterventionLevel] = useState(interventionLevel);
  const [selectedTone, setSelectedTone] = useState('formal');
  
  // 역할 블렌드 라벨
  const getRoleBlendLabel = (value: number) => {
    if (value <= 30) return '의사';
    if (value <= 70) return '균형';
    return '집사';
  };
  
  // 개입 수준 라벨
  const getInterventionLabel = (value: number) => {
    if (value <= 30) return '매우 적게';
    if (value <= 50) return '적게';
    if (value <= 70) return '보통';
    if (value <= 90) return '많이';
    return '매우 많이';
  };
  
  // 설정 저장
  const handleSaveSettings = () => {
    updatePreferences({
      roleBlend: currentRoleBlend,
      interventionLevel: currentInterventionLevel,
      tone: selectedTone
    });
    alert('설정이 저장되었습니다!');
  };
  
  // 로그아웃
  const handleLogout = () => {
    if (window.confirm('정말 로그아웃 하시겠습니까?')) {
      signOut();
      navigate('/login');
    }
  };
  
  // 샘플 Lift 데이터 생성 (개발용)
  const generateSampleLifts = () => {
    const sampleLifts = [
      {
        type: 'apply' as const,
        category: 'priority' as const,
        previousDecision: '이메일 작성',
        newDecision: '운동',
        reason: '컨디션이 좋지 않아서 체력 관리 우선',
        impact: 'high' as const
      },
      {
        type: 'maintain' as const,
        category: 'schedule' as const,
        previousDecision: '미팅 참석',
        newDecision: '미팅 참석',
        reason: '중요한 미팅이라 예정대로 진행',
        impact: 'medium' as const
      },
      {
        type: 'consider' as const,
        category: 'worklife' as const,
        previousDecision: '야근',
        newDecision: '취미 활동',
        reason: '주방마다 야근하면 번아웃 위험',
        impact: 'high' as const
      }
    ];
    
    // 랜덤 시간으로 분산해서 추가
    const now = new Date();
    sampleLifts.forEach((lift, index) => {
      const randomHour = Math.floor(Math.random() * 24);
      const randomDay = Math.floor(Math.random() * 7);
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - randomDay);
      timestamp.setHours(randomHour, Math.floor(Math.random() * 60));
      
      setTimeout(() => {
        addLift(lift);
      }, index * 100);
    });
    
    alert('샘플 Lift 데이터가 생성되었습니다!');
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">설정</h1>
      </header>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Role Blend Section */}
        <section className="bg-white rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-[#A996FF]" />
            <h2 className="text-base font-semibold">알프레도의 역할</h2>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">현재: {getRoleBlendLabel(currentRoleBlend)}</span>
              <span className="text-[#A996FF] font-medium">{currentRoleBlend}%</span>
            </div>
            
            <input
              type="range"
              min="0"
              max="100"
              value={currentRoleBlend}
              onChange={(e) => setCurrentRoleBlend(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #A996FF 0%, #A996FF ${currentRoleBlend}%, #E5E7EB ${currentRoleBlend}%, #E5E7EB 100%)`
              }}
            />
            
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>의사</span>
              <span>집사</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            {currentRoleBlend <= 30 && '자세한 분석과 논리적인 판단을 제공합니다.'}
            {currentRoleBlend > 30 && currentRoleBlend <= 70 && '분석과 실행 지원을 균형있게 제공합니다.'}
            {currentRoleBlend > 70 && '빠른 실행과 효율적인 관리에 집중합니다.'}
          </p>
        </section>
        
        {/* Intervention Level Section */}
        <section className="bg-white rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="w-5 h-5 text-[#A996FF]" />
            <h2 className="text-base font-semibold">개입 수준</h2>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">현재: {getInterventionLabel(currentInterventionLevel)}</span>
              <span className="text-[#A996FF] font-medium">{currentInterventionLevel}%</span>
            </div>
            
            <input
              type="range"
              min="0"
              max="100"
              value={currentInterventionLevel}
              onChange={(e) => setCurrentInterventionLevel(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #A996FF 0%, #A996FF ${currentInterventionLevel}%, #E5E7EB ${currentInterventionLevel}%, #E5E7EB 100%)`
              }}
            />
            
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>적게</span>
              <span>많이</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            {currentInterventionLevel <= 30 && '필요할 때만 조심스럽게 개입합니다.'}
            {currentInterventionLevel > 30 && currentInterventionLevel <= 70 && '중요한 순간에 적절히 개입합니다.'}
            {currentInterventionLevel > 70 && '적극적으로 도움을 제공합니다.'}
          </p>
        </section>
        
        {/* Tone Section */}
        <section className="bg-white rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-[#A996FF]" />
            <h2 className="text-base font-semibold">대화 톤</h2>
          </div>
          
          <div className="space-y-2">
            {[
              { value: 'casual', label: '친근함', desc: '친구처럼 편하게' },
              { value: 'formal', label: '정중함', desc: '전문가답게 신중하게' },
              { value: 'motivating', label: '격려', desc: '긍정적이고 응원하는' },
              { value: 'analytical', label: '분석적', desc: '논리적이고 체계적인' }
            ].map(tone => (
              <label
                key={tone.value}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedTone === tone.value ? 'bg-[#A996FF]/10' : 'hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="tone"
                  value={tone.value}
                  checked={selectedTone === tone.value}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{tone.label}</div>
                  <div className="text-xs text-gray-600">{tone.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </section>
        
        {/* Save Button */}
        <button
          onClick={handleSaveSettings}
          className="w-full bg-[#A996FF] text-white py-3 rounded-xl font-medium hover:bg-[#9080E6] transition-colors"
        >
          설정 저장
        </button>
        
        {/* Development Tools */}
        <section className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
          <h3 className="text-sm font-semibold text-yellow-800 mb-3">개발자 도구</h3>
          <button
            onClick={generateSampleLifts}
            className="w-full bg-yellow-600 text-white py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors text-sm"
          >
            샘플 Lift 데이터 생성
          </button>
          <p className="text-xs text-yellow-700 mt-2">
            Report 테스트를 위한 샘플 데이터를 생성합니다.
          </p>
        </section>
        
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-red-600 py-3 font-medium"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </div>
      
      <style>
        {`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            background: #A996FF;
            border-radius: 50%;
            cursor: pointer;
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #A996FF;
            border-radius: 50%;
            cursor: pointer;
            border: none;
          }
        `}
      </style>
    </div>
  );
};

export default Settings;