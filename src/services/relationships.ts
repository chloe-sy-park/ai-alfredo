// Relationships Service - 관계 리마인더

export interface Relationship {
  id: string;
  name: string;
  emoji: string;
  category: 'family' | 'friend' | 'work' | 'other';
  lastContactDate?: string;
  reminderDays: number; // n일 후 리마인더
  notes?: string;
  createdAt: string;
}

var STORAGE_KEY = 'alfredo_relationships';

// 관계 목록 가져오기
export function getRelationships(): Relationship[] {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Relationship[];
  } catch (e) {
    return [];
  }
}

// 저장
function saveRelationships(relationships: Relationship[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(relationships));
  } catch (e) {
    console.error('Failed to save relationships:', e);
  }
}

// 관계 추가
export function addRelationship(rel: Omit<Relationship, 'id' | 'createdAt'>): Relationship {
  var relationships = getRelationships();
  var newRel: Relationship = {
    ...rel,
    id: 'rel_' + Date.now(),
    createdAt: new Date().toISOString()
  };
  relationships.push(newRel);
  saveRelationships(relationships);
  return newRel;
}

// 관계 수정
export function updateRelationship(id: string, updates: Partial<Relationship>): Relationship | null {
  var relationships = getRelationships();
  var index = relationships.findIndex(function(r) { return r.id === id; });
  if (index === -1) return null;
  
  relationships[index] = { ...relationships[index], ...updates };
  saveRelationships(relationships);
  return relationships[index];
}

// 관계 삭제
export function deleteRelationship(id: string): boolean {
  var relationships = getRelationships();
  var filtered = relationships.filter(function(r) { return r.id !== id; });
  if (filtered.length === relationships.length) return false;
  saveRelationships(filtered);
  return true;
}

// 연락 기록
export function recordContact(id: string): Relationship | null {
  return updateRelationship(id, {
    lastContactDate: new Date().toISOString()
  });
}

// 연락 안한 일수 계산
export function getDaysSinceContact(rel: Relationship): number | null {
  if (!rel.lastContactDate) return null;
  
  var lastContact = new Date(rel.lastContactDate);
  var now = new Date();
  var diffTime = now.getTime() - lastContact.getTime();
  var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// 리마인더 필요한 관계들
export function getNeedContactReminders(): Array<Relationship & { daysSince: number }> {
  var relationships = getRelationships();
  var result: Array<Relationship & { daysSince: number }> = [];
  
  relationships.forEach(function(rel) {
    var daysSince = getDaysSinceContact(rel);
    if (daysSince !== null && daysSince >= rel.reminderDays) {
      result.push({ ...rel, daysSince: daysSince });
    } else if (daysSince === null) {
      // 연락 기록이 없으면 리마인더 일수 지난 것으로 간주
      result.push({ ...rel, daysSince: rel.reminderDays });
    }
  });
  
  // 오래된 순 정렬
  result.sort(function(a, b) { return b.daysSince - a.daysSince; });
  
  return result;
}

// 카테고리별 이모지
export var categoryEmojis: Record<Relationship['category'], string> = {
  family: '👨‍👩‍👧',
  friend: '👋',
  work: '💼',
  other: '🌟'
};

// 카테고리별 한글명
export var categoryLabels: Record<Relationship['category'], string> = {
  family: '가족',
  friend: '친구',
  work: '직장',
  other: '기타'
};
