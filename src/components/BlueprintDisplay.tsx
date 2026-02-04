'use client';

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import Skeleton from '@/components/Skeleton';
import LoadingAnnouncer from '@/components/LoadingAnnouncer';
import { generateBlueprintTemplate } from '@/templates/blueprint-template';
import { ToastOptions } from '@/components/ToastContainer';

interface BlueprintDisplayProps {
  idea: string;
  answers: Record<string, string>;
}

const BlueprintDisplayComponent = function BlueprintDisplay({
  idea,
  answers,
}: BlueprintDisplayProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [blueprint, setBlueprint] = useState('');

  // Simulate blueprint generation
  useEffect(() => {
    const generateBlueprint = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const generatedBlueprint = generateBlueprintTemplate(idea, answers);

      setBlueprint(generatedBlueprint);
      setIsGenerating(false);
    };

    generateBlueprint();
  }, [idea, answers]);

  const handleDownload = () => {
    const blob = new Blob([blueprint], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-blueprint.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(blueprint);
      const win = window as unknown as Window & {
        showToast?: (options: ToastOptions) => void;
      };
      if (typeof window !== 'undefined' && win.showToast) {
        win.showToast({
          type: 'success',
          message: 'Blueprint copied to clipboard!',
          duration: 3000,
        });
      }
    } catch (err) {
      console.error('Failed to copy blueprint:', err);
    }
  };

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <LoadingAnnouncer message="Generating your blueprint" />
        <div className="text-center mb-8">
          <LoadingSpinner
            size="lg"
            className="mb-4"
            ariaLabel="Generating your blueprint"
          />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
            Generating Your Blueprint...
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Our AI is analyzing your answers and creating a detailed action
            plan.
          </p>
        </div>

        <section
          aria-labelledby="skeleton-heading"
          className="bg-white rounded-lg shadow-lg"
        >
          <header className="border-b border-gray-200 px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Skeleton className="h-6 sm:h-8 w-36 sm:w-48" variant="text" />
              <Skeleton className="h-10 w-full sm:w-40" />
            </div>
          </header>

          <div className="p-4 sm:p-8 space-y-4">
            <Skeleton className="h-5 sm:h-6 w-3/4" variant="text" />
            <Skeleton className="h-3 sm:h-4 w-full" variant="text" />
            <Skeleton className="h-3 sm:h-4 w-full" variant="text" />
            <Skeleton className="h-3 sm:h-4 w-5/6" variant="text" />

            <div className="mt-6 sm:mt-8 space-y-2">
              <Skeleton className="h-4 sm:h-5 w-1/2" variant="text" />
              <Skeleton className="h-3 sm:h-4 w-full" variant="text" />
              <Skeleton className="h-3 sm:h-4 w-full" variant="text" />
            </div>

            <div className="mt-4 sm:mt-6 space-y-2">
              <Skeleton className="h-4 sm:h-5 w-1/2" variant="text" />
              <Skeleton className="h-3 sm:h-4 w-11/12" variant="text" />
              <Skeleton className="h-3 sm:h-4 w-10/12" variant="text" />
            </div>
          </div>

          <footer className="border-t border-gray-200 px-4 sm:px-8 py-4 sm:py-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Skeleton className="h-3 sm:h-4 w-full sm:w-1/2" variant="text" />
              <div className="flex sm:space-x-4 space-y-2 sm:space-y-0 w-full sm:w-auto flex-col sm:flex-row">
                <Skeleton className="h-10 w-full sm:w-28" />
                <Skeleton className="h-10 w-full sm:w-36" />
              </div>
            </div>
          </footer>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <section
        aria-labelledby="blueprint-heading"
        className="bg-white rounded-lg shadow-lg"
      >
        <header className="border-b border-gray-200 px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2
              id="blueprint-heading"
              className="text-xl sm:text-2xl font-semibold text-gray-900"
            >
              Your Project Blueprint
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={handleCopy}
                variant="outline"
                fullWidth={false}
                aria-label="Copy blueprint to clipboard"
              >
                Copy to Clipboard
              </Button>
              <Button
                onClick={handleDownload}
                variant="primary"
                fullWidth={false}
                aria-label="Download blueprint as Markdown file"
              >
                Download Markdown
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          <div className="prose prose-sm sm:prose-lg max-w-none">
            <pre
              className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-gray-800 bg-gray-50 p-4 sm:p-6 rounded-lg overflow-x-auto"
              aria-label="Generated project blueprint content"
              tabIndex={0}
            >
              {blueprint}
            </pre>
          </div>
        </div>

        <footer className="border-t border-gray-200 px-4 sm:px-8 py-4 sm:py-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-xs sm:text-sm text-gray-600">
              Ready to start implementing? Share this blueprint with your team
              or keep it as your guide.
            </p>
            <div className="flex sm:space-x-4 space-y-2 sm:space-y-0 w-full sm:w-auto flex-col sm:flex-row">
              <Button
                variant="secondary"
                fullWidth={false}
                aria-label="Start over with a new idea"
                disabled
              >
                Start Over
              </Button>
              <Button
                variant="primary"
                fullWidth={false}
                aria-label="Export blueprint to project management tools"
                disabled
              >
                Export to Tools
              </Button>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default React.memo(BlueprintDisplayComponent);
