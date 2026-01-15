/**
 * Data Transparency 서비스
 */

import { DataCategory, DataExport, DATA_USAGE_INFO, DataUsageInfo } from './types';

export function getDataUsageInfo(): DataUsageInfo[] {
  return Object.values(DATA_USAGE_INFO);
}

export function getDataUsageByCategory(category: DataCategory): DataUsageInfo {
  return DATA_USAGE_INFO[category];
}

export function exportUserData(categories: DataCategory[]): DataExport {
  const data: Record<string, unknown> = {};

  categories.forEach(category => {
    try {
      switch (category) {
        case 'calendar':
          data.calendar = localStorage.getItem('alfredo_calendar_cache');
          break;
        case 'tasks':
          data.tasks = localStorage.getItem('alfredo_tasks');
          break;
        case 'preferences':
          data.preferences = localStorage.getItem('alfredo_preferences');
          break;
        case 'patterns':
          data.patterns = localStorage.getItem('alfredo_patterns');
          break;
        case 'history':
          data.history = localStorage.getItem('alfredo_memory_collections');
          break;
        case 'feedback':
          data.feedback = localStorage.getItem('alfredo_feedback');
          break;
      }
    } catch (e) {
      console.error(`Failed to export ${category}:`, e);
    }
  });

  return {
    exportedAt: new Date().toISOString(),
    categories,
    format: 'json',
    data
  };
}

export function deleteUserData(categories: DataCategory[]): void {
  categories.forEach(category => {
    try {
      switch (category) {
        case 'calendar':
          localStorage.removeItem('alfredo_calendar_cache');
          break;
        case 'tasks':
          localStorage.removeItem('alfredo_tasks');
          break;
        case 'preferences':
          localStorage.removeItem('alfredo_preferences');
          break;
        case 'patterns':
          localStorage.removeItem('alfredo_patterns');
          break;
        case 'history':
          localStorage.removeItem('alfredo_memory_collections');
          localStorage.removeItem('alfredo_memories');
          break;
        case 'feedback':
          localStorage.removeItem('alfredo_feedback');
          break;
      }
    } catch (e) {
      console.error(`Failed to delete ${category}:`, e);
    }
  });
}

export function deleteAllUserData(): void {
  const keysToKeep = ['alfredo_onboarding'];
  const allKeys = Object.keys(localStorage).filter(key => key.startsWith('alfredo_'));

  allKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });
}

export function downloadExport(exportData: DataExport): void {
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alfredo-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getStorageUsage(): { used: number; categories: Record<DataCategory, number> } {
  const categories: Record<DataCategory, number> = {
    calendar: 0,
    tasks: 0,
    preferences: 0,
    patterns: 0,
    history: 0,
    feedback: 0
  };

  let total = 0;

  Object.keys(localStorage).forEach(key => {
    if (!key.startsWith('alfredo_')) return;
    const size = (localStorage.getItem(key) || '').length * 2; // UTF-16
    total += size;

    if (key.includes('calendar')) categories.calendar += size;
    else if (key.includes('task')) categories.tasks += size;
    else if (key.includes('pref')) categories.preferences += size;
    else if (key.includes('pattern')) categories.patterns += size;
    else if (key.includes('memory') || key.includes('history')) categories.history += size;
    else if (key.includes('feedback')) categories.feedback += size;
  });

  return { used: total, categories };
}
