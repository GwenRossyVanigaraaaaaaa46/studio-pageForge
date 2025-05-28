
"use client";

import type React from 'react';

interface EmbedCodeElementProps {
  htmlCode: string;
}

const EmbedCodeElement: React.FC<EmbedCodeElementProps> = ({
  htmlCode,
}) => {
  const safeHtmlCode = htmlCode || "";

  return (
    <div className="p-4 w-full">
      {safeHtmlCode.trim() ? (
        <div dangerouslySetInnerHTML={{ __html: safeHtmlCode }} />
      ) : (
        <div className="p-4 border border-dashed border-border rounded-md text-muted-foreground bg-muted/50 text-center">
          <p>Embedded Code Block</p>
          <p className="text-sm">Edit properties to add your HTML, CSS, and JavaScript.</p>
        </div>
      )}
    </div>
  );
};

export default EmbedCodeElement;
