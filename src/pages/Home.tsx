import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../stores/taskStore';
// @ts-ignore - NewHomePage는 JSX 파일
import NewHomePage from '../components/modes/NewHomePage';

/**
 * Home Page - Option A 적용
 * NewHomePage (ModeSwitch + ALL/WORK/LIFE 모드) 사용
 */
export default function Home() {
  const navigate = useNavigate();
  
  // Stores
  const { tasks, fetchTasks } = useTaskStore();

  // 초기 데이터 로드
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 하드코딩된 이벤트 (캘린더 연동 전)
  const events = [
    { id: '1', title: '팀 스탠드업', startTime: '10:00', duration: '30분', type: 'meeting', importance: 'mid' },
    { id: '2', title: '디자인 리뷰', startTime: '11:00', duration: '1시간', type: 'meeting', importance: 'high' },
    { id: '3', title: '집중 작업 시간', startTime: '14:00', duration: '2시간', type: 'focus', importance: 'high' },
    { id: '4', title: '1:1 미팅', startTime: '16:00', duration: '30분', type: 'meeting', importance: 'mid' }
  ];

  // 프로젝트 샘플 데이터
  const projects = [
    { id: 'proj-1', name: '알프레도 MVP' },
    { id: 'proj-2', name: '디자인 시스템' },
    { id: 'proj-3', name: '마케팅 준비' }
  ];

  // 태스크를 NewHomePage 형식으로 변환
  const formattedTasks = tasks.map(task => ({
    id: task.id,
    title: task.title,
    completed: task.status === 'done',
    priority: task.priority || 'medium',
    project: task.category === 'personal' ? 'personal' : 'work',
    dueDate: task.due_date
  }));

  // 네비게이션 핸들러
  const handleNavigate = useCallback((page: string) => {
    switch(page) {
      case 'chat':
        navigate('/chat');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'work':
        navigate('/work');
        break;
      case 'life':
        navigate('/life');
        break;
      default:
        console.log('Navigate to:', page);
    }
  }, [navigate]);

  // 태스크 클릭 핸들러
  const handleTaskClick = useCallback((taskId: string) => {
    console.log('Task clicked:', taskId);
    // TODO: 태스크 상세 모달 또는 수정 기능
  }, []);

  return (
    <NewHomePage
      tasks={formattedTasks}
      projects={projects}
      events={events}
      onNavigate={handleNavigate}
      onTaskClick={handleTaskClick}
    />
  );
}
