import { useEffect, useState } from 'react';
import { Check, Sparkles, Heart, Star } from 'lucide-react';

// Success feedback for task completion
export function SuccessCheckmark({ 
  show, 
  onComplete,
  message = '완료!'
}: { 
  show: boolean; 
  onComplete?: () => void;
  message?: string;
}) {
  useEffect(function() {
    if (show && onComplete) {
      var timer = setTimeout(onComplete, 800);
      return function() { clearTimeout(timer); };
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-2xl p-6 shadow-2xl animate-scale-in pointer-events-auto">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check size={32} className="text-green-600 animate-fade-in animation-delay-150" />
          </div>
          <p className="text-lg font-semibold text-[#1A1A1A]">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Celebration particles for big achievements
export function CelebrationParticles({ trigger }: { trigger: boolean }) {
  var [particles, setParticles] = useState<Array<{ id: number; icon: any; x: number; y: number }>>([]);

  useEffect(function() {
    if (trigger) {
      var icons = [Sparkles, Heart, Star];
      var newParticles = Array.from({ length: 6 }, function(_, i) {
        return {
          id: Date.now() + i,
          icon: icons[Math.floor(Math.random() * icons.length)],
          x: Math.random() * 100,
          y: 100
        };
      });
      setParticles(newParticles);
      
      var timer = setTimeout(function() { setParticles([]); }, 2000);
      return function() { clearTimeout(timer); };
    }
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(function(particle) {
        var Icon = particle.icon;
        return (
          <div
            key={particle.id}
            className="absolute animate-[floatUp_2s_ease-out_forwards]"
            style={{ 
              left: `${particle.x}%`, 
              bottom: 0,
            }}
          >
            <Icon size={20} className="text-yellow-400" />
          </div>
        );
      })}
    </div>
  );
}

// Gentle pulse for focus indication
export function FocusPulse({ active }: { active: boolean }) {
  if (!active) return null;
  
  return (
    <div className="absolute inset-0 rounded-xl pointer-events-none">
      <div className="absolute inset-0 rounded-xl bg-primary/20 animate-pulse" />
      <div className="absolute inset-0 rounded-xl ring-2 ring-primary/30 animate-pulse animation-delay-150" />
    </div>
  );
}

// Progress indicator with celebration at 100%
export function ProgressRing({ 
  progress, 
  size = 60,
  strokeWidth = 4
}: { 
  progress: number; 
  size?: number;
  strokeWidth?: number;
}) {
  var radius = (size - strokeWidth) / 2;
  var circumference = 2 * Math.PI * radius;
  var offset = circumference - (progress / 100) * circumference;
  var [celebrated, setCelebrated] = useState(false);

  useEffect(function() {
    if (progress >= 100 && !celebrated) {
      setCelebrated(true);
    }
  }, [progress, celebrated]);

  return (
    <div className="relative inline-flex">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E5E5"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progress >= 100 ? '#4ADE80' : '#A996FF'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {progress >= 100 ? (
          <Check size={20} className="text-green-600 animate-scale-in" />
        ) : (
          <span className="text-xs font-semibold text-[#1A1A1A]">{progress}%</span>
        )}
      </div>
      {celebrated && <CelebrationParticles trigger={true} />}
    </div>
  );
}