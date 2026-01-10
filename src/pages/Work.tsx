import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { Plus, Star, Clock, Filter } from 'lucide-react';

export default function Work() {
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-fade-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">워크</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Filter size={18} />
          </Button>
          <Button size="sm" leftIcon={<Plus size={18} />}>
            새 태스크
          </Button>
        </div>
      </div>

      {/* 진행 중 */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 mb-2">진행 중</h2>
        <div className="space-y-2">
          <TaskCard
            title="Q1 보고서 마무리"
            dueDate="오늘"
            estimatedTime="2시간"
            isStarred={true}
            tags={['보고서', '중요']}
          />
          <TaskCard
            title="프로젝트 타임라인 수정"
            dueDate="내일"
            estimatedTime="30분"
            tags={['기획']}
          />
        </div>
      </section>

      {/* 할 일 */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 mb-2">할 일</h2>
        <div className="space-y-2">
          <TaskCard
            title="회의록 정리"
            dueDate="이번 주"
            estimatedTime="1시간"
            tags={['문서']}
          />
          <TaskCard
            title="디자인 피드백 반영"
            dueDate="수요일"
            estimatedTime="2시간"
            tags={['디자인']}
          />
          <TaskCard
            title="팀 주간 리뷰 준비"
            estimatedTime="30분"
            tags={['미팅']}
          />
        </div>
      </section>

      {/* 완료 */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 mb-2">완료 (2)</h2>
        <div className="space-y-2 opacity-60">
          <TaskCard
            title="디자인 피드백 정리"
            isCompleted={true}
            tags={['디자인']}
          />
        </div>
      </section>
    </div>
  );
}

interface TaskCardProps {
  title: string;
  dueDate?: string;
  estimatedTime?: string;
  isStarred?: boolean;
  isCompleted?: boolean;
  tags?: string[];
}

function TaskCard({ title, dueDate, estimatedTime, isStarred, isCompleted, tags }: TaskCardProps) {
  return (
    <Card className={`${isCompleted ? 'bg-gray-50' : ''}`}>
      <div className="flex items-start gap-3">
        <button className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 ${
          isCompleted
            ? 'bg-lavender-400 border-lavender-400'
            : 'border-gray-300 hover:border-lavender-400'
        }`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {title}
            </p>
            {isStarred && <Star className="text-amber-400 fill-amber-400" size={16} />}
          </div>
          <div className="flex items-center gap-3 mt-1">
            {dueDate && (
              <span className="text-xs text-gray-500">{dueDate}</span>
            )}
            {estimatedTime && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                {estimatedTime}
              </span>
            )}
          </div>
          {tags && tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-lavender-100 text-lavender-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
