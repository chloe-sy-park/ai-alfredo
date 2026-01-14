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
  var signalColors = {
    green: 'bg-[#4ADE80]',
    yellow: 'bg-[#FBBF24]',
    red: 'bg-[#EF4444]'
  };

  var signalLabels = {
    green: '순항 중',
    yellow: '주의 필요',
    red: '위험'
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-card">
      <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">
        프로젝트 상태
      </h3>
      <div className="space-y-2">
        {projects.map(function(project) {
          return (
            <button
              key={project.id}
              onClick={function() { if (onOpen) onOpen(project.id); }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F5F5F5] hover:bg-[#EEEEEE] transition-colors min-h-[44px]"
            >
              <span className="text-sm font-medium text-[#1A1A1A]">
                {project.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#999999]">
                  {signalLabels[project.signal]}
                </span>
                <span className={'w-3 h-3 rounded-full ' + signalColors[project.signal]} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
