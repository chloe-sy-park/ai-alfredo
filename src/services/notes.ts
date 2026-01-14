// Notes service (placeholder)
// 노트 기능을 위한 서비스 (추후 구현 예정)

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// 플레이스홀더 함수들
export function getNotes(): Note[] {
  return [];
}

export function createNote(title: string, content: string): Note {
  return {
    id: Date.now().toString(),
    title,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function updateNote(_id: string, _updates: Partial<Note>): Note | null {
  // 추후 구현
  return null;
}

export function deleteNote(_id: string): boolean {
  // 추후 구현
  return false;
}
