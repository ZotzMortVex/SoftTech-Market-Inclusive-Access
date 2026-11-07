import { useEffect } from 'react';

interface OpticalFlashProps {
  active: boolean;
  onComplete: () => void;
  color?: 'cyan' | 'green' | 'amber' | 'red';
}

export function OpticalFlash({ active, onComplete, color = 'cyan' }: OpticalFlashProps) {
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        onComplete();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!active) return null;

  const colorStyles = {
    cyan: 'border-[#00e3fd] shadow-[inset_0_0_60px_rgba(0,227,253,0.5)]',
    green: 'border-[#34a273] shadow-[inset_0_0_60px_rgba(52,162,115,0.5)]',
    amber: 'border-[#ffc038] shadow-[inset_0_0_60px_rgba(255,192,56,0.5)]',
    red: 'border-[#ff5449] shadow-[inset_0_0_60px_rgba(255,84,73,0.5)]',
  };

  return (
    <div 
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-[9999] border-8 transition-opacity duration-300 animate-pulse ${colorStyles[color]}`}
    />
  );
}
