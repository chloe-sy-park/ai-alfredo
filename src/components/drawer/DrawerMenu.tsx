import { useNavigate, useLocation } from 'react-router-dom';
import { useNavigationStore } from '../../stores';
import type { MenuItem } from '../../constants';

interface DrawerMenuProps {
  items: MenuItem[];
  onItemClick: () => void;
}

export default function DrawerMenu({ items, onItemClick }: DrawerMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { badges } = useNavigationStore();

  const handleClick = (path: string) => {
    navigate(path);
    onItemClick();
  };

  return (
    <nav className="py-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        const badge = badges[item.labelEn.toLowerCase().replace(' ', '') as keyof typeof badges];

        return (
          <button
            key={item.path}
            onClick={() => handleClick(item.path)}
            className={
              'w-full flex items-center gap-3 px-6 py-3 transition-colors ' +
              (isActive ? 'bg-[#A996FF]/10 text-[#A996FF]' : 'text-[#1A1A1A] hover:bg-[#F5F5F5]')
            }
          >
            <Icon size={20} />
            <span className="flex-1 text-left font-medium">{item.label}</span>
            
            {badge?.count && (
              <span className="px-2 py-0.5 bg-[#A996FF] text-white text-xs rounded-full">
                {badge.count}
              </span>
            )}
            {badge?.isNew && (
              <span className="px-2 py-0.5 bg-[#FFD43B] text-[#1A1A1A] text-xs rounded-full font-medium">
                NEW
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
