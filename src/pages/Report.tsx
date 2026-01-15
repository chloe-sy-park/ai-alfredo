// Report.tsx - Weekly Report 페이지
import React, { useState } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WeeklyReport from '../components/report/WeeklyReport';
import MonthlyReport from '../components/report/MonthlyReport';
import { useLiftStore } from '../stores/liftStore';

const Report: React.FC = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const { getWeeklyLifts, getMonthlyLifts } = useLiftStore();
  
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
          
          {/* Report Type Toggle */}
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
      </header>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {reportType === 'weekly' ? (
          <WeeklyReport lifts={getWeeklyLifts()} />
        ) : (
          <MonthlyReport lifts={getMonthlyLifts()} />
        )}
      </div>
    </div>
  );
};

export default Report;