import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingLayout({ children, currentStep, totalSteps }: OnboardingLayoutProps) {
  const navigate = useNavigate();
  const showBackButton = currentStep > 0 && currentStep < totalSteps - 1;

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* 헤더 */}
      <div className="relative">
        {showBackButton && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleBack}
            className="absolute left-4 top-4 p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ChevronLeft size={24} />
          </motion.button>
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}