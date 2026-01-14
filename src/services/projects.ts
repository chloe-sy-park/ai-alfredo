// Projects Service - 프로젝트/폴더 관리

export interface Project {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  category: 'work' | 'life';
  parentId?: string; // 폴더 구조
  order: number;
  createdAt: string;
  archivedAt?: string;
}

var STORAGE_KEY = 'alfredo_projects';

var DEFAULT_COLORS = [
  '#A996FF', // lavender
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#FFE66D', // yellow
  '#95E1D3', // mint
  '#F38181', // coral
  '#AA96DA', // purple
  '#6C5CE7', // indigo
];

export function getProjects(): Project[] {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Project[];
  } catch (e) {
    return [];
  }
}

function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects:', e);
  }
}

export function addProject(project: Omit<Project, 'id' | 'createdAt' | 'order'>): Project {
  var projects = getProjects();
  var newProject: Project = {
    ...project,
    id: 'proj_' + Date.now(),
    order: projects.length,
    createdAt: new Date().toISOString()
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
}

export function updateProject(id: string, updates: Partial<Project>): Project | null {
  var projects = getProjects();
  var index = projects.findIndex(function(p) { return p.id === id; });
  if (index === -1) return null;
  
  projects[index] = { ...projects[index], ...updates };
  saveProjects(projects);
  return projects[index];
}

export function deleteProject(id: string): boolean {
  var projects = getProjects();
  var filtered = projects.filter(function(p) { return p.id !== id; });
  if (filtered.length === projects.length) return false;
  saveProjects(filtered);
  return true;
}

export function archiveProject(id: string): Project | null {
  return updateProject(id, { archivedAt: new Date().toISOString() });
}

export function unarchiveProject(id: string): Project | null {
  return updateProject(id, { archivedAt: undefined });
}

export function getProjectsByCategory(category: 'work' | 'life'): Project[] {
  var projects = getProjects();
  return projects.filter(function(p) { 
    return p.category === category && !p.archivedAt; 
  });
}

export function getActiveProjects(): Project[] {
  var projects = getProjects();
  return projects.filter(function(p) { return !p.archivedAt; });
}

export function getArchivedProjects(): Project[] {
  var projects = getProjects();
  return projects.filter(function(p) { return !!p.archivedAt; });
}

export function reorderProjects(orderedIds: string[]): void {
  var projects = getProjects();
  orderedIds.forEach(function(id, index) {
    var proj = projects.find(function(p) { return p.id === id; });
    if (proj) proj.order = index;
  });
  projects.sort(function(a, b) { return a.order - b.order; });
  saveProjects(projects);
}

export function getProjectById(id: string): Project | null {
  var projects = getProjects();
  return projects.find(function(p) { return p.id === id; }) || null;
}

export function getDefaultColors(): string[] {
  return DEFAULT_COLORS;
}
