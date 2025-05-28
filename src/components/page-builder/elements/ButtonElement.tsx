
"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button'; // For type safety if needed

interface ButtonElementProps {
  buttonText: string;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
  linkUrl?: string;
  linkOpenInNewTab?: boolean;
  alignment?: 'left' | 'center' | 'right';
}

const ButtonElement: React.FC<ButtonElementProps> = ({
  buttonText = "Click Me",
  variant = "default",
  size = "default",
  linkUrl,
  linkOpenInNewTab = true,
  alignment = "center",
}) => {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  // Ensure variant and size are valid or default, though props should handle this
  const safeVariant = variant || "default";
  const safeSize = size || "default";

  const buttonComponent = (
    <Button variant={safeVariant} size={safeSize} className="shadow-md transition-transform duration-150 ease-in-out hover:scale-105">
      {buttonText || "Button"}
    </Button>
  );

  return (
    <div className={`p-4 w-full flex ${alignmentClasses[alignment]}`}>
      {linkUrl ? (
        <a
          href={linkUrl}
          target={linkOpenInNewTab ? '_blank' : '_self'}
          rel={linkOpenInNewTab ? 'noopener noreferrer' : undefined}
          className="inline-block" // Ensures the link wraps the button properly
        >
          {buttonComponent}
        </a>
      ) : (
        buttonComponent
      )}
    </div>
  );
};

export default ButtonElement;
