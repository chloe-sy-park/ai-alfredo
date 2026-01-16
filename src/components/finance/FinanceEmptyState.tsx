/**
 * Finance Empty State Component
 */

import { Check, CreditCard } from 'lucide-react';

interface EmptyStateProps {
  type: 'overlaps' | 'candidates' | 'all';
}

export function FinanceEmptyState({ type }: EmptyStateProps) {
  const messages = {
    overlaps: {
      icon: <Check size={32} className="text-emerald-500" />,
      title: '겹치는 구독이 없어요',
      description: '효율적으로 관리하고 계시네요!',
    },
    candidates: {
      icon: <Check size={32} className="text-emerald-500" />,
      title: '해지 후보가 없어요',
      description: '모든 구독을 잘 활용하고 계시네요!',
    },
    all: {
      icon: <CreditCard size={32} className="text-gray-400" />,
      title: '등록된 구독이 없어요',
      description: '구독/정기결제를 추가해보세요',
    },
  };

  const content = messages[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {content.icon}
      </div>
      <h3 className="text-base font-medium text-gray-800 mb-1">{content.title}</h3>
      <p className="text-sm text-gray-500">{content.description}</p>
    </div>
  );
}
