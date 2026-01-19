import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface EntryLayoutProps {
  children: ReactNode;
}

export default function EntryLayout({ children }: EntryLayoutProps) {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="min-h-screen w-full max-w-md mx-auto px-6 py-12">
        {/* 알프레도 아이콘 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--surface-default)' }}>
            <img
              src="/assets/alfredo/avatar/alfredo-avatar-64.png"
              alt="알프레도"
              className="w-12 h-12 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-3xl">🎩</span>'; }}
            />
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