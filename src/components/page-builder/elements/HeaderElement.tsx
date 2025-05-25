"use client";

import type React from 'react';

interface HeaderElementProps {
  title: string;
  subtitle?: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  alignment: 'left' | 'center' | 'right';
}

const HeaderElement: React.FC<HeaderElementProps> = ({
  title,
  subtitle,
  level = 1,
  alignment = 'left',
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[alignment];

  // Validate level to prevent invalid tags, though TypeScript types should catch this.
  // Fallback to h1 if level is somehow out of expected range.
  const safeLevel = (typeof level === 'number' && level >= 1 && level <= 6) ? level : 1;
  const SafeTag = `h${safeLevel}` as keyof JSX.IntrinsicElements;


  return (
    <div className={`p-4 w-full ${alignmentClass}`}>
      <SafeTag className={`font-bold ${
        safeLevel === 1 ? 'text-4xl' : 
        safeLevel === 2 ? 'text-3xl' :
        safeLevel === 3 ? 'text-2xl' :
        safeLevel === 4 ? 'text-xl' :
        safeLevel === 5 ? 'text-lg' : 'text-base'
      } text-foreground`}>
        {title || 'Default Title'}
      </SafeTag>
      {subtitle && (
        <p className={`mt-2 ${
          safeLevel <= 2 ? 'text-lg' : 'text-md'
        } text-muted-foreground`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default HeaderElement;
