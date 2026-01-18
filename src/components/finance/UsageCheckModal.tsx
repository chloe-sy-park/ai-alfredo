/**
 * Usage Check Modal Component
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import {
  RecurringItem,
  UsageFrequency,
  RetentionIntent,
  USAGE_CHECK_QUESTIONS,
} from '../../services/finance/types';

interface UsageCheckModalProps {
  item: RecurringItem;
  onSubmit: (response: {
    frequency: UsageFrequency;
    hasDuplicate: boolean;
    retention: RetentionIntent;
  }) => void;
  onClose: () => void;
}

export function UsageCheckModal({ item, onSubmit, onClose }: UsageCheckModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [frequency, setFrequency] = useState<UsageFrequency | null>(null);
  const [duplicate, setDuplicate] = useState<'none' | 'exists' | 'using' | null>(null);
  const [retention, setRetention] = useState<RetentionIntent | null>(null);

  const handleComplete = () => {
    if (frequency && duplicate !== null && retention) {
      onSubmit({
        frequency,
        hasDuplicate: duplicate === 'exists' || duplicate === 'using',
        retention,
      });
    }
  };

  const questions = USAGE_CHECK_QUESTIONS;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500">
              ₩{item.amount.toLocaleString()} · D-
              {Math.ceil(
                (new Date(item.nextPaymentDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Questions */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-base font-medium text-gray-800">
                {questions.frequency.question}
              </p>
              <div className="flex gap-2">
                {questions.frequency.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFrequency(opt.value);
                      setStep(2);
                    }}
                    className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                      frequency === opt.value
                        ? 'border-primary bg-lavender-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className="text-sm font-medium text-gray-700">
                      {opt.label}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-base font-medium text-gray-800">
                {questions.duplicate.question}
              </p>
              <div className="flex gap-2">
                {questions.duplicate.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setDuplicate(opt.value);
                      setStep(3);
                    }}
                    className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                      duplicate === opt.value
                        ? 'border-primary bg-lavender-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className="text-sm font-medium text-gray-700">
                      {opt.label}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-base font-medium text-gray-800">
                {questions.retention.question}
              </p>
              <div className="flex gap-2">
                {questions.retention.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setRetention(opt.value);
                    }}
                    className={`flex-1 py-4 rounded-xl border-2 transition-all ${
                      retention === opt.value
                        ? 'border-primary bg-lavender-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className="text-sm font-medium text-gray-700">
                      {opt.label}
                    </div>
                  </button>
                ))}
              </div>

              {retention && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleComplete}
                  className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-lavender-600 transition-colors mt-4"
                >
                  완료
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Button */}
        {step > 1 && (
          <button
            onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            이전으로
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
