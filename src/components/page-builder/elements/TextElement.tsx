"use client";

import type React from 'react';

interface TextElementProps {
  content: string;
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  alignment: 'left' | 'center' | 'right' | 'justify';
}

const TextElement: React.FC<TextElementProps> = ({
  content,
  fontSize = 'base',
  alignment = 'left',
}) => {
  const fontSizeClass = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  }[fontSize];

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  }[alignment];

  return (
    <div className={`p-4 w-full ${alignmentClass} ${fontSizeClass} text-foreground whitespace-pre-wrap`}>
      {content || 'Default text content. Edit this to add your own paragraph.'}
    </div>
  );
};

export default TextElement;
