import React, { useState, useRef } from 'react';

function ShareModal({ isOpen, onClose, score, combo, accuracy }) {
  const [shareText, setShareText] = useState('');
  const canvasRef = useRef();

  const generateShareImage = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 1080;
    canvas.height = 1080;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Dance with Tanssi', canvas.width / 2, 150);
    
    // Score
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 96px Arial';
    ctx.fillText(score.toLocaleString(), canvas.width / 2, 300);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px Arial';
    ctx.fillText('Score', canvas.width / 2, 360);
    
    // Stats
    ctx.font = '36px Arial';
    ctx.fillText(`${combo}x Max Combo`, canvas.width / 2, 450);
    ctx.fillText(`${accuracy}% Accuracy`, canvas.width / 2, 500);
    
    // Call to action
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 42px Arial';
    ctx.fillText('Master Web3 Infrastructure', canvas.width / 2, 600);
    ctx.fillText('Through Rhythm Gaming!', canvas.width / 2, 660);
    
    // Hashtags
    ctx.fillStyle = '#9ca3af';
    ctx.font = '32px Arial';
    ctx.fillText('#DanceWithTanssi #Web3Gaming #TanssiNetwork', canvas.width / 2, 750);
    
    return canvas.toDataURL('image/png');
  };

  const shareToSocial = async (platform) => {
    const imageData = await generateShareImage();
    const text = `Just scored ${score.toLocaleString()} points in Dance with Tanssi! 🕺💃 
    
Max Combo: ${combo}x
Accuracy: ${accuracy}%

Learning Web3 infrastructure through rhythm gaming! 🚀

#DanceWithTanssi #Web3Gaming #TanssiNetwork #RhythmGame`;

    switch (platform) {
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, '_blank');
        break;
        
      case 'copy':
        try {
          await navigator.clipboard.writeText(text);
          alert('Score copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        break;
        
      case 'download':
        const link = document.createElement('a');
        link.download = `dance-with-tanssi-score-${score}.png`;
        link.href = imageData;
        link.click();
        break;
        
      default:
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-morphism rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-purple-400">Share Your Score</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Score Preview */}
        <div className="text-center mb-6 p-4 bg-gray-800/50 rounded-lg">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {score.toLocaleString()}
          </div>
          <div className="text-sm text-gray-300 space-y-1">
            <div>Max Combo: {combo}x</div>
            <div>Accuracy: {accuracy}%</div>
          </div>
        </div>
        
        {/* Share Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => shareToSocial('twitter')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
          >
            <span>🐦</span>
            <span>Share on Twitter</span>
          </button>
          
          <button
            onClick={() => shareToSocial('download')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
          >
            <span>📱</span>
            <span>Download Image</span>
          </button>
          
          <button
            onClick={() => shareToSocial('copy')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
          >
            <span>📋</span>
            <span>Copy Score Text</span>
          </button>
        </div>
        
        {/* Hidden canvas for image generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {/* Tips */}
        <div className="mt-6 text-xs text-gray-400 text-center">
          <p>💡 Perfect for TikTok, Instagram Stories, and Twitter!</p>
          <p>Tag @TanssiNetwork to get featured</p>
        </div>
      </div>
    </div>
  );
}

window.ShareModal = ShareModal;