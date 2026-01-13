interface Props {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function LoadingSpinner({ size = 'md', message }: Props) {
  const sizeClass = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClass} border-4 border-lavender-200 border-t-lavender-500 rounded-full animate-spin`} />
      {message && <p className="text-gray-500 text-sm">{message}</p>}
    </div>
  );
}
