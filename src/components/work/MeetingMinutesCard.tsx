/**
 * MeetingMinutesCard
 * PRD: 생성된 회의록 표시 카드
 * VoiceUploadCard에서 생성된 회의록을 보여줌
 */

import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, User, Calendar, CheckCircle2 } from 'lucide-react';
import { MeetingMinutes } from './VoiceUploadCard';

interface MeetingMinutesCardProps {
  minutes: MeetingMinutes;
  onClose?: () => void;
}

export default function MeetingMinutesCard({ minutes, onClose: _onClose }: MeetingMinutesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 날짜 포맷팅
  function formatDate(dateString: string): string {
    var date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="p-4 border-b border-[#E5E5E5] dark:border-gray-700">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#A996FF]/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#A996FF]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#1A1A1A] dark:text-white truncate">
              {minutes.title}
            </h3>
            <p className="text-xs text-[#999999] dark:text-gray-400 mt-0.5">
              {formatDate(minutes.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* 요약 */}
      <div className="p-4">
        <p className="text-sm text-[#666666] dark:text-gray-300 leading-relaxed">
          {minutes.summary}
        </p>
      </div>

      {/* 결정 사항 */}
      {minutes.decisions.length > 0 && (
        <div className="px-4 pb-4">
          <h4 className="text-xs font-semibold text-[#999999] dark:text-gray-400 uppercase mb-2">
            결정 사항
          </h4>
          <ul className="space-y-2">
            {minutes.decisions.map(function(decision, index) {
              return (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-[#1A1A1A] dark:text-white"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{decision}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 액션 아이템 - 확장 가능 */}
      {minutes.actionItems.length > 0 && (
        <div className="border-t border-[#E5E5E5] dark:border-gray-700">
          <button
            onClick={function() { setIsExpanded(!isExpanded); }}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium text-[#1A1A1A] dark:text-white">
              후속 작업 ({minutes.actionItems.length}개)
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#999999]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#999999]" />
            )}
          </button>

          {isExpanded && (
            <div className="px-4 pb-4 space-y-3">
              {minutes.actionItems.map(function(item, index) {
                return (
                  <div
                    key={index}
                    className="p-3 bg-[#F5F5F5] dark:bg-gray-700 rounded-lg"
                  >
                    <p className="text-sm font-medium text-[#1A1A1A] dark:text-white mb-2">
                      {item.task}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#999999] dark:text-gray-400">
                      {item.assignee && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.assignee}
                        </span>
                      )}
                      {item.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
