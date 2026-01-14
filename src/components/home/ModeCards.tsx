import { useNavigate } from 'react-router-dom';
import { Briefcase, Heart, ChevronRight } from 'lucide-react';

interface ModeCardsProps {
  workCount?: number;
  lifeCount?: number;
  workStatus?: string;
  lifeStatus?: string;
}

export default function ModeCards({ 
  workCount = 0, 
  lifeCount = 0,
  workStatus = '오늘 업무',
  lifeStatus = '웰빙 상태'
}: ModeCardsProps) {
  var navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Work Mode Card */}
      <button
        onClick={function() { navigate('/work'); }}
        className="bg-white rounded-2xl p-4 text-left border border-[#E5E5E5] hover:border-[#A996FF] hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Briefcase size={20} className="text-blue-600" />
          </div>
          <ChevronRight size={16} className="text-[#CCCCCC] group-hover:text-[#A996FF] transition-colors" />
        </div>
        
        <p className="text-xs text-[#999999] mb-1">워크 OS</p>
        <p className="text-lg font-bold text-[#1A1A1A] mb-1">
          {workCount > 0 ? workCount + '개' : '없음'}
        </p>
        <p className="text-xs text-[#666666]">{workStatus}</p>
      </button>
      
      {/* Life Mode Card */}
      <button
        onClick={function() { navigate('/life'); }}
        className="bg-white rounded-2xl p-4 text-left border border-[#E5E5E5] hover:border-[#A996FF] hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
            <Heart size={20} className="text-pink-600" />
          </div>
          <ChevronRight size={16} className="text-[#CCCCCC] group-hover:text-[#A996FF] transition-colors" />
        </div>
        
        <p className="text-xs text-[#999999] mb-1">라이프 OS</p>
        <p className="text-lg font-bold text-[#1A1A1A] mb-1">
          {lifeCount > 0 ? lifeCount + '개' : '체크'}
        </p>
        <p className="text-xs text-[#666666]">{lifeStatus}</p>
      </button>
    </div>
  );
}
