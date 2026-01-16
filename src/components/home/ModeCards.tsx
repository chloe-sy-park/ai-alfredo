import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface ModeCardsProps {
  workCount: number;
  lifeCount: number;
  workStatus?: string;
  lifeStatus?: string;
}

export default function ModeCards({
  workCount,
  lifeCount,
  workStatus = '',
  lifeStatus = ''
}: ModeCardsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Work OS */}
      <button
        onClick={() => navigate('/work')}
        className="bg-white rounded-xl p-4 text-left shadow-card hover:shadow-card-hover active:shadow-sm transition-all duration-fast group"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-[#1A1A1A]">Work OS</h3>
            <p className="text-xs text-[#666666]">미완료 {workCount}개</p>
            <p className="text-xs text-[#999999]">{workStatus}</p>
          </div>
          <ChevronRight size={16} className="text-[#CCCCCC] mt-1 transition-transform duration-fast group-hover:translate-x-1" />
        </div>
      </button>

      {/* Life OS */}
      <button
        onClick={() => navigate('/life')}
        className="bg-white rounded-xl p-4 text-left shadow-card hover:shadow-card-hover active:shadow-sm transition-all duration-fast group"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-[#1A1A1A]">Life OS</h3>
            <p className="text-xs text-[#666666]">상태 {lifeCount}%</p>
            <p className="text-xs text-[#999999]">{lifeStatus}</p>
          </div>
          <ChevronRight size={16} className="text-[#CCCCCC] mt-1 transition-transform duration-fast group-hover:translate-x-1" />
        </div>
      </button>
    </div>
  );
}