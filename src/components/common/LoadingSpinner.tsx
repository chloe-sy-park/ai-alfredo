interface Props {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function LoadingSpinner({ size, message }: Props) {
  if (size === undefined) size = 'md';
  
  var sizeClass = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={sizeClass + ' border-4 border-[#E5E5E5] border-t-[#A996FF] rounded-full animate-spin'} />
      {message && <p className="text-[#666666] text-sm">{message}</p>}
    </div>
  );
}
