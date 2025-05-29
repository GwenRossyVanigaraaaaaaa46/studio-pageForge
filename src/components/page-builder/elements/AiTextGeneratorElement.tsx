"use client";

import type React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AiTextGeneratorElementProps {
  userProvidedPrompt: string;
  aiGeneratedText: string;
}

const AiTextGeneratorElement: React.FC<AiTextGeneratorElementProps> = ({
  userProvidedPrompt,
  aiGeneratedText,
}) => {
  const displayPrompt = userProvidedPrompt || "No prompt provided. Edit properties to add a prompt.";
  const displayGeneratedText = aiGeneratedText || "AI generated text will appear here. Edit properties and click 'Generate Text'.";

  return (
    <div className="p-4 w-full">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">AI Generated Content</CardTitle>
          <CardDescription>Based on your prompt:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Your Prompt:</h4>
            <p className="text-sm text-foreground p-3 bg-muted/50 rounded-md whitespace-pre-wrap">
              {displayPrompt}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Generated Text:</h4>
            <p className="text-sm text-foreground p-3 bg-background border rounded-md whitespace-pre-wrap min-h-[60px]">
              {displayGeneratedText}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiTextGeneratorElement;
