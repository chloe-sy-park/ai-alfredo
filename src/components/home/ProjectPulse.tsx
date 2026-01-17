import { memo, useMemo, useCallback } from 'react';

interface Project {
  id: string;
  name: string;
  signal: 'green' | 'yellow' | 'red';
}

interface ProjectPulseProps {
  projects: Project[];
  onOpen?: (id: string) => void;
}

const SIGNAL_COLORS = {
  green: 'bg-[#4ADE80]',
  yellow: 'bg-[#FBBF24]',
  red: 'bg-[#EF4444]',
} as const;

const SIGNAL_LABELS = {
  green: '순항 중',
  yellow: '주의 필요',
  red: '위험',
} as const;

const ProjectPulse = memo(function ProjectPulse({ projects, onOpen }: ProjectPulseProps) {
  const handleOpen = useCallback(
    (id: string) => {
      onOpen?.(id);
    },
    [onOpen]
  );

  // 프로젝트 목록 렌더링 최적화
  const projectItems = useMemo(
    () =>
      projects.map((project) => (
        <button
          key={project.id}
          onClick={() => handleOpen(project.id)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F5F5F5] hover:bg-[#EEEEEE] transition-colors min-h-[44px] dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <span className="text-sm font-medium text-[#1A1A1A] dark:text-white">
            {project.name}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#999999] dark:text-gray-400">
              {SIGNAL_LABELS[project.signal]}
            </span>
            <span className={`w-3 h-3 rounded-full ${SIGNAL_COLORS[project.signal]}`} />
          </div>
        </button>
      )),
    [projects, handleOpen]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card">
      <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-white mb-3">
        프로젝트 상태
      </h3>
      <div className="space-y-2">{projectItems}</div>
    </div>
  );
});

export default ProjectPulse;
