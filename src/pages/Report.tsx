// Report.tsx - Weekly Report 페이지
import React, { useState } from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WeeklyReport from '../components/report/WeeklyReport';
import MonthlyReport from '../components/report/MonthlyReport';
import { useLiftStore } from '../stores/liftStore';
import { useAlfredoStore } from '../stores/alfredoStore';
import { ShareModal, WrappedCardData } from '../components/share';

const Report: React.FC = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [showShareModal, setShowShareModal] = useState(false);
  const { getWeeklyLifts, getMonthlyLifts } = useLiftStore();
  const { understanding } = useAlfredoStore();
  
  // 현재 주 날짜 범위
  const getCurrentWeekRange = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return {
      start: weekStart.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
      end: weekEnd.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
    };
  };
  
  const weekRange = getCurrentWeekRange();

  // 공유용 데이터 생성
  const getWrappedData = (): WrappedCardData => {
    const lifts = getWeeklyLifts();
    return {
      period: `${weekRange.start} - ${weekRange.end}`,
      totalLifts: lifts.length,
      appliedLifts: lifts.filter(l => l.type === 'apply').length,
      workLifeRatio: { work: 65, life: 35 }, // 실제로는 활동 데이터에서 계산
      topDecision: '미팅 대신 개인 시간을 선택',
      bestDay: '화요일 오후',
      insight: '중요한 순간에 삶을 선택했고, 그 선택은 옳았어요.',
      understandingLevel: understanding?.understandingScore || 50,
      understandingTitle: understanding?.title || '성장하는 알프레도',
    };
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">리포트</h1>
              <p className="text-xs text-gray-500">
                {reportType === 'weekly' 
                  ? `${weekRange.start} - ${weekRange.end}`
                  : new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
                }
              </p>
            </div>
          </div>
          
          {/* 공유 버튼 & Report Type Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="공유하기"
            >
              <Share2 className="w-5 h-5 text-[#A996FF]" />
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setReportType('weekly')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  reportType === 'weekly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                주간
              </button>
              <button
                onClick={() => setReportType('monthly')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  reportType === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                월간
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {reportType === 'weekly' ? (
          <WeeklyReport lifts={getWeeklyLifts()} />
        ) : (
          <MonthlyReport lifts={getMonthlyLifts()} />
        )}
      </div>

      {/* 공유 모달 */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        data={getWrappedData()}
      />
    </div>
  );
};

export default Report;