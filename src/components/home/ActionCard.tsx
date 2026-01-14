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
  var variantConfig = {
    email: {
      icon: Mail,
      color: 'text-[#60A5FA]',
      bg: 'bg-[#EFF6FF]',
      label: '이메일'
    },
    meeting: {
      icon: Calendar,
      color: 'text-[#A996FF]',
      bg: 'bg-[#F0F0FF]',
      label: '회의'
    },
    doc: {
      icon: FileText,
      color: 'text-[#4ADE80]',
      bg: 'bg-[#F0FDF4]',
      label: '문서'
    }
  };

  var config = variantConfig[variant];
  var Icon = config.icon;

  return (
    <button
      onClick={onOpen}
      className="w-full bg-white rounded-xl p-4 shadow-card text-left hover:shadow-card-hover transition-shadow min-h-[44px]"
    >
      <div className="flex items-start gap-3">
        <div className={'p-2 rounded-xl ' + config.bg}>
          <Icon className={'w-5 h-5 ' + config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[#999999]">{config.label}</span>
            {meta && (
              <span className="text-xs text-[#F97316] font-medium">{meta}</span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-[#1A1A1A] truncate">
            {title}
          </h4>
          <p className="text-xs text-[#666666] mt-1 line-clamp-2">
            {summary}
          </p>
          {recommendedAction && (
            <p className="text-xs text-[#A996FF] font-medium mt-2">
              💡 {recommendedAction}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
