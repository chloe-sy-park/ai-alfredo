import React from 'react';
import { Users } from 'lucide-react';
import { useBodyDoublingStore } from '../../stores/bodyDoublingStore';
import { useNavigate } from 'react-router-dom';

export const BodyDoublingButton: React.FC = () => {
  const { isActive } = useBodyDoublingStore();
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate('/body-doubling')}
      className={`
        fixed bottom-24 right-4 z-40
        w-14 h-14 rounded-full shadow-lg
        flex items-center justify-center
        transition-all duration-200
        ${
          isActive
            ? 'bg-[#A996FF] text-white scale-110'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }
      `}
    >
      <Users className="w-6 h-6" />
      {isActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
      )}
    </button>
  );
};