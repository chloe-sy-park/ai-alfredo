// Task Sync Service - Google Tasks 양방향 동기화

import { Task, getTasks, updateTask } from './tasks';

var GOOGLE_TASKS_API = 'https://tasks.googleapis.com/tasks/v1';

export interface GoogleTaskList {
  id: string;
  title: string;
  updated: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  updated: string;
  parent?: string;
}

function getAccessToken(): string | null {
  try {
    var authData = localStorage.getItem('google_auth');
    if (!authData) return null;
    var parsed = JSON.parse(authData);
    return parsed.access_token || null;
  } catch {
    return null;
  }
}

// Google Task Lists 가져오기
export async function getGoogleTaskLists(): Promise<GoogleTaskList[]> {
  var token = getAccessToken();
  if (!token) return [];
  
  try {
    var response = await fetch(GOOGLE_TASKS_API + '/users/@me/lists', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    
    if (!response.ok) return [];
    var data = await response.json();
    return data.items || [];
  } catch {
    console.error('Failed to fetch Google Task Lists');
    return [];
  }
}

// Google Tasks 가져오기
export async function getGoogleTasks(taskListId: string): Promise<GoogleTask[]> {
  var token = getAccessToken();
  if (!token) return [];
  
  try {
    var response = await fetch(
      GOOGLE_TASKS_API + '/lists/' + taskListId + '/tasks?showCompleted=true&showHidden=true',
      {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }
    );
    
    if (!response.ok) return [];
    var data = await response.json();
    return data.items || [];
  } catch {
    console.error('Failed to fetch Google Tasks');
    return [];
  }
}

// Google Task 생성
export async function createGoogleTask(
  taskListId: string, 
  task: { title: string; notes?: string; due?: string }
): Promise<GoogleTask | null> {
  var token = getAccessToken();
  if (!token) return null;
  
  try {
    var body: Record<string, string> = { title: task.title };
    if (task.notes) body.notes = task.notes;
    if (task.due) body.due = new Date(task.due).toISOString();
    
    var response = await fetch(
      GOOGLE_TASKS_API + '/lists/' + taskListId + '/tasks',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );
    
    if (!response.ok) return null;
    return await response.json();
  } catch {
    console.error('Failed to create Google Task');
    return null;
  }
}

// Google Task 업데이트
export async function updateGoogleTask(
  taskListId: string,
  taskId: string,
  updates: { title?: string; notes?: string; status?: 'needsAction' | 'completed'; due?: string }
): Promise<GoogleTask | null> {
  var token = getAccessToken();
  if (!token) return null;
  
  try {
    var body: Record<string, string> = {};
    if (updates.title) body.title = updates.title;
    if (updates.notes !== undefined) body.notes = updates.notes;
    if (updates.status) body.status = updates.status;
    if (updates.due) body.due = new Date(updates.due).toISOString();
    
    var response = await fetch(
      GOOGLE_TASKS_API + '/lists/' + taskListId + '/tasks/' + taskId,
      {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );
    
    if (!response.ok) return null;
    return await response.json();
  } catch {
    console.error('Failed to update Google Task');
    return null;
  }
}

// Google Task -> Alfredo Task 변환
function googleTaskToAlfredo(gTask: GoogleTask, taskListId: string, category: 'work' | 'life'): Omit<Task, 'id' | 'createdAt' | 'status'> & { status: Task['status'] } {
  return {
    title: gTask.title,
    description: gTask.notes,
    category: category,
    priority: 'medium',
    status: gTask.status === 'completed' ? 'done' : 'todo',
    dueDate: gTask.due ? gTask.due.split('T')[0] : undefined,
    googleTaskId: gTask.id,
    googleTaskListId: taskListId,
    lastSyncedAt: new Date().toISOString()
  };
}

// Alfredo Task -> Google Task 변환
function alfredoTaskToGoogle(task: Task): { title: string; notes?: string; status: 'needsAction' | 'completed'; due?: string } {
  return {
    title: task.title,
    notes: task.description,
    status: task.status === 'done' ? 'completed' : 'needsAction',
    due: task.dueDate
  };
}

// 양방향 동기화
export async function syncWithGoogleTasks(
  taskListId: string, 
  category: 'work' | 'life'
): Promise<{ imported: number; exported: number; updated: number }> {
  var result = { imported: 0, exported: 0, updated: 0 };
  
  var googleTasks = await getGoogleTasks(taskListId);
  var localTasks = getTasks().filter(function(t) { return t.category === category; });
  
  // Google -> Local (Import)
  for (var i = 0; i < googleTasks.length; i++) {
    var gTask = googleTasks[i];
    var existingLocal = localTasks.find(function(t) { return t.googleTaskId === gTask.id; });
    
    if (!existingLocal) {
      // 새로 가져오기
      var newTaskData = googleTaskToAlfredo(gTask, taskListId, category);
      var tasks = getTasks();
      var newTask: Task = {
        ...newTaskData,
        id: 'task_' + Date.now() + '_' + i,
        createdAt: new Date().toISOString()
      };
      tasks.push(newTask);
      localStorage.setItem('alfredo_tasks', JSON.stringify(tasks));
      result.imported++;
    } else {
      // 업데이트 체크
      var gUpdated = new Date(gTask.updated).getTime();
      var localUpdated = existingLocal.lastSyncedAt ? new Date(existingLocal.lastSyncedAt).getTime() : 0;
      
      if (gUpdated > localUpdated) {
        updateTask(existingLocal.id, {
          title: gTask.title,
          description: gTask.notes,
          status: gTask.status === 'completed' ? 'done' : 'todo',
          dueDate: gTask.due ? gTask.due.split('T')[0] : undefined,
          lastSyncedAt: new Date().toISOString()
        });
        result.updated++;
      }
    }
  }
  
  // Local -> Google (Export)
  var updatedLocalTasks = getTasks().filter(function(t) { return t.category === category; });
  for (var j = 0; j < updatedLocalTasks.length; j++) {
    var localTask = updatedLocalTasks[j];
    if (!localTask.googleTaskId) {
      // Google에 새로 생성
      var created = await createGoogleTask(taskListId, alfredoTaskToGoogle(localTask));
      if (created) {
        updateTask(localTask.id, {
          googleTaskId: created.id,
          googleTaskListId: taskListId,
          lastSyncedAt: new Date().toISOString()
        });
        result.exported++;
      }
    }
  }
  
  return result;
}

// 단일 태스크 Google에 푸시
export async function pushTaskToGoogle(task: Task, taskListId: string): Promise<boolean> {
  if (task.googleTaskId) {
    var updated = await updateGoogleTask(
      taskListId,
      task.googleTaskId,
      alfredoTaskToGoogle(task)
    );
    if (updated) {
      updateTask(task.id, { lastSyncedAt: new Date().toISOString() });
      return true;
    }
  } else {
    var created = await createGoogleTask(taskListId, alfredoTaskToGoogle(task));
    if (created) {
      updateTask(task.id, {
        googleTaskId: created.id,
        googleTaskListId: taskListId,
        lastSyncedAt: new Date().toISOString()
      });
      return true;
    }
  }
  return false;
}
