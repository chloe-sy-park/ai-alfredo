import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBriefingStore } from '../../stores/briefingStore';

export default function ReflectButton() {
  var location = useLocation();
  var navigate = useNavigate();
  var { generateBriefing } = useBriefingStore();
  
  var [isReflecting, setIsReflecting] = useState(false);
  var [showTooltip, setShowTooltip] = useState(false);
  var [showSuccess, setShowSuccess] = useState(false);
  
  // 특정 페이지에서는 숨김
  var hiddenPaths = ['/onboarding', '/entry'];
  var shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));
  
  async function handleReflect() {
    if (isReflecting) return;
    
    setIsReflecting(true);
    setShowTooltip(false);
    
    try {
      // 브리핑 갱신
      await generateBriefing();
      
      // 성공 메시지
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // 홈 페이지가 아니면 홈으로 이동
      if (location.pathname !== '/' && location.pathname !== '/home') {
        setTimeout(() => {
          navigate('/');
        }, 500);
      }
    } catch (error) {
      console.error('Reflect failed:', error);
    } finally {
      setIsReflecting(false);
    }
  }
  
  // 처음 사용자를 위한 툴팁 (10초 후 표시)
  useEffect(function() {
    var timer = setTimeout(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 5000);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (shouldHide) return null;
  
  return (
    <>
      {/* Reflect 버튼 */}
      <motion.button
        onClick={handleReflect}
        disabled={isReflecting}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <RefreshCw 
          size={22} 
          className={`transition-transform duration-700 ${
            isReflecting ? 'animate-spin' : 'group-hover:rotate-180'
          }`}
        />
        
        {/* 툴팁 */}
        <AnimatePresence>
          {showTooltip && !isReflecting && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-full mr-3 whitespace-nowrap"
            >
              <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                  <div className="w-0 h-0 border-l-[6px] border-l-gray-800 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent" />
                </div>
                탭해서 브리핑 갱신하기 🔄
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* 성공 메시지 */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-green-50 border border-green-200 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
              <span className="text-lg">🐧</span>
              <span className="text-sm font-medium text-green-800">브리핑을 새로 가져왔어요!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}