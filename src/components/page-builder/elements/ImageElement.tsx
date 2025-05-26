
"use client";

import type React from 'react';
import Image from 'next/image'; // Keep NextImage for actual images

interface ImageElementProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  alignment?: 'left' | 'center' | 'right';
}

const ImageElement: React.FC<ImageElementProps> = ({
  src,
  alt,
  width = 600,
  height = 400,
  objectFit = 'cover',
  alignment = 'center',
}) => {
  const imageContainerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    maxWidth: '100%', // Ensure responsiveness within its container
  };

  const imageDisplay = src?.trim() ? (
    <div style={imageContainerStyle} className="relative overflow-hidden rounded-md shadow-md transition-transform duration-300 ease-in-out hover:scale-105">
      <Image
        src={src}
        alt={alt || 'User uploaded image'}
        layout="fill"
        objectFit={objectFit}
        className="transition-transform duration-300 ease-in-out"
        data-ai-hint="abstract modern" // Example hint for actual image
      />
    </div>
  ) : (
    <div
      style={imageContainerStyle}
      className="bg-muted border border-dashed border-border rounded-md shadow-inner flex items-center justify-center text-muted-foreground p-2 overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105"
      data-ai-hint="placeholder empty" // Example hint for placeholder
    >
      <div className="text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-image-plus mx-auto mb-1 opacity-60"
        >
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
          <line x1="16" x2="22" y1="5" y2="5" />
          <line x1="19" x2="19" y1="2" y2="8" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <p className="text-xs font-medium mt-1">No Image</p>
        <p className="text-xs opacity-80">
          ({width}px x {height}px)
        </p>
      </div>
    </div>
  );

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`p-4 w-full flex items-center ${alignmentClasses[alignment]}`}>
      {imageDisplay}
    </div>
  );
};

export default ImageElement;
