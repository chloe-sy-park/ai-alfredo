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
    green: 'bg-green-400',
    yellow: 'bg-yellow-400',
    red: 'bg-red-400'
  };

  const signalLabels = {
    green: '순항 중',
    yellow: '주의 필요',
    red: '위험'
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-700 mb-3">
        프로젝트 상태
      </h3>
      <div className="space-y-2">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onOpen?.(project.id)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
          >
            <span className="text-sm font-medium text-neutral-800">
              {project.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">
                {signalLabels[project.signal]}
              </span>
              <span className={`w-3 h-3 rounded-full ${signalColors[project.signal]}`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
