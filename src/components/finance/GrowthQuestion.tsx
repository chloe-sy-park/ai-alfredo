/**
 * Personal Growth Question Component (최초 질문)
 */
import { motion } from 'framer-motion';
import { Briefcase, Heart, Clock } from 'lucide-react';

interface GrowthQuestionProps {
  itemName: string;
  onAnswer: (type: 'Career' | 'Wellbeing' | 'Unclear') => void;
}

export function GrowthQuestion({ itemName, onAnswer }: GrowthQuestionProps) {
  return (
    <motion.div
      className="bg-lavender-50 rounded-xl p-4 border border-lavender-100"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-sm text-gray-700 mb-3">
        <span className="font-medium">{itemName}</span>의 성장은
        <br />
        어디에 더 도움 되나요?
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onAnswer('Career')}
          className="flex-1 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all"
        >
          <Briefcase size={14} className="inline mr-1" />
          일에 도움
        </button>
        <button
          onClick={() => onAnswer('Wellbeing')}
          className="flex-1 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-green-300 hover:bg-green-50 transition-all"
        >
          <Heart size={14} className="inline mr-1" />
          삶에 도움
        </button>
        <button
          onClick={() => onAnswer('Unclear')}
          className="flex-1 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:border-gray-300 transition-all"
        >
          <Clock size={14} className="inline mr-1" />
          아직 몰라요
        </button>
      </div>
    </motion.div>
  );
}
