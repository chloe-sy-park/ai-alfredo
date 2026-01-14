import { X } from 'lucide-react';

interface DrawerHeaderProps {
  onClose: () => void;
}

export default function DrawerHeader({ onClose }: DrawerHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#A996FF] rounded-full flex items-center justify-center text-xl">
          🐧
        </div>
        <div>
          <div className="font-semibold text-[#1A1A1A]">AlFredo</div>
          <div className="text-xs text-[#666666]">함께한 지 14일째</div>
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
