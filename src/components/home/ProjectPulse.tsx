import { Briefcase } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  signal: 'green' | 'yellow' | 'red';
}

interface ProjectPulseProps {
  projects: Project[];
  onOpen?: (id: string) => void;
}

export default function ProjectPulse({ projects, onOpen }: ProjectPulseProps) {
  const signalColors = {
    green: 'var(--state-success)',
    yellow: 'var(--state-warning)',
    red: 'var(--state-danger)'
  };

  const signalLabels = {
    green: '순항 중',
    yellow: '주의 필요',
    red: '위험'
  };

  // 빈 상태 처리
  if (projects.length === 0) {
    return (
      <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          프로젝트 상태
        </h3>
        <div className="text-center py-4">
          <div
            className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          >
            <Briefcase size={18} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            진행 중인 프로젝트가 없어요
          </p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Work에서 프로젝트를 추가해보세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        프로젝트 상태
      </h3>
      <div className="space-y-2">
        {projects.map(function(project) {
          return (
            <button
              key={project.id}
              onClick={function() { if (onOpen) onOpen(project.id); }}
              className="w-full flex items-center justify-between p-3 rounded-xl transition-colors min-h-[44px]"
              style={{ backgroundColor: 'var(--surface-subtle)' }}
            >
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {project.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {signalLabels[project.signal]}
                </span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: signalColors[project.signal] }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
