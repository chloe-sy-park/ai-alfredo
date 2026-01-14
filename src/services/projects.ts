// Projects Service - 프로젝트 관리

export interface Project {
  id: string;
  name: string;
  color: string; // 헥스 코드
  icon: string; // 이모지
  description?: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  isArchived?: boolean;
}

var STORAGE_KEY = 'alfredo_projects';

// 기본 프로젝트 색상 팔레트
export var PROJECT_COLORS = [
  '#FF6B6B', // 빨강
  '#4ECDC4', // 민트
  '#45B7D1', // 파랑
  '#F9844A', // 주황
  '#90BE6D', // 초록
  '#9D4EDD', // 보라
  '#F8961E', // 노랑
  '#43AA8B', // 청록
];

// 기본 프로젝트 아이콘
export var PROJECT_ICONS = [
  '💼', '🚀', '💡', '🎯', '📊', '🔬', '🎨', '📱',
  '🌟', '🔥', '⚡', '🏆', '💎', '🌈', '🎪', '🎭'
];

// 기본 프로젝트들
var DEFAULT_PROJECTS: Project[] = [
  { 
    id: 'project_default', 
    name: '일반', 
    color: '#999999', 
    icon: '📁', 
    description: '프로젝트가 지정되지 않은 태스크',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 프로젝트 목록 가져오기
export function getProjects(): Project[] {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // 기본 프로젝트 설정
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
      return DEFAULT_PROJECTS;
    }
    return JSON.parse(stored) as Project[];
  } catch (e) {
    return DEFAULT_PROJECTS;
  }
}

// 프로젝트 저장
function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects:', e);
  }
}

// 프로젝트 추가
export function addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
  var projects = getProjects();
  var newProject: Project = {
    ...project,
    id: 'project_' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
}

// 프로젝트 수정
export function updateProject(id: string, updates: Partial<Project>): Project | null {
  var projects = getProjects();
  var index = projects.findIndex(function(p) { return p.id === id; });
  if (index === -1) return null;
  
  projects[index] = { 
    ...projects[index], 
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveProjects(projects);
  return projects[index];
}

// 프로젝트 삭제
export function deleteProject(id: string): boolean {
  if (id === 'project_default') return false; // 기본 프로젝트는 삭제 불가
  
  var projects = getProjects();
  var filtered = projects.filter(function(p) { return p.id !== id; });
  if (filtered.length === projects.length) return false;
  saveProjects(filtered);
  return true;
}

// ID로 프로젝트 가져오기
export function getProjectById(id: string): Project | null {
  var projects = getProjects();
  return projects.find(function(p) { return p.id === id; }) || null;
}

// 활성 프로젝트만 가져오기 (아카이브 제외)
export function getActiveProjects(): Project[] {
  var projects = getProjects();
  return projects.filter(function(p) { return !p.isArchived; });
}

// 프로젝트 아카이브 토글
export function toggleProjectArchive(id: string): Project | null {
  var projects = getProjects();
  var project = projects.find(function(p) { return p.id === id; });
  if (!project || id === 'project_default') return null;
  
  return updateProject(id, { isArchived: !project.isArchived });
}

// 프로젝트별 태스크 수 업데이트
export function updateProjectTaskCounts(taskCounts: Record<string, number>): void {
  var projects = getProjects();
  var updated = false;
  
  projects.forEach(function(project) {
    var count = taskCounts[project.id] || 0;
    if (project.taskCount !== count) {
      project.taskCount = count;
      project.updatedAt = new Date().toISOString();
      updated = true;
    }
  });
  
  if (updated) {
    saveProjects(projects);
  }
}

// 랜덤 색상 선택 (중복 최소화)
export function getRandomProjectColor(existingColors: string[]): string {
  var availableColors = PROJECT_COLORS.filter(function(color) {
    return existingColors.indexOf(color) === -1;
  });
  
  if (availableColors.length === 0) {
    // 모든 색상이 사용중이면 전체에서 랜덤
    return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
  }
  
  return availableColors[Math.floor(Math.random() * availableColors.length)];
}

// 랜덤 아이콘 선택
export function getRandomProjectIcon(): string {
  return PROJECT_ICONS[Math.floor(Math.random() * PROJECT_ICONS.length)];
}
