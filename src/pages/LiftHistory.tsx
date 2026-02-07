/**
 * Lift History Page - 판단 이력 전체 보기
 */

import { PageHeader } from '../components/layout';
import LiftRecordTable from '../components/lift/LiftRecordTable';

export default function LiftHistory() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <PageHeader />
      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-4">
        <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Lift 기록
        </h1>
        <LiftRecordTable maxRows={50} showFilter={true} />
      </div>
    </div>
  );
}
