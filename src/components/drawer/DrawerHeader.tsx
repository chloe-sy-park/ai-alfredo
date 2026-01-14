interface DrawerHeaderProps {
  daysWithAlfredo?: number;
}

export default function DrawerHeader({ daysWithAlfredo = 1 }: DrawerHeaderProps) {
  return (
    <div className="p-6 border-b border-[#E5E5E5]">
      <div className="flex items-center gap-3">
        {/* 펜귄 아바타 */}
        <div className="w-12 h-12 bg-[#A996FF]/20 rounded-full flex items-center justify-center text-2xl">
          🐧
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#1A1A1A]">AlFredo</h2>
          <p className="text-sm text-[#666666]">
            함께한 지 {daysWithAlfredo}일째
          </p>
        </div>
      </div>
    </div>
  );
}
