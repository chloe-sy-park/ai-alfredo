import { QUICK_ACTIONS } from '../../constants';

interface QuickActionsProps {
  onAction: (action: string) => void;
  onClose: () => void;
}

export default function QuickActions({ onAction, onClose }: QuickActionsProps) {
  const handleClick = (action: string) => {
    if (action === 'openChat') {
      onClose();
    } else {
      onAction(action);
    }
  };

  return (
    <div className="flex items-center justify-around w-full py-1">
      {QUICK_ACTIONS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => handleClick(item.action)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[#F0F0F0] transition-colors"
          >
            <div className="w-10 h-10 flex items-center justify-center bg-[#F5F5F5] rounded-full">
              <Icon size={20} className="text-[#666666]" />
            </div>
            <span className="text-[10px] text-[#666666]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
