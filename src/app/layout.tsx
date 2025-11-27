import '../styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IdeaFlow - Turn Ideas into Action Plans',
  description:
    'Transform your raw ideas into production-ready plans with AI-powered clarification and task breakdown.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    IdeaFlow
                  </h1>
                </div>
                <nav className="flex space-x-8">
                  <a
                    href="/"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Home
                  </a>
                  <a
                    href="/clarify"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Clarify
                  </a>
                  <a
                    href="/results"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Results
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <p className="text-center text-sm text-gray-500">
                © 2025 IdeaFlow. Turn ideas into action.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
