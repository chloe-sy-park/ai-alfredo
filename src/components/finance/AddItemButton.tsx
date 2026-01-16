/**
 * Add Item Button Component
 */

interface AddItemButtonProps {
  onClick: () => void;
}

export function AddItemButton({ onClick }: AddItemButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
    >
      <span className="text-xl">+</span>
      <span className="text-sm font-medium">구독/정기결제 추가</span>
    </button>
  );
}
