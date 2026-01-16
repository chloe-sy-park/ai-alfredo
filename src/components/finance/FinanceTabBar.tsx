/**
 * Finance Tab Bar Component
 */

interface TabBarProps {
  activeTab: 'overlaps' | 'candidates' | 'all';
  onTabChange: (tab: 'overlaps' | 'candidates' | 'all') => void;
  counts: { overlaps: number; candidates: number; all: number };
}

export function FinanceTabBar({ activeTab, onTabChange, counts }: TabBarProps) {
  const tabs = [
    { key: 'overlaps' as const, label: '겹침', count: counts.overlaps },
    { key: 'candidates' as const, label: '해지 후보', count: counts.candidates },
    { key: 'all' as const, label: '전체', count: counts.all },
  ];

  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === tab.key
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
          {tab.count > 0 && (
            <span
              className={`ml-1 text-xs ${
                activeTab === tab.key ? 'text-primary' : 'text-gray-400'
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
