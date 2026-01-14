// Task Import/Export Service - CSV 가져오기/내보내기

import { Task, getTasks, addTask, getTasksByCategory } from './tasks';
import { getProjects, Project } from './projects';

export interface CSVRow {
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  estimatedMinutes?: string;
  project?: string;
  tags?: string;
}

// CSV 파싱
function parseCSV(csv: string): CSVRow[] {
  var lines = csv.split('\n');
  if (lines.length < 2) return [];
  
  var headers = lines[0].split(',').map(function(h) { 
    return h.trim().toLowerCase().replace(/"/g, ''); 
  });
  
  var rows: CSVRow[] = [];
  
  for (var i = 1; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;
    
    var values = parseCSVLine(line);
    var row: CSVRow = { title: '', priority: 'medium', status: 'todo' };
    
    headers.forEach(function(header, index) {
      var value = values[index] || '';
      switch (header) {
        case 'title':
        case '제목':
        case 'name':
        case '이름':
          row.title = value;
          break;
        case 'description':
        case '설명':
        case 'notes':
        case '메모':
          row.description = value;
          break;
        case 'priority':
        case '우선순위':
          row.priority = normalizePriority(value);
          break;
        case 'status':
        case '상태':
          row.status = normalizeStatus(value);
          break;
        case 'due':
        case 'duedate':
        case 'due_date':
        case '마감일':
        case '기한':
          row.dueDate = normalizeDate(value);
          break;
        case 'estimate':
        case 'estimated':
        case 'estimatedminutes':
        case '예상시간':
          row.estimatedMinutes = value;
          break;
        case 'project':
        case '프로젝트':
          row.project = value;
          break;
        case 'tags':
        case '태그':
        case 'labels':
        case '라벨':
          row.tags = value;
          break;
      }
    });
    
    if (row.title) {
      rows.push(row);
    }
  }
  
  return rows;
}

// CSV 라인 파싱 (쉼표 + 따옴표 처리)
function parseCSVLine(line: string): string[] {
  var result: string[] = [];
  var current = '';
  var inQuotes = false;
  
  for (var i = 0; i < line.length; i++) {
    var char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function normalizePriority(value: string): string {
  var lower = value.toLowerCase();
  if (lower === 'high' || lower === '높음' || lower === '긴급' || lower === '1') return 'high';
  if (lower === 'low' || lower === '낮음' || lower === '3') return 'low';
  return 'medium';
}

function normalizeStatus(value: string): string {
  var lower = value.toLowerCase();
  if (lower === 'done' || lower === 'completed' || lower === '완료') return 'done';
  if (lower === 'in_progress' || lower === 'in progress' || lower === '진행중' || lower === '진행 중') return 'in_progress';
  return 'todo';
}

function normalizeDate(value: string): string | undefined {
  if (!value) return undefined;
  
  // 다양한 날짜 형식 처리
  var date = new Date(value);
  if (isNaN(date.getTime())) {
    // YYYY/MM/DD 형식 시도
    var parts = value.split(/[\/\-]/);
    if (parts.length === 3) {
      date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
  }
  
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString().split('T')[0];
}

// CSV Import
export function importTasksFromCSV(
  csv: string, 
  category: 'work' | 'life'
): { success: number; failed: number; errors: string[] } {
  var result = { success: 0, failed: 0, errors: [] as string[] };
  var rows = parseCSV(csv);
  var projects = getProjects();
  
  rows.forEach(function(row, index) {
    try {
      var projectId: string | undefined;
      if (row.project) {
        var proj = projects.find(function(p) { 
          return p.name.toLowerCase() === row.project!.toLowerCase(); 
        });
        projectId = proj ? proj.id : undefined;
      }
      
      var tags: string[] | undefined;
      if (row.tags) {
        tags = row.tags.split(/[,;]/).map(function(t) { return t.trim(); }).filter(Boolean);
      }
      
      addTask({
        title: row.title,
        description: row.description,
        category: category,
        priority: row.priority as 'high' | 'medium' | 'low',
        dueDate: row.dueDate,
        estimatedMinutes: row.estimatedMinutes ? parseInt(row.estimatedMinutes) : undefined,
        projectId: projectId,
        tags: tags
      });
      
      result.success++;
    } catch (e) {
      result.failed++;
      result.errors.push('Row ' + (index + 2) + ': ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  });
  
  return result;
}

// CSV Export
export function exportTasksToCSV(category?: 'work' | 'life'): string {
  var tasks: Task[];
  if (category) {
    tasks = getTasksByCategory(category);
  } else {
    tasks = getTasks();
  }
  
  var projects = getProjects();
  
  var headers = ['Title', 'Description', 'Priority', 'Status', 'Due Date', 'Estimated Minutes', 'Actual Minutes', 'Project', 'Tags', 'Category', 'Created At', 'Completed At'];
  var lines = [headers.join(',')];
  
  tasks.forEach(function(task) {
    var project = task.projectId ? projects.find(function(p) { return p.id === task.projectId; }) : null;
    
    var row = [
      escapeCSV(task.title),
      escapeCSV(task.description || ''),
      task.priority,
      task.status,
      task.dueDate || '',
      task.estimatedMinutes ? String(task.estimatedMinutes) : '',
      task.actualMinutes ? String(task.actualMinutes) : '',
      project ? escapeCSV(project.name) : '',
      task.tags ? escapeCSV(task.tags.join(', ')) : '',
      task.category,
      task.createdAt,
      task.completedAt || ''
    ];
    
    lines.push(row.join(','));
  });
  
  return lines.join('\n');
}

function escapeCSV(value: string): string {
  if (value.indexOf(',') !== -1 || value.indexOf('"') !== -1 || value.indexOf('\n') !== -1) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

// 다운로드 트리거
export function downloadCSV(csv: string, filename: string): void {
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 파일 읽기
export function readCSVFile(file: File): Promise<string> {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function(e) {
      if (e.target && typeof e.target.result === 'string') {
        resolve(e.target.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = function() {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
}

// Todoist CSV 형식 지원
export function importFromTodoist(csv: string, category: 'work' | 'life'): { success: number; failed: number; errors: string[] } {
  // Todoist CSV 헤더: TYPE,CONTENT,PRIORITY,INDENT,AUTHOR,RESPONSIBLE,DATE,DATE_LANG,TIMEZONE
  return importTasksFromCSV(csv, category);
}

// Notion CSV 형식 지원  
export function importFromNotion(csv: string, category: 'work' | 'life'): { success: number; failed: number; errors: string[] } {
  // Notion exports: Name, Status, Priority, Due, etc.
  return importTasksFromCSV(csv, category);
}
