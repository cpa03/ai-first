'use client';

import { useState } from 'react';
import { exportManager, ExportConnector } from '@/lib/exports';

interface ExportOptionsProps {
  data: any;
  onExportComplete?: (result: {
    success: boolean;
    url?: string;
    error?: string;
  }) => void;
}

export default function ExportOptions({
  data,
  onExportComplete,
}: ExportOptionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedConnector, setSelectedConnector] =
    useState<ExportConnector | null>(null);

  const availableConnectors = exportManager.getAvailableConnectors();

  const handleExport = async (connector: ExportConnector) => {
    setLoading(connector.type);
    setAuthUrl(null);

    try {
      // Validate configuration first
      const isValid = await connector.validateConfig();
      if (!isValid) {
        // Need authentication
        if (connector.getAuthUrl) {
          const url = await connector.getAuthUrl();
          setAuthUrl(url);
          setSelectedConnector(connector);
          setShowAuthModal(true);
          setLoading(null);
          return;
        } else {
          throw new Error(`${connector.name} is not properly configured`);
        }
      }

      // Perform export
      const result = await exportManager.export({
        type: connector.type as any,
        data,
      });

      if (onExportComplete) {
        onExportComplete(result);
      }
    } catch (error) {
      if (onExportComplete) {
        onExportComplete({
          success: false,
          error: error instanceof Error ? error.message : 'Export failed',
        });
      }
    } finally {
      setLoading(null);
    }
  };

  const handleAuth = () => {
    if (authUrl) {
      // Open auth URL in new window
      const width = 500;
      const height = 600;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;

      window.open(
        authUrl,
        'auth',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      // Poll for auth completion (in a real implementation, this would be handled by a callback)
      const checkAuth = setInterval(async () => {
        try {
          if (selectedConnector) {
            const isValid = await selectedConnector.validateConfig();
            if (isValid) {
              clearInterval(checkAuth);
              setShowAuthModal(false);
              setAuthUrl(null);
              // Retry export
              handleExport(selectedConnector);
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }, 2000);

      // Timeout after 5 minutes
      setTimeout(() => clearInterval(checkAuth), 300000);
    }
  };

  const getConnectorIcon = (type: string) => {
    switch (type) {
      case 'markdown':
        return '📝';
      case 'json':
        return '📄';
      case 'notion':
        return '🎯';
      case 'trello':
        return '📋';
      case 'github-projects':
        return '🐙';
      case 'google-tasks':
        return '✅';
      default:
        return '📤';
    }
  };

  const getConnectorDescription = (type: string) => {
    switch (type) {
      case 'markdown':
        return 'Download as Markdown file';
      case 'json':
        return 'Export as structured JSON';
      case 'notion':
        return 'Create pages in Notion workspace';
      case 'trello':
        return 'Generate Trello board and cards';
      case 'github-projects':
        return 'Create GitHub issues and milestones';
      case 'google-tasks':
        return 'Sync to Google Tasks';
      default:
        return 'Export data';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Export Your Blueprint
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableConnectors.map((connector) => (
          <div
            key={connector.type}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">
                {getConnectorIcon(connector.type)}
              </span>
              <h3 className="font-medium text-gray-900">{connector.name}</h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {getConnectorDescription(connector.type)}
            </p>

            <button
              onClick={() => handleExport(connector)}
              disabled={loading === connector.type}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === connector.type
                ? 'Exporting...'
                : `Export to ${connector.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Authentication Modal */}
      {showAuthModal && authUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Authenticate with {selectedConnector?.name}
            </h3>

            <p className="text-gray-600 mb-6">
              You need to authorize IdeaFlow to access your{' '}
              {selectedConnector?.name} account to export your project.
            </p>

            <div className="flex space-x-4">
              <button onClick={handleAuth} className="flex-1 btn btn-primary">
                Authorize
              </button>

              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthUrl(null);
                  setSelectedConnector(null);
                }}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
