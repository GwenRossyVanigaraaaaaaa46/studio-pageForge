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

  return (
    <div className={`p-4 w-full ${alignmentClass}`}>
      <Tag className={`font-bold ${
        level === 1 ? 'text-4xl' : 
        level === 2 ? 'text-3xl' :
        level === 3 ? 'text-2xl' :
        level === 4 ? 'text-xl' :
        level === 5 ? 'text-lg' : 'text-base'
      } text-foreground`}>
        {title || 'Default Title'}
      </Tag>
      {subtitle && (
        <p className={`mt-2 ${
          level <= 2 ? 'text-lg' : 'text-md'
        } text-muted-foreground`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default HeaderElement;
