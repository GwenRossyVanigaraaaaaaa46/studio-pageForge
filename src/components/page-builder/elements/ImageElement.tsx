"use client";

import type React from 'react';
import Image from 'next/image';

interface ImageElementProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

const ImageElement: React.FC<ImageElementProps> = ({
  src,
  alt,
  width = 600,
  height = 400,
  objectFit = 'cover',
}) => {
  const placeholderSrc = `https://placehold.co/${width}x${height}.png`;
  const imageSrc = src || placeholderSrc;
  
  return (
    <div className="p-4 w-full flex justify-center items-center">
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
    </div>
  );
};

export default ImageElement;
