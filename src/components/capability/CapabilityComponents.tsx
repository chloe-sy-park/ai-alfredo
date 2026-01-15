/**
 * Capability Boundary UI 컴포넌트
 * 알프레도의 능력 범위를 시각화
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  AlertCircle,
  Clock,
  HelpCircle,
  ChevronRight,
  Search
} from 'lucide-react';
import {
  Capability,
  CapabilityCategory,
  CapabilityStatus,
  BoundaryResponse,
  CAPABILITY_CATEGORY_LABELS,
  CAPABILITY_CATEGORY_ICONS,
  CAPABILITY_STATUS_LABELS,
  CANNOT_DO
} from '../../services/capability/types';
import {
  getAllCapabilities,
  getCapabilitiesByCategory,
  getAvailableCapabilities,
  searchCapabilities,
  generateCapabilitySummary,
  getCapabilityIntroduction
} from '../../services/capability/capabilityService';

/**
 * 능력 상태 아이콘
 */
function StatusIcon({ status }: { status: CapabilityStatus }) {
  switch (status) {
    case 'available':
      return <Check className="w-4 h-4 text-green-500" />;
    case 'limited':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case 'unavailable':
      return <X className="w-4 h-4 text-red-400" />;
    case 'coming_soon':
      return <Clock className="w-4 h-4 text-blue-400" />;
  }
}

/**
 * 능력 카드
 */
interface CapabilityCardProps {
  capability: Capability;
  compact?: boolean;
  onClick?: () => void;
}

export function CapabilityCard({ capability, compact = false, onClick }: CapabilityCardProps) {
  const statusColors: Record<CapabilityStatus, string> = {
    available: 'border-green-200 bg-green-50',
    limited: 'border-yellow-200 bg-yellow-50',
    unavailable: 'border-gray-200 bg-gray-50',
    coming_soon: 'border-blue-200 bg-blue-50'
  };

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border ${statusColors[capability.status]} cursor-pointer`}
        onClick={onClick}
      >
        <StatusIcon status={capability.status} />
        <span className="text-sm font-medium text-gray-700">{capability.name}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${statusColors[capability.status]}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {CAPABILITY_CATEGORY_ICONS[capability.category]}
          </span>
          <h4 className="font-medium text-gray-900">{capability.name}</h4>
        </div>
        <div className="flex items-center gap-1">
          <StatusIcon status={capability.status} />
          <span className="text-xs text-gray-500">
            {CAPABILITY_STATUS_LABELS[capability.status]}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">{capability.description}</p>

      {capability.limitations && capability.limitations.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">제한:</p>
          <ul className="text-xs text-gray-600 space-y-0.5">
            {capability.limitations.map((limit, i) => (
              <li key={i}>• {limit}</li>
            ))}
          </ul>
        </div>
      )}

      {capability.examples && capability.examples.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-1">예시:</p>
          <div className="flex flex-wrap gap-1">
            {capability.examples.map((example, i) => (
              <span
                key={i}
                className="text-xs bg-white px-2 py-1 rounded-full text-gray-600"
              >
                "{example}"
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * 능력 목록
 */
interface CapabilityListProps {
  category?: CapabilityCategory;
  showSearch?: boolean;
}

export function CapabilityList({ category, showSearch = false }: CapabilityListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const capabilities = category
    ? getCapabilitiesByCategory(category)
    : searchQuery
    ? searchCapabilities(searchQuery)
    : getAllCapabilities();

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="능력 검색..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="space-y-3">
        {capabilities.map(cap => (
          <CapabilityCard key={cap.id} capability={cap} />
        ))}
      </div>

      {capabilities.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          검색 결과가 없어요
        </p>
      )}
    </div>
  );
}

/**
 * 카테고리별 능력 탭
 */
export function CapabilityTabs() {
  const [activeCategory, setActiveCategory] = useState<CapabilityCategory | null>(null);
  const categories = Object.keys(CAPABILITY_CATEGORY_LABELS) as CapabilityCategory[];

  return (
    <div>
      {/* 탭 버튼 */}
      <div className="flex overflow-x-auto gap-2 pb-3 mb-4 border-b border-gray-100">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
            activeCategory === null
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {CAPABILITY_CATEGORY_ICONS[cat]} {CAPABILITY_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* 능력 목록 */}
      <CapabilityList category={activeCategory || undefined} />
    </div>
  );
}

/**
 * 능력 요약 카드
 */
export function CapabilitySummaryCard() {
  const summary = generateCapabilitySummary();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white rounded-xl">
          <HelpCircle className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">알프레도의 능력</h3>
          <p className="text-sm text-gray-600">총 {summary.total}가지</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatBox
          label="가능"
          value={summary.available}
          color="green"
          icon={<Check className="w-4 h-4" />}
        />
        <StatBox
          label="제한적"
          value={summary.limited}
          color="yellow"
          icon={<AlertCircle className="w-4 h-4" />}
        />
        <StatBox
          label="준비 중"
          value={summary.comingSoon}
          color="blue"
          icon={<Clock className="w-4 h-4" />}
        />
        <StatBox
          label="불가"
          value={summary.unavailable}
          color="gray"
          icon={<X className="w-4 h-4" />}
        />
      </div>
    </div>
  );
}

/**
 * 통계 박스
 */
function StatBox({
  label,
  value,
  color,
  icon
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

/**
 * 못하는 것 목록
 */
export function CannotDoList() {
  return (
    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
      <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
        <X className="w-4 h-4" />
        이건 어려워요
      </h4>
      <ul className="space-y-2">
        {CANNOT_DO.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-red-700">
            <span className="w-1.5 h-1.5 rounded-full bg-red-300" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 할 수 있는 것 목록
 */
export function CanDoList() {
  const capabilities = getAvailableCapabilities().slice(0, 6);

  return (
    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
      <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
        <Check className="w-4 h-4" />
        이건 잘해요
      </h4>
      <ul className="space-y-2">
        {capabilities.map(cap => (
          <li key={cap.id} className="flex items-center gap-2 text-sm text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            {cap.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 능력 소개 카드
 */
export function CapabilityIntroCard() {
  const introduction = getCapabilityIntroduction();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
    >
      <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
        {introduction}
      </p>
    </motion.div>
  );
}

/**
 * 경계 응답 메시지
 */
interface BoundaryMessageProps {
  response: BoundaryResponse;
}

export function BoundaryMessage({ response }: BoundaryMessageProps) {
  const toneStyles: Record<string, string> = {
    apologetic: 'bg-orange-50 border-orange-200',
    honest: 'bg-blue-50 border-blue-200',
    helpful: 'bg-green-50 border-green-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-xl border ${toneStyles[response.tone]}`}
    >
      <p className="text-gray-800 mb-2">{response.message}</p>

      {response.alternative && (
        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-200">
          <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5" />
          <p className="text-sm text-gray-600">{response.alternative}</p>
        </div>
      )}

      {response.learnMore && (
        <p className="text-xs text-gray-500 mt-2 italic">
          {response.learnMore}
        </p>
      )}
    </motion.div>
  );
}

/**
 * 능력 범위 페이지/모달 컨텐츠
 */
export function CapabilityOverview() {
  return (
    <div className="space-y-6">
      <CapabilityIntroCard />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CanDoList />
        <CannotDoList />
      </div>

      <CapabilitySummaryCard />

      <div>
        <h3 className="font-medium text-gray-900 mb-3">상세 능력</h3>
        <CapabilityTabs />
      </div>
    </div>
  );
}
