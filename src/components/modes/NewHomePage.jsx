import React, { useState, useMemo } from 'react';
import { Settings } from 'lucide-react';
import ModeSwitch from '../core/ModeSwitch';
import ChatLauncher from '../core/ChatLauncher';
import MoreSheet from '../core/MoreSheet';
import AllHome from './AllHome';
import WorkHome from './WorkHome';
import LifeHome from './LifeHome';

/**
 * NewHomePage - 스펙 기반 새로운 홈 페이지
 * 
 * 구조:
 * - PageHeader
 * - ModeSwitch (ALL/WORK/LIFE)
 * - Mode별 홈 콘텐츠
 * - ChatLauncher (floating)
 */

function NewHomePage({ tasks = [], projects = [], events = [], onNavigate, onTaskClick }) {
  // 모드 상태
  const [mode, setMode] = useState('all');
  
  // MoreSheet 상태
  const [moreSheet, setMoreSheet] = useState({ isOpen: false, data: null });
  
  // 현재 날짜/시간 정보
  const now = new Date();
  const hour = now.getHours();
  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일`;
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayStr = dayNames[now.getDay()];
  
  // 모드별 브리핑 생성
  const getBriefing = (currentMode) => {
    const greetings = {
      all: {
        morning: '좋은 아침이에요, Boss',
        afternoon: '오늘 오후도 잘 보내고 계시네요',
        evening: '오늘 하루 수고했어요, Boss'
      },
      work: {
        morning: '오전에 집중하고, 오후는 미팅에 맡기세요',
        afternoon: '오늘은 실행보다 결정이 중요한 날이에요',
        evening: '내일을 위해 정리해둘게요'
      },
      life: {
        morning: '오늘은 무리하지 않는 게 가장 생산적인 선택이에요',
        afternoon: '적당히 쉬어가며 하루를 보내세요',
        evening: '오늘 하루도 고생했어요. 푹 쉬세요'
      }
    };
    
    const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    return {
      headline: greetings[currentMode][period],
      subline: null,
      variant: 'default'
    };
  };
  
  // 태스크를 우선순위 아이템으로 변환
  const priorityItems = useMemo(() => {
    return tasks
      .filter(t => !t.completed)
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
      })
      .slice(0, 5)
      .map(task => ({
        id: task.id,
        title: task.title,
        sourceTag: task.project === 'personal' || task.project === 'inbox' ? 'LIFE' : 'WORK',
        meta: task.dueDate ? '오늘' : null,
        status: task.priority === 'high' ? 'atRisk' : 'normal'
      }));
  }, [tasks]);
  
  // WORK 전용 우선순위
  const workPriorities = useMemo(() => {
    return priorityItems.filter(p => p.sourceTag === 'WORK');
  }, [priorityItems]);
  
  // LIFE 전용 우선순위
  const lifePriorities = useMemo(() => {
    return priorityItems.filter(p => p.sourceTag === 'LIFE');
  }, [priorityItems]);
  
  // 타임라인 아이템 생성
  const timelineItems = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      timeRange: event.startTime || '09:00',
      title: event.title,
      subtitle: event.location || null,
      importance: event.importance || 'mid'
    }));
  }, [events]);
  
  // 프로젝트 펄스 데이터
  const projectPulse = useMemo(() => {
    return projects.slice(0, 3).map(project => {
      const projectTasks = tasks.filter(t => t.project === project.id);
      const completed = projectTasks.filter(t => t.completed).length;
      const total = projectTasks.length;
      const ratio = total > 0 ? completed / total : 0;
      
      return {
        id: project.id,
        name: project.name,
        signal: ratio >= 0.7 ? 'green' : ratio >= 0.3 ? 'yellow' : 'red'
      };
    });
  }, [projects, tasks]);
  
  // Work/Life 비율 계산
  const balanceRatio = useMemo(() => {
    const work = priorityItems.filter(p => p.sourceTag === 'WORK').length;
    const life = priorityItems.filter(p => p.sourceTag === 'LIFE').length;
    const total = work + life || 1;
    return {
      work: Math.round((work / total) * 100),
      life: Math.round((life / total) * 100)
    };
  }, [priorityItems]);
  
  // Life Factors 샘플 데이터
  const lifeFactors = [
    { id: 'sleep', label: '수면', statusText: '어젯밤 7시간', signal: 'up' },
    { id: 'exercise', label: '운동', statusText: '이번 주 2회', signal: 'steady' },
    { id: 'hobby', label: '취미', statusText: '최근 활동 없음', signal: 'down' },
    { id: 'health', label: '건강', statusText: '양호', signal: 'up' }
  ];
  
  // Relationship 샘플 데이터
  const relationships = [
    { name: '엄마', reason: '마지막 통화 5일 전' },
    { name: '민지', reason: '생일 D-3' }
  ];
  
  // 더보기 시트 열기
  const openMoreSheet = () => {
    setMoreSheet({
      isOpen: true,
      data: {
        title: '오늘의 판단 근거',
        sections: [
          {
            label: 'Why this order?',
            items: [
              '오전 집중 시간에 중요한 업무 배치',
              '오후 미팅 전에 준비 시간 확보',
              '에너지 레벨에 따른 난이도 조절'
            ]
          },
          {
            label: 'What changed today?',
            items: [
              '새로운 이메일 3통 도착',
              '내일 마감 프로젝트 1건'
            ]
          },
          {
            label: 'Trade-off',
            items: [
              '개인 약속을 오후로 미룸',
              '덜 급한 업무는 내일로 연기'
            ]
          }
        ]
      }
    });
  };
  
  const closeMoreSheet = () => {
    setMoreSheet({ isOpen: false, data: null });
  };
  
  // 채팅 열기
  const openChat = () => {
    onNavigate && onNavigate('chat');
  };
  
  // 설정 열기
  const openSettings = () => {
    onNavigate && onNavigate('settings');
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* 페이지 헤더 */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          {/* 날짜 */}
          <div>
            <p className="text-lg font-semibold text-neutral-800">{dateStr}</p>
            <p className="text-sm text-neutral-500">{dayStr}</p>
          </div>
          
          {/* 설정 버튼 */}
          <button
            onClick={openSettings}
            className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-white transition-colors duration-200"
          >
            <Settings size={20} />
          </button>
        </div>
        
        {/* Mode Switch */}
        <ModeSwitch mode={mode} onChange={setMode} />
      </header>
      
      {/* 메인 콘텐츠 */}
      <main className="px-4 pb-24 pt-4">
        {/* ALL Mode */}
        {mode === 'all' && (
          <AllHome
            briefing={getBriefing('all')}
            priorities={priorityItems}
            timelineItems={timelineItems}
            workRatio={balanceRatio.work}
            lifeRatio={balanceRatio.life}
            onMoreBriefing={openMoreSheet}
            onPriorityClick={onTaskClick}
            onTimelineClick={(id) => console.log('timeline click:', id)}
          />
        )}
        
        {/* WORK Mode */}
        {mode === 'work' && (
          <WorkHome
            briefing={getBriefing('work')}
            priorities={workPriorities}
            projects={projectPulse}
            timelineItems={timelineItems}
            actionCards={[]}
            onMoreBriefing={openMoreSheet}
            onPriorityClick={onTaskClick}
          />
        )}
        
        {/* LIFE Mode */}
        {mode === 'life' && (
          <LifeHome
            briefing={getBriefing('life')}
            priorities={lifePriorities}
            lifeFactors={lifeFactors}
            relationships={relationships}
            timelineItems={timelineItems}
            onMoreBriefing={openMoreSheet}
            onPriorityClick={onTaskClick}
          />
        )}
      </main>
      
      {/* Floating Chat Launcher */}
      <ChatLauncher variant="floating" onOpen={openChat} />
      
      {/* More Sheet */}
      {moreSheet.data && (
        <MoreSheet
          isOpen={moreSheet.isOpen}
          title={moreSheet.data.title}
          sections={moreSheet.data.sections}
          onClose={closeMoreSheet}
        />
      )}
    </div>
  );
}

export default NewHomePage;
