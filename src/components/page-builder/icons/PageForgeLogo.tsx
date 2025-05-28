import type React from 'react';

const PageForgeLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
    {...props} // Spread any incoming props
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width="50" // Can be overridden by props.className if Tailwind size classes are used
    height="50" // Can be overridden by props.className
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <rect x="8" y="12" width="40" height="48" rx="4" ry="4" fill="#E5E7EB" />
        <path d="M16 4h40a4 4 0 0 1 4 4v40a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z" fill="#FFF" />
    <polyline points="56 4 56 16 44 16" />
    <line x1="32" y1="28" x2="32" y2="44" />
    <line x1="24" y1="36" x2="40" y2="36" />
  </svg>
  
);

export default PageForgeLogo;
