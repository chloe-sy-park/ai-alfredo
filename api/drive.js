// Vercel Serverless Function - Google Drive 동기화
// POST /api/drive

import { setCorsHeaders } from './_cors.js';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';
const APP_FOLDER_NAME = 'Life Butler';

export default async function handler(req, res) {
  // CORS 헤더 설정
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authorization 헤더에서 액세스 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }
    const accessToken = authHeader.split(' ')[1];

    const { action, fileName, content, fileId, useAppDataFolder } = req.body;

    // 앱 폴더 ID 가져오기 또는 생성
    if (action === 'getOrCreateAppFolder') {
      const folder = await getOrCreateAppFolder(accessToken);
      return res.status(200).json({ success: true, folder });
    }

    // 파일 목록 조회
    if (action === 'listFiles') {
      const files = await listFiles(accessToken, useAppDataFolder);
      return res.status(200).json({ success: true, files });
    }

    // 파일 내용 읽기
    if (action === 'readFile' && fileId) {
      const data = await readFile(accessToken, fileId);
      return res.status(200).json({ success: true, data });
    }

    // 파일 이름으로 읽기
    if (action === 'readFileByName' && fileName) {
      const data = await readFileByName(accessToken, fileName, useAppDataFolder);
      return res.status(200).json({ success: true, data });
    }

    // 파일 저장 (생성 또는 업데이트)
    if (action === 'saveFile' && fileName && content !== undefined) {
      const file = await saveFile(accessToken, fileName, content, useAppDataFolder);
      return res.status(200).json({ success: true, file });
    }

    // 파일 삭제
    if (action === 'deleteFile' && fileId) {
      await deleteFile(accessToken, fileId);
      return res.status(200).json({ success: true });
    }

    // 전체 데이터 동기화 (한 번에 모든 파일 저장)
    if (action === 'syncAll' && content) {
      const results = await syncAllData(accessToken, content, useAppDataFolder);
      return res.status(200).json({ success: true, results });
    }

    // 전체 데이터 복원 (모든 파일 읽기)
    if (action === 'restoreAll') {
      const data = await restoreAllData(accessToken, useAppDataFolder);
      return res.status(200).json({ success: true, data });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Drive API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// 앱 전용 폴더 가져오기 또는 생성
async function getOrCreateAppFolder(accessToken) {
  // 기존 폴더 검색
  const searchResponse = await fetch(
    `${DRIVE_API_BASE}/files?q=name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  if (!searchResponse.ok) {
    throw new Error('Failed to search for app folder');
  }

  const searchData = await searchResponse.json();
  
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0];
  }

  // 폴더 생성
  const createResponse = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: APP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createResponse.ok) {
    throw new Error('Failed to create app folder');
  }

  return await createResponse.json();
}

// 파일 목록 조회
async function listFiles(accessToken, useAppDataFolder = false) {
  let query = "trashed=false and mimeType='application/json'";
  let spaces = 'drive';
  
  if (useAppDataFolder) {
    spaces = 'appDataFolder';
  } else {
    // 앱 폴더 내 파일만
    const folder = await getOrCreateAppFolder(accessToken);
    query += ` and '${folder.id}' in parents`;
  }

  const response = await fetch(
    `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&spaces=${spaces}&fields=files(id,name,modifiedTime,size)&orderBy=modifiedTime desc`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to list files');
  }

  const data = await response.json();
  return data.files || [];
}

// 파일 내용 읽기
async function readFile(accessToken, fileId) {
  const response = await fetch(
    `${DRIVE_API_BASE}/files/${fileId}?alt=media`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to read file');
  }

  return await response.text();
}

// 파일 이름으로 읽기
async function readFileByName(accessToken, fileName, useAppDataFolder = false) {
  let query = `name='${fileName}' and trashed=false`;
  let spaces = 'drive';
  
  if (useAppDataFolder) {
    spaces = 'appDataFolder';
  } else {
    const folder = await getOrCreateAppFolder(accessToken);
    query += ` and '${folder.id}' in parents`;
  }

  const searchResponse = await fetch(
    `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&spaces=${spaces}&fields=files(id)`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  if (!searchResponse.ok) {
    throw new Error('Failed to search file');
  }

  const searchData = await searchResponse.json();
  
  if (!searchData.files || searchData.files.length === 0) {
    return null;
  }

  return await readFile(accessToken, searchData.files[0].id);
}

// 파일 저장 (생성 또는 업데이트)
async function saveFile(accessToken, fileName, content, useAppDataFolder = false) {
  let query = `name='${fileName}' and trashed=false`;
  let spaces = 'drive';
  let parentId = null;
  
  if (useAppDataFolder) {
    spaces = 'appDataFolder';
  } else {
    const folder = await getOrCreateAppFolder(accessToken);
    parentId = folder.id;
    query += ` and '${parentId}' in parents`;
  }

  // 기존 파일 검색
  const searchResponse = await fetch(
    `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&spaces=${spaces}&fields=files(id)`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  const searchData = await searchResponse.json();
  const existingFile = searchData.files?.[0];

  const contentString = typeof content === 'string' ? content : JSON.stringify(content);
  const blob = new Blob([contentString], { type: 'application/json' });

  if (existingFile) {
    // 기존 파일 업데이트
    const response = await fetch(
      `${UPLOAD_API_BASE}/files/${existingFile.id}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: contentString,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update file');
    }

    return await response.json();
  } else {
    // 새 파일 생성
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
    };

    if (useAppDataFolder) {
      metadata.parents = ['appDataFolder'];
    } else if (parentId) {
      metadata.parents = [parentId];
    }

    // Multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelim = "\r\n--" + boundary + "--";

    const multipartBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      contentString +
      closeDelim;

    const response = await fetch(
      `${UPLOAD_API_BASE}/files?uploadType=multipart`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary="${boundary}"`,
        },
        body: multipartBody,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to create file');
    }

    return await response.json();
  }
}

// 파일 삭제
async function deleteFile(accessToken, fileId) {
  const response = await fetch(
    `${DRIVE_API_BASE}/files/${fileId}`,
    {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error('Failed to delete file');
  }

  return true;
}

// 전체 데이터 동기화
async function syncAllData(accessToken, allData, useAppDataFolder = false) {
  const results = {};
  const dataFiles = {
    'tasks.json': allData.tasks,
    'routines.json': allData.routines,
    'health.json': allData.health,
    'relationships.json': allData.relationships,
    'settings.json': allData.settings,
    'gameState.json': allData.gameState,
    'sync_meta.json': {
      lastSync: new Date().toISOString(),
      version: '1.0.0',
      deviceInfo: allData.deviceInfo || 'web',
    },
  };

  for (const [fileName, data] of Object.entries(dataFiles)) {
    if (data !== undefined) {
      try {
        results[fileName] = await saveFile(accessToken, fileName, data, useAppDataFolder);
      } catch (error) {
        console.error(`Failed to save ${fileName}:`, error);
        results[fileName] = { error: error.message };
      }
    }
  }

  return results;
}

// 전체 데이터 복원
async function restoreAllData(accessToken, useAppDataFolder = false) {
  const data = {};
  const fileNames = [
    'tasks.json',
    'routines.json', 
    'health.json',
    'relationships.json',
    'settings.json',
    'gameState.json',
    'sync_meta.json',
  ];

  for (const fileName of fileNames) {
    try {
      const content = await readFileByName(accessToken, fileName, useAppDataFolder);
      if (content) {
        const key = fileName.replace('.json', '');
        data[key] = JSON.parse(content);
      }
    } catch (error) {
      console.error(`Failed to read ${fileName}:`, error);
    }
  }

  return data;
}
