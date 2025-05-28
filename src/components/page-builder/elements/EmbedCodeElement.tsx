
"use client";

import type React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// Changed import to a named export from the directory's index file
import { materialLight } from 'react-syntax-highlighter/dist/styles/prism'; 

interface EmbedCodeElementProps {
  code: string;
  language: string;
}


const EmbedCodeElement: React.FC<EmbedCodeElementProps> = ({ code, language }) => {
  const safeCode = code || "";

  return (
    <div className="p-4 w-full overflow-auto bg-muted/50 rounded-md">
      { !safeCode.trim() ? (
        <div className="p-4 border border-dashed rounded-md text-center text-sm text-muted-foreground">
          <p>Embedded Code Block</p>
          <p>Edit properties to add your code and select its language.</p>
        </div>
      ) : (
        language === 'html' ? (
          // If language is HTML, render it directly
          <div dangerouslySetInnerHTML={{ __html: safeCode }} />
        ) : (
          // For all other languages, display with syntax highlighting
          <SyntaxHighlighter
            language={language}
            style={materialLight}
            wrapLines
            showLineNumbers
            className="rounded-md text-sm" // Added text-sm for consistency
          >
            {safeCode}
          </SyntaxHighlighter>
        )
      )}
    </div>
  );
};

export default EmbedCodeElement;
