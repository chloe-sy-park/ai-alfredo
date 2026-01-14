interface SheetBackdropProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SheetBackdrop({ isOpen, onClose }: SheetBackdropProps) {
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
      onClick={onClose}
      aria-hidden="true"
    />
  );
}
