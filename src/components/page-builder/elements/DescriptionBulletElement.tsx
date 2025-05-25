"use client";

import type React from 'react';

interface DescriptionBulletElementProps {
  description: string;
  bulletPointsText: string; // Each line will be a bullet point
  alignment: 'left' | 'center' | 'right';
}

const DescriptionBulletElement: React.FC<DescriptionBulletElementProps> = ({
  description,
  bulletPointsText,
  alignment = 'left',
}) => {
  const bullets = bulletPointsText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center items-center', // For centering the ul
    right: 'text-right items-end', // For aligning the ul to the right
  }[alignment];

  const ulAlignmentClass = {
    left: 'ml-0', // no margin needed if text is left
    center: 'mx-auto', // center the list itself
    right: 'ml-auto mr-0', // align list to right
  }[alignment];


  return (
    <div className={`p-4 w-full flex flex-col ${alignmentClass}`}>
      <p className="mb-3 text-base text-foreground whitespace-pre-wrap">
        {description || 'Default brief description. Edit to add your own content.'}
      </p>
      {bullets.length > 0 && (
        <ul className={`list-disc list-inside space-y-1 text-base text-foreground ${ulAlignmentClass} max-w-prose`}>
          {bullets.map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))}
        </ul>
      )}
      {bullets.length === 0 && (
         <p className="text-muted-foreground text-sm">
            (Add bullet points in the editor, one per line)
        </p>
      )}
    </div>
  );
};

export default DescriptionBulletElement;
