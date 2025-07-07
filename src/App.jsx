import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentView, setCurrentView] = useState('game'); // game, tutorial
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState(null);

  useEffect(() => {
    const checkDependencies = () => {
      if (
        window.GameEngine &&
        window.TutorialSection &&
        window.ShareModal
      ) {
        setIsReady(true);
      }
    };

    checkDependencies();
    const interval = setInterval(checkDependencies, 100);
    return () => clearInterval(interval);
  }, []);

  const handleShare = (score, combo, accuracy) => {
    setShareData({ score, combo, accuracy });
    setShowShareModal(true);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
        <p className="text-white text-lg">Loading Dance with Tanssi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass-morphism">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src="/assets/tanssi-mascot.webp" 
                alt="Tanssi" 
                className="w-8 h-8"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Dance with Tanssi
              </h1>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentView('game')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentView === 'game'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                Game
              </button>
              <button
                onClick={() => setCurrentView('tutorial')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentView === 'tutorial'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                Tutorial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        {currentView === 'game' && (
          <div className="h-screen overflow-y-auto">
            <window.GameEngine onShare={handleShare} />
          </div>
        )}
        
        {currentView === 'tutorial' && (
          <div className="overflow-y-auto py-8">
            <window.TutorialSection />
          </div>
        )}
      </main>

      {/* Share Modal */}
      {shareData && (
        <window.ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          score={shareData.score}
          combo={shareData.combo}
          accuracy={shareData.accuracy}
        />
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 glass-morphism">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-400">
              Learn Web3 infrastructure through rhythm gaming
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="https://tanssi.network" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Tanssi Network
              </a>
              <button
                onClick={() => setCurrentView('tutorial')}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                How to Play
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

React.createElement(App, null)
