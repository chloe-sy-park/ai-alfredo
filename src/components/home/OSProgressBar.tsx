import { useNavigate } from 'react-router-dom';
import { ChevronRight, BarChart3 } from 'lucide-react';

interface OSProgressBarProps {
  workPercent: number;
  lifePercent: number;
  workCount?: number;
  lifeCount?: number;
}

/**
 * Work/Life OS 진행률 바
 * 한 줄로 표시: 📊 Work 67% · Life 33% [상세보기 →]
 */
export default function OSProgressBar({
  workPercent,
  lifePercent,
  workCount = 0,
  lifeCount = 0
}: OSProgressBarProps) {
  const navigate = useNavigate();

  // 비율 보정 (합이 100%가 되도록)
  const total = workPercent + lifePercent;
  const normalizedWork = total > 0 ? Math.round((workPercent / total) * 100) : 50;
  const normalizedLife = total > 0 ? Math.round((lifePercent / total) * 100) : 50;

  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-card">
      <div className="flex items-center gap-3">
        {/* 아이콘 */}
        <BarChart3 size={18} className="text-[#A996FF] flex-shrink-0" />

        {/* 메인 컨텐츠 */}
        <div className="flex-1 min-w-0">
          {/* 퍼센트 표시 */}
          <div className="flex items-center gap-2 text-sm mb-1.5">
            <span className="text-[#3B82F6] font-medium">
              Work {normalizedWork}%
            </span>
            <span className="text-[#CCCCCC]">·</span>
            <span className="text-[#10B981] font-medium">
              Life {normalizedLife}%
            </span>
            {(workCount > 0 || lifeCount > 0) && (
              <span className="text-xs text-[#999999] ml-auto hidden sm:inline">
                {workCount + lifeCount}개 항목
              </span>
            )}
          </div>

          {/* 진행률 바 */}
          <div className="flex h-2 rounded-full overflow-hidden bg-[#F5F5F5]">
            <div
              className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] transition-all duration-300"
              style={{ width: `${normalizedWork}%` }}
            />
            <div
              className="bg-gradient-to-r from-[#10B981] to-[#34D399] transition-all duration-300"
              style={{ width: `${normalizedLife}%` }}
            />
          </div>
        </div>

        {/* 상세보기 버튼들 */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => navigate('/work')}
            className="p-1.5 hover:bg-[#F5F5F5] rounded-lg transition-colors text-[#666666] hover:text-[#3B82F6]"
            title="Work OS"
          >
            <span className="text-xs font-medium">W</span>
          </button>
          <button
            onClick={() => navigate('/life')}
            className="p-1.5 hover:bg-[#F5F5F5] rounded-lg transition-colors text-[#666666] hover:text-[#10B981]"
            title="Life OS"
          >
            <span className="text-xs font-medium">L</span>
          </button>
          <ChevronRight size={14} className="text-[#CCCCCC]" />
        </div>
      </div>
    </div>
  );
}
