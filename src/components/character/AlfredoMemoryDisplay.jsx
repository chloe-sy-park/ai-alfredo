import React, { useState } from 'react';
import { Brain, Clock, Star, Trash2, ChevronRight, Search, Tag, BookOpen } from 'lucide-react';
import { useMemoryStore } from '../../stores/memoryStore';

/**
 * 🧠 Memory Display - Nomi AI 스타일
 * "제가 기억하는 것들" - 사용자에게 투명하게 공개
 * 수정/삭제 가능
 */

const AlfredoMemoryDisplay = () => {
  const { 
    shortTermMemory, 
    mediumTermMemory, 
    longTermMemory,
    userFacts,
    conversations,
    searchMemories,
    getImportantMemories,
    getRecentMemories,
  } = useMemoryStore();

  const [activeTab, setActiveTab] = useState('facts'); // 'facts' | 'memories' | 'conversations'
  const [searchQuery, setSearchQuery] = useState('');

  const importantMemories = getImportantMemories();
  const recentMemories = getRecentMemories(10);

  // 검색 결과
  const searchResults = searchQuery ? searchMemories(searchQuery) : [];

  // 메모리 타입 라벨
  const typeLabels = {
    fact: { label: '사실', color: 'bg-blue-100 text-blue-700' },
    preference: { label: '선호', color: 'bg-purple-100 text-purple-700' },
    pattern: { label: '패턴', color: 'bg-green-100 text-green-700' },
    event: { label: '이벤트', color: 'bg-yellow-100 text-yellow-700' },
    emotion: { label: '감정', color: 'bg-pink-100 text-pink-700' },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5" />
          <h2 className="font-bold">알프레도가 기억하는 것들</h2>
        </div>
        <p className="text-sm text-purple-100">
          Boss에 대해 알게 된 것들이에요. 언제든 수정할 수 있어요.
        </p>
      </div>

      {/* 검색 */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="기억 검색..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b">
        {[
          { id: 'facts', label: 'Boss 정보', icon: Star },
          { id: 'memories', label: '기억', icon: Brain },
          { id: 'conversations', label: '대화', icon: BookOpen },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1 transition-colors ${
              activeTab === tab.id
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 검색 결과 */}
      {searchQuery && searchResults.length > 0 && (
        <div className="p-4 bg-purple-50">
          <p className="text-sm text-purple-700 mb-2">
            "{searchQuery}" 검색 결과 ({searchResults.length}개)
          </p>
          <div className="space-y-2">
            {searchResults.slice(0, 5).map((memory) => (
              <div key={memory.id} className="p-2 bg-white rounded-lg text-sm">
                <span className={`text-xs px-1.5 py-0.5 rounded ${typeLabels[memory.type]?.color}`}>
                  {typeLabels[memory.type]?.label}
                </span>
                <p className="text-gray-700 mt-1">{memory.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 콘텐츠 */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {/* Facts 탭 */}
        {activeTab === 'facts' && (
          <div className="space-y-3">
            {userFacts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🐧</div>
                <p className="text-gray-500 text-sm">아직 기억된 정보가 없어요</p>
                <p className="text-gray-400 text-xs">대화하면서 알아가고 있어요!</p>
              </div>
            ) : (
              userFacts.map((fact, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700">{fact.key}</p>
                    <p className="text-sm text-gray-500">{fact.value}</p>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Memories 탭 */}
        {activeTab === 'memories' && (
          <div>
            {/* 중요한 기억 */}
            {importantMemories.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  중요한 기억
                </h4>
                <div className="space-y-2">
                  {importantMemories.slice(0, 5).map((memory) => (
                    <div key={memory.id} className="p-3 bg-yellow-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${typeLabels[memory.type]?.color}`}>
                          {typeLabels[memory.type]?.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(memory.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{memory.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 최근 기억 */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-500" />
                최근 기억
              </h4>
              {recentMemories.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">
                  아직 기억이 없어요
                </p>
              ) : (
                <div className="space-y-2">
                  {recentMemories.map((memory) => (
                    <div key={memory.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${typeLabels[memory.type]?.color}`}>
                          {typeLabels[memory.type]?.label}
                        </span>
                        {memory.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-xs text-gray-400 flex items-center gap-0.5">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">{memory.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conversations 탭 */}
        {activeTab === 'conversations' && (
          <div className="space-y-3">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-gray-500 text-sm">대화 기록이 없어요</p>
              </div>
            ) : (
              conversations.slice(-10).reverse().map((conv) => (
                <div 
                  key={conv.id}
                  className="p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">
                      {new Date(conv.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {conv.messages.length}개 메시지
                    </span>
                  </div>
                  {conv.summary && (
                    <p className="text-sm text-gray-600">{conv.summary}</p>
                  )}
                  <button className="text-xs text-purple-500 mt-2 flex items-center gap-1 hover:text-purple-700">
                    자세히 보기 <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 푸터 */}
      <div className="p-4 bg-gray-50 border-t">
        <p className="text-xs text-gray-500 text-center">
          🔒 모든 기억은 Boss의 기기에만 저장돼요
        </p>
      </div>
    </div>
  );
};

export default AlfredoMemoryDisplay;
