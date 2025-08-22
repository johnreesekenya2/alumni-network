import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-dark-primary z-50 flex items-center justify-center" data-testid="loader-container">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-accent-blue rounded-full animate-spin border-t-transparent"></div>
          <div className="absolute inset-2 border-4 border-accent-emerald rounded-full animate-spin border-b-transparent" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="absolute inset-6 w-20 h-20 gradient-blue-emerald rounded-full animate-pulse-slow flex items-center justify-center">
            <GraduationCap className="text-2xl text-white" data-testid="loader-icon" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-accent-blue mb-2" data-testid="loader-title">OLOF Alumni Community</h2>
        <p className="text-gray-400 animate-pulse" data-testid="loader-subtitle">Loading your memories...</p>
        <div className="mt-6 w-64 bg-dark-tertiary rounded-full h-2 mx-auto">
          <div 
            className="gradient-blue-emerald h-2 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
            data-testid="progress-bar"
          ></div>
        </div>
      </div>
    </div>
  );
}
