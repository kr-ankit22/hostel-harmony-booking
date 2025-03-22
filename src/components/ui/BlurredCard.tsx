
import React from 'react';
import { cn } from '@/lib/utils';

interface BlurredCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowEffect?: boolean;
  border?: boolean;
}

const BlurredCard: React.FC<BlurredCardProps> = ({
  children,
  className,
  hoverEffect = false,
  glowEffect = false,
  border = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'glass-card rounded-lg p-6',
        hoverEffect && 'btn-transition',
        glowEffect && 'relative',
        border ? 'border border-white/20' : '',
        className
      )}
      {...props}
    >
      {glowEffect && (
        <div className="absolute inset-0 -z-10 bg-academic-light/10 blur-xl rounded-lg transform scale-[0.85] opacity-50"></div>
      )}
      {children}
    </div>
  );
};

export default BlurredCard;
