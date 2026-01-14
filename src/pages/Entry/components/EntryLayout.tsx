import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface EntryLayoutProps {
  children: ReactNode;
}

export default function EntryLayout({ children }: EntryLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-white">
      <div className="max-w-md mx-auto px-6 py-12">
        {/* 알프레도 아이콘 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="w-16 h-16 bg-primary-main rounded-full flex items-center justify-center">
            <span className="text-3xl">🐧</span>
          </div>
        </motion.div>

        {/* 콘텐츠 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}