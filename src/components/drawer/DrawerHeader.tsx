import { X } from 'lucide-react';

interface DrawerHeaderProps {
  onClose: () => void;
}

export default function DrawerHeader({ onClose }: DrawerHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
          <img
            src="/assets/alfredo/avatar/alfredo-avatar-48.png"
            alt="알프레도"
            className="w-8 h-8 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-xl">🎩</span>'; }}
          />
        </div>
        <div>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>AlFredo</div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>함께한 지 14일째</div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-8 h-8 flex items-center justify-center text-[#999999]"
      >
        <X size={20} />
      </button>
    </div>
  );
}
