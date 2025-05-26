
"use client";

import type React from 'react';
import Image from 'next/image';

interface ImageElementProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  alignment?: 'left' | 'center' | 'right';
  linkUrl?: string;
  linkOpenInNewTab?: boolean;
}

const ImageElement: React.FC<ImageElementProps> = ({
  src,
  alt,
  width = 600,
  height = 400,
  objectFit = 'cover',
  alignment = 'center',
  linkUrl,
  linkOpenInNewTab = true,
}) => {
  const placeholderSrc = `https://placehold.co/${width}x${height}.png`;
  const imageSrc = src || placeholderSrc;

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const imageContent = (
    <div style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }} className="relative overflow-hidden rounded-md shadow-md">
      <Image
        src={imageSrc}
        alt={alt || 'Placeholder Image'}
        layout="fill"
        objectFit={objectFit}
        className="transition-transform duration-300 ease-in-out hover:scale-105"
        data-ai-hint="abstract modern"
      />
    </div>
  );

  return (
    <div className={`p-4 w-full flex items-center ${alignmentClasses[alignment]}`}>
      {linkUrl ? (
        <a
          href={linkUrl}
          target={linkOpenInNewTab ? '_blank' : '_self'}
          rel={linkOpenInNewTab ? 'noopener noreferrer' : undefined}
          className="cursor-pointer"
        >
          {imageContent}
        </a>
      ) : (
        imageContent
      )}
    </div>
  );
};

export default ImageElement;
