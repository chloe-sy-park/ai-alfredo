import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2 } from 'lucide-react';
import WeeklyReport from '../components/report/WeeklyReport';

export default function Report() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month

  return (
    <div className="relative min-h-screen bg-primary-bg dark:bg-primary-surface">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-primary-bg dark:bg-primary-surface">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
          >
            <ChevronLeft size={24} />
            <span>뒤로</span>
          </button>
          
          <h1 className="font-bold text-lg">리포트</h1>
          
          <button className="text-gray-600 dark:text-gray-400">
            <Share2 size={20} />
          </button>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2 p-4">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedPeriod === 'week'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedPeriod === 'month'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            월간
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-20">
        {selectedPeriod === 'week' ? (
          <WeeklyReport />
        ) : (
          <MonthlyReport />
        )}
      </div>
    </div>
  );
}

// Monthly Report Component (placeholder)
function MonthlyReport() {
  return (
    <div className="py-8">
      <p className="text-center text-gray-500">월간 리포트 준비 중...</p>
    </div>
  );
}