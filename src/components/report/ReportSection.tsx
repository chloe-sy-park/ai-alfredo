import { ReactNode } from 'react';

interface ReportSectionProps {
  title?: string;
  variant?: 'default' | 'highlight';
  children: ReactNode;
  className?: string;
}

export default function ReportSection({ 
  title, 
  variant = 'default',
  children,
  className = ''
}: ReportSectionProps) {
  const baseClasses = variant === 'highlight' 
    ? 'bg-primary-light dark:bg-primary/20' 
    : 'bg-white dark:bg-gray-900';
    
  return (
    <section className={`${baseClasses} rounded-2xl p-6 ${className}`}>
      {title && (
        <h3 className="font-medium mb-4">{title}</h3>
      )}
      {children}
    </section>
  );
}