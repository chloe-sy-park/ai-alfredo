import { Mail, Calendar, FileText } from 'lucide-react';

type ActionVariant = 'email' | 'meeting' | 'doc';

interface ActionCardProps {
  variant: ActionVariant;
  title: string;
  summary: string;
  meta?: string;
  recommendedAction?: string;
  onOpen?: () => void;
}

export default function ActionCard({
  variant,
  title,
  summary,
  meta,
  recommendedAction,
  onOpen
}: ActionCardProps) {
  const variantConfig = {
    email: {
      icon: Mail,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      label: '이메일'
    },
    meeting: {
      icon: Calendar,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      label: '회의'
    },
    doc: {
      icon: FileText,
      color: 'text-green-500',
      bg: 'bg-green-50',
      label: '문서'
    }
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <button
      onClick={onOpen}
      className="w-full bg-white rounded-2xl p-4 shadow-sm text-left hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${config.bg}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-neutral-500">{config.label}</span>
            {meta && (
              <span className="text-xs text-orange-500 font-medium">{meta}</span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-neutral-800 truncate">
            {title}
          </h4>
          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
            {summary}
          </p>
          {recommendedAction && (
            <p className="text-xs text-primary font-medium mt-2">
              💡 {recommendedAction}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
