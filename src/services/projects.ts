// Projects Service - 프로젝트 관리

export interface Project {
  id: string;
  name: string;
  color: string;
  emoji?: string;
  createdAt: string;
  updatedAt: string;
}

var STORAGE_KEY = 'alfredo_projects';

// 기본 프로젝트들
var DEFAULT_PROJECTS: Project[] = [
  { 
    id: 'project_inbox', 
    name: '미분류', 
    color: '#999999', 
    emoji: '📥',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 프로젝트 색상 팔레트
export var PROJECT_COLORS = [
  '#FF6B6B', // 빨강
  '#4ECDC4', // 민트
  '#45B7D1', // 파랑
  '#96CEB4', // 초록
  '#FECA57', // 노랑
  '#DDA0DD', // 보라
  '#FF8CC8', // 핑크
  '#95A5A6', // 회색
  '#F8B500', // 오렌지
  '#A8E6CF'  // 연두
];

// 프로젝트 이모지 추천
export var PROJECT_EMOJIS = [
  '💼', '📊', '🚀', '🎯', '📱', 
  '💡', '🔥', '⚡', '🌟', '📈',
  '🎨', '🔧', '📝', '🏢', '🌐'
];

// 프로젝트 목록 가져오기
export function getProjects(): Project[] {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
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
export function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Project | null {
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
  // 기본 프로젝트는 삭제 불가
  if (id === 'project_inbox') return false;
  
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

// 프로젝트별 태스크 수 (tasks.ts와 연동)
export function getProjectTaskCount(projectId: string): number {
  try {
    var tasksStr = localStorage.getItem('alfredo_tasks');
    if (!tasksStr) return 0;
    
    var tasks = JSON.parse(tasksStr) as any[];
    return tasks.filter(function(t) { 
      return t.projectId === projectId && t.status !== 'done'; 
    }).length;
  } catch (e) {
    return 0;
  }
}

// 다음 색상 추천 (사용하지 않은 색상)
export function getNextColor(): string {
  var projects = getProjects();
  var usedColors = projects.map(function(p) { return p.color; });
  
  for (var i = 0; i < PROJECT_COLORS.length; i++) {
    if (usedColors.indexOf(PROJECT_COLORS[i]) === -1) {
      return PROJECT_COLORS[i];
    }
  }
  
  // 모든 색상이 사용중이면 랜덤
  return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
}
