interface DrawerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DrawerOverlay({ isOpen, onClose }: DrawerOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
      onClick={onClose}
    />
  );
}
