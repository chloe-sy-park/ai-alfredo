/**
 * ReportNarrative
 * PRD Component Inventory: 리포트 내러티브 컴포넌트
 * 알프레도의 관찰과 제안을 내러티브 형식으로 표시
 */

import { Sparkles, Lightbulb, Eye, MessageCircle } from 'lucide-react';

type NarrativeType = 'summary' | 'observation' | 'suggestion' | 'insight';

interface NarrativeItem {
  type: NarrativeType;
  title?: string;
  content: string | string[];
}

interface ReportNarrativeProps {
  items: NarrativeItem[];
  className?: string;
}

interface SingleNarrativeProps {
  type: NarrativeType;
  title?: string;
  content: string | string[];
}

function getTypeConfig(type: NarrativeType) {
  switch (type) {
    case 'summary':
      return {
        icon: Sparkles,
        defaultTitle: '한 줄 요약',
        bgColor: 'bg-white dark:bg-gray-800',
        iconColor: 'text-[#A996FF]',
        textClass: 'text-xl sm:text-2xl font-bold'
      };
    case 'observation':
      return {
        icon: Eye,
        defaultTitle: '알프레도의 관찰',
        bgColor: 'bg-white dark:bg-gray-800',
        iconColor: 'text-[#60A5FA]',
        textClass: 'text-base'
      };
    case 'suggestion':
      return {
        icon: Lightbulb,
        defaultTitle: '다음 주 실험',
        bgColor: 'bg-[#F9F7FF] dark:bg-gray-800',
        iconColor: 'text-[#F97316]',
        textClass: 'text-base'
      };
    case 'insight':
      return {
        icon: MessageCircle,
        defaultTitle: '인사이트',
        bgColor: 'bg-gradient-to-br from-[#F9F7FF] to-[#FEF3C7] dark:from-gray-800 dark:to-gray-700',
        iconColor: 'text-[#A996FF]',
        textClass: 'text-base'
      };
  }
}

function SingleNarrative({ type, title, content }: SingleNarrativeProps) {
  var config = getTypeConfig(type);
  var IconComponent = config.icon;
  var displayTitle = title || config.defaultTitle;
  var isArray = Array.isArray(content);
  var contentArray: string[] = isArray ? (content as string[]) : [content as string];

  return (
    <div className={`rounded-xl p-5 sm:p-6 shadow-sm ${config.bgColor}`}>
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <IconComponent size={18} className={config.iconColor} />
        <h3 className="font-semibold text-[#1A1A1A] dark:text-white">{displayTitle}</h3>
      </div>

      {/* 콘텐츠 */}
      {type === 'summary' ? (
        // Summary - bold large text
        <p className={`text-[#1A1A1A] dark:text-white leading-relaxed ${config.textClass}`}>
          {contentArray.join(' ')}
        </p>
      ) : type === 'suggestion' ? (
        // Suggestion - bullet list
        <ul className="space-y-3">
          {contentArray.map(function(item: string, index: number) {
            return (
              <li key={index} className="flex items-start gap-3">
                <span className="text-[#A996FF] mt-1 flex-shrink-0">•</span>
                <p className="text-[#666666] dark:text-gray-300 leading-relaxed">{item}</p>
              </li>
            );
          })}
        </ul>
      ) : (
        // Observation, Insight - paragraph text
        <div className="space-y-3">
          {contentArray.map(function(item: string, index: number) {
            return (
              <p key={index} className="text-[#666666] dark:text-gray-300 leading-relaxed">
                {item}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ReportNarrative({ items, className = '' }: ReportNarrativeProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map(function(item, index) {
        return (
          <SingleNarrative
            key={index}
            type={item.type}
            title={item.title}
            content={item.content}
          />
        );
      })}
    </div>
  );
}

// Named exports for individual narrative types
export function SummaryNarrative({ content, title }: { content: string; title?: string }) {
  return <SingleNarrative type="summary" title={title} content={content} />;
}

export function ObservationNarrative({ content, title }: { content: string | string[]; title?: string }) {
  return <SingleNarrative type="observation" title={title} content={content} />;
}

export function SuggestionNarrative({ content, title }: { content: string[]; title?: string }) {
  return <SingleNarrative type="suggestion" title={title} content={content} />;
}

export function InsightNarrative({ content, title }: { content: string | string[]; title?: string }) {
  return <SingleNarrative type="insight" title={title} content={content} />;
}

// Export types
export type { NarrativeItem, NarrativeType };
