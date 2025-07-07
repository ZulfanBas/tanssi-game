import React, { useState } from 'react';

function TutorialSection() {
  const [activeSection, setActiveSection] = useState('basics');

  const sections = {
    basics: {
      title: 'Game Basics',
      content: [
        { icon: '🎵', title: 'Follow the Beat', desc: 'Tap in rhythm with the music to score points' },
        { icon: '🌀', title: 'Deploy = Spin', desc: 'When you see Deploy, the mascot will spin' },
        { icon: '↔️', title: 'Sync = Slide', desc: 'Sync Node makes the mascot slide left and right' },
        { icon: '⬆️', title: 'Launch = Jump', desc: 'Launch RPC triggers an epic jump move' }
      ]
    },
    scoring: {
      title: 'Scoring System',
      content: [
        { icon: '🎯', title: 'Perfect Timing', desc: '100 points + combo multiplier' },
        { icon: '👍', title: 'Good Timing', desc: '50 points + combo multiplier' },
        { icon: '❌', title: 'Miss', desc: 'No points, combo resets, health decreases' },
        { icon: '🔥', title: 'Combo Bonus', desc: 'Every 10 hits increases your multiplier' }
      ]
    },
    web3: {
      title: 'Web3 Learning',
      content: [
        { icon: '🚀', title: 'Deploy', desc: 'Launch your appchain on Tanssi network' },
        { icon: '🔄', title: 'Sync Node', desc: 'Keep your blockchain synchronized' },
        { icon: '🌐', title: 'Launch RPC', desc: 'Enable API access for your appchain' },
        { icon: '⚡', title: 'Automation', desc: 'Tanssi handles infrastructure automatically' }
      ]
    },
    battle: {
      title: 'Battle Mode',
      content: [
        { icon: '🤖', title: 'Legacy Bot', desc: 'Slow, laggy, represents old infrastructure' },
        { icon: '⚔️', title: 'Dance Battle', desc: 'Hit perfect timing to damage the legacy bot' },
        { icon: '🏆', title: 'Victory', desc: 'Reduce legacy bot health to 0 to win' },
        { icon: '💪', title: 'Tanssi Power', desc: 'Show how modern infrastructure wins' }
      ]
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
          How to Dance with Tanssi
        </h2>
        <p className="text-gray-300 text-lg">
          Master the rhythm and learn Web3 infrastructure along the way
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {Object.entries(sections).map(([key, section]) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeSection === key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      {/* Active Section Content */}
      <div className="glass-morphism rounded-xl p-6">
        <h3 className="text-2xl font-bold text-purple-400 mb-6 text-center">
          {sections[activeSection].title}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections[activeSection].content.map((item, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-all">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-gray-300">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 glass-morphism rounded-xl p-6">
        <h3 className="text-xl font-bold text-green-400 mb-4 text-center">Pro Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-2">🎧</div>
            <div className="font-medium">Use Headphones</div>
            <div className="text-gray-400">Better audio timing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📱</div>
            <div className="font-medium">Mobile Friendly</div>
            <div className="text-gray-400">Optimized for touch</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📹</div>
            <div className="font-medium">Share Clips</div>
            <div className="text-gray-400">Perfect for TikTok</div>
          </div>
        </div>
      </div>

      {/* Web3 Education */}
      <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-center mb-4">Why Tanssi?</h3>
        <div className="text-center text-gray-300 space-y-2">
          <p>🚀 <strong>Deploy in Minutes:</strong> Launch your appchain without complex setup</p>
          <p>🔄 <strong>Auto-Sync:</strong> Blockchain synchronization handled automatically</p>
          <p>🌐 <strong>Instant RPC:</strong> API endpoints ready out of the box</p>
          <p>⚡ <strong>No DevOps:</strong> Focus on your dApp, not infrastructure</p>
        </div>
      </div>
    </div>
  );
}

window.TutorialSection = TutorialSection;