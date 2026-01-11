import React, { useState } from 'react';
import { Flame, Eye, EyeOff, Snowflake, Shield, Settings } from 'lucide-react';
import { useForgivingStore } from '../../stores/forgivingStore';
import { usePersonalityStore } from '../../stores/personalityStore';

/**
 * 🔥 Streak Display - Headspace/Duolingo 스타일
 * 스트릭 표시 + 숨기기 토글 + 프리즈 시스템
 * "The benefit of meditation does not come from a number on the screen"
 */

const StreakDisplay = ({ compact = false }) => {
  const { 
    streak, 
    toggleHideStreak, 
    useStreakFreeze, 
    checkStreakStatus,
    getEncouragement 
  } = useForgivingStore();
  const { getResponse } = usePersonalityStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);

  const status = checkStreakStatus();

  // 스트릭 숨기기 모드
  if (streak.hideStreak && !showSettings) {
    return (
      <button
        onClick={() => setShowSettings(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl text-gray-500 text-sm hover:bg-gray-200 transition-colors"
      >
        <EyeOff className="w-4 h-4" />
        <span>스트릭 숨김</span>
      </button>
    );
  }

  // 컴팩트 모드
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
          status.isActive ? 'bg-orange-100' : 'bg-gray-100'
        }`}>
          <Flame className={`w-4 h-4 ${
            status.isActive ? 'text-orange-500' : 'text-gray-400'
          }`} />
          <span className={`font-bold ${
            status.isActive ? 'text-orange-600' : 'text-gray-500'
          }`}>
            {streak.currentStreak}
          </span>
        </div>
        
        {streak.streakFreezes > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full">
            <Snowflake className="w-3 h-3 text-blue-500" />
            <span className="text-xs font-medium text-blue-600">{streak.streakFreezes}</span>
          </div>
        )}
      </div>
    );
  }

  // 풀 모드
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* 메인 스트릭 표시 */}
      <div className={`p-4 ${
        status.isActive 
          ? 'bg-gradient-to-r from-orange-400 to-red-400' 
          : 'bg-gradient-to-r from-gray-300 to-gray-400'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              status.isActive ? 'bg-white/20' : 'bg-white/10'
            }`}>
              <Flame className={`w-6 h-6 ${
                status.isActive ? 'text-white' : 'text-gray-200'
              }`} />
            </div>
            <div className="text-white">
              <p className="text-3xl font-bold">{streak.currentStreak}일</p>
              <p className="text-sm text-white/80">연속 스트릭</p>
            </div>
          </div>
          
          {/* 설정 버튼 */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* 상태 메시지 */}
        <p className="mt-3 text-sm text-white/90">
          {status.encouragement}
        </p>
      </div>

      {/* 추가 정보 */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          {/* 최장 스트릭 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">최장 스트릭:</span>
            <span className="font-bold text-gray-700">{streak.longestStreak}일</span>
          </div>
          
          {/* 프리즈 */}
          <div className="flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-500">프리즈:</span>
            <span className="font-bold text-blue-600">{streak.streakFreezes}개</span>
          </div>
        </div>

        {/* 스트릭 위험 경고 + 프리즈 제안 */}
        {status.needsFreeze && status.daysGap > 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700">
                  스트릭이 위험해요!
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  프리즈를 사용해서 스트릭을 지킬까요?
                </p>
                <button
                  onClick={() => setShowFreezeModal(true)}
                  className="mt-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                >
                  <Snowflake className="w-3 h-3 inline mr-1" />
                  프리즈 사용하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 설정 패널 */}
        {showSettings && (
          <div className="border-t border-gray-200 pt-3 mt-3 space-y-3">
            {/* 스트릭 숨기기 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {streak.hideStreak ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-600" />
                )}
                <span className="text-sm text-gray-700">스트릭 표시</span>
              </div>
              <button
                onClick={toggleHideStreak}
                className={`w-12 h-6 rounded-full transition-colors ${
                  streak.hideStreak ? 'bg-gray-300' : 'bg-purple-500'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  streak.hideStreak ? 'translate-x-0.5' : 'translate-x-6'
                }`} />
              </button>
            </div>

            {/* 설명 */}
            <p className="text-xs text-gray-500">
              💡 스트릭이 부담스러우면 숨겨도 괜찮아요. 
              알프레도는 숫자가 아니라 Boss의 성장을 응원해요!
            </p>
          </div>
        )}
      </div>

      {/* 프리즈 사용 모달 */}
      {showFreezeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Snowflake className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">스트릭 프리즈</h3>
              <p className="text-sm text-gray-500 mt-1">
                프리즈를 사용하면 오늘 하루 쉬어도
                스트릭이 유지돼요!
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">남은 프리즈</span>
                <span className="font-bold text-blue-700">{streak.streakFreezes}개</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFreezeModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => {
                  useStreakFreeze();
                  setShowFreezeModal(false);
                }}
                disabled={streak.streakFreezes <= 0}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                사용하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;
