import { Briefcase } from 'lucide-react';

export default function Work() {
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center gap-2">
        <Briefcase className="text-lavender-500" />
        <h1 className="text-xl font-bold">업무</h1>
      </div>
      
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-gray-500 text-center py-8">업무 페이지 준비 중...</p>
      </div>
    </div>
  );
}
