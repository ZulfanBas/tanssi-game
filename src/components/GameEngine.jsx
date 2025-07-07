import React, { useState, useEffect, useRef, useCallback } from 'react';

const DANCE_MOVES = {
  deploy: { name: 'Deploy', action: 'Spin', animation: 'dance-spin', color: 'from-purple-500 to-pink-500' },
  sync: { name: 'Sync Node', action: 'Slide', animation: 'dance-slide', color: 'from-blue-500 to-cyan-500' },
  launch: { name: 'Launch RPC', action: 'Jump', animation: 'dance-jump', color: 'from-green-500 to-emerald-500' }
};

const DIFFICULTY_LEVELS = {
  easy: { bpm: 80, tolerance: 300 },
  medium: { bpm: 120, tolerance: 200 },
  hard: { bpm: 160, tolerance: 150 },
  expert: { bpm: 200, tolerance: 100 }
};

function GameEngine() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver, battle
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [currentMove, setCurrentMove] = useState(null);
  const [nextMoves, setNextMoves] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [health, setHealth] = useState(100);
  const [perfectHits, setPerfectHits] = useState(0);
  const [goodHits, setGoodHits] = useState(0);
  const [missedHits, setMissedHits] = useState(0);
  const [isBattleMode, setIsBattleMode] = useState(false);
  const [legacyBotHealth, setLegacyBotHealth] = useState(100);
  const [showScorePopup, setShowScorePopup] = useState(null);
  const [mascotAnimation, setMascotAnimation] = useState('');
  const [isGlitching, setIsGlitching] = useState(false);
  const [beatIndicator, setBeatIndicator] = useState(false);

  const gameLoopRef = useRef();
  const beatTimerRef = useRef();
  const moveQueueRef = useRef([]);
  const lastBeatRef = useRef(0);
  const audioContextRef = useRef();
  const gameStartTimeRef = useRef(0);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
    };
    
    document.addEventListener('touchstart', initAudio, { once: true });
    document.addEventListener('click', initAudio, { once: true });
    
    return () => {
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('click', initAudio);
    };
  }, []);

  // Generate beat sound
  const playBeatSound = useCallback((frequency = 440, duration = 0.1) => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  }, []);

  // Generate random move sequence
  const generateMoveSequence = useCallback(() => {
    const moves = Object.keys(DANCE_MOVES);
    const sequence = [];
    for (let i = 0; i < 8; i++) {
      sequence.push(moves[Math.floor(Math.random() * moves.length)]);
    }
    return sequence;
  }, []);

  // Start game
  const startGame = useCallback((battleMode = false) => {
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHealth(100);
    setPerfectHits(0);
    setGoodHits(0);
    setMissedHits(0);
    setIsBattleMode(battleMode);
    setLegacyBotHealth(battleMode ? 100 : 0);
    setIsGlitching(false);
    
    const initialSequence = generateMoveSequence();
    moveQueueRef.current = [...initialSequence];
    setNextMoves(initialSequence.slice(1, 4));
    setCurrentMove(initialSequence[0]);
    
    gameStartTimeRef.current = Date.now();
    lastBeatRef.current = Date.now();
    
    // Start beat timer
    const { bpm } = DIFFICULTY_LEVELS[difficulty];
    const beatInterval = (60 / bpm) * 1000;
    
    beatTimerRef.current = setInterval(() => {
      setBeatIndicator(true);
      playBeatSound(220, 0.1);
      setTimeout(() => setBeatIndicator(false), 100);
      lastBeatRef.current = Date.now();
    }, beatInterval);
    
  }, [difficulty, generateMoveSequence, playBeatSound]);

  // Handle tap
  const handleTap = useCallback(() => {
    if (gameState !== 'playing' || !currentMove) return;
    
    const now = Date.now();
    const timeSinceLastBeat = now - lastBeatRef.current;
    const { bpm, tolerance } = DIFFICULTY_LEVELS[difficulty];
    const beatInterval = (60 / bpm) * 1000;
    const nextBeatTime = beatInterval - timeSinceLastBeat;
    const timingError = Math.min(timeSinceLastBeat, nextBeatTime);
    
    let hitType = 'miss';
    let points = 0;
    let comboMultiplier = Math.floor(combo / 10) + 1;
    
    if (timingError <= tolerance * 0.3) {
      hitType = 'perfect';
      points = 100 * comboMultiplier;
      setPerfectHits(prev => prev + 1);
      setCombo(prev => prev + 1);
      playBeatSound(440, 0.2);
    } else if (timingError <= tolerance * 0.7) {
      hitType = 'good';
      points = 50 * comboMultiplier;
      setGoodHits(prev => prev + 1);
      setCombo(prev => prev + 1);
      playBeatSound(330, 0.15);
    } else {
      hitType = 'miss';
      setMissedHits(prev => prev + 1);
      setCombo(0);
      setHealth(prev => Math.max(0, prev - 10));
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 300);
      playBeatSound(110, 0.3);
    }
    
    // Update score and show popup
    if (points > 0) {
      setScore(prev => prev + points);
      setShowScorePopup({ type: hitType, points });
      setTimeout(() => setShowScorePopup(null), 1000);
    }
    
    // Update max combo
    setMaxCombo(prev => Math.max(prev, combo + (hitType !== 'miss' ? 1 : 0)));
    
    // Perform dance animation
    const move = DANCE_MOVES[currentMove];
    setMascotAnimation(move.animation);
    setTimeout(() => setMascotAnimation(''), 800);
    
    // Battle mode: damage legacy bot on good hits
    if (isBattleMode && hitType !== 'miss') {
      const damage = hitType === 'perfect' ? 15 : 8;
      setLegacyBotHealth(prev => Math.max(0, prev - damage));
    }
    
    // Move to next move
    moveQueueRef.current.shift();
    if (moveQueueRef.current.length < 3) {
      const newMoves = generateMoveSequence();
      moveQueueRef.current.push(...newMoves);
    }
    
    setCurrentMove(moveQueueRef.current[0]);
    setNextMoves(moveQueueRef.current.slice(1, 4));
    
    // Check game over conditions
    if (health <= 10 && hitType === 'miss') {
      endGame();
    } else if (isBattleMode && legacyBotHealth <= 0) {
      endGame(true);
    }
    
  }, [gameState, currentMove, difficulty, combo, health, isBattleMode, legacyBotHealth, generateMoveSequence, playBeatSound]);

  // End game
  const endGame = useCallback((victory = false) => {
    setGameState('gameOver');
    clearInterval(beatTimerRef.current);
    
    if (isBattleMode && victory) {
      setScore(prev => prev + 1000); // Victory bonus
    }
  }, [isBattleMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(beatTimerRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Menu Screen
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20"></div>
        
        <div className="relative z-10 text-center max-w-md mx-auto">
          <div className="mb-8">
            <img 
              src="/assets/tanssi-mascot.webp" 
              alt="Tanssi Mascot" 
              className="w-32 h-32 mx-auto mb-4 animate-bounce"
            />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Dance with Tanssi
            </h1>
            <p className="text-gray-300 text-lg">
              Master the rhythm of Web3 infrastructure
            </p>
          </div>

          <div className="glass-morphism rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Choose Difficulty</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(DIFFICULTY_LEVELS).map(([level, config]) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`p-3 rounded-lg transition-all ${
                    difficulty === level 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium capitalize">{level}</div>
                  <div className="text-sm opacity-75">{config.bpm} BPM</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => startGame(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105"
            >
              Start Dancing
            </button>
            
            <button
              onClick={() => startGame(true)}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105"
            >
              Battle Legacy Bot
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Over Screen
  if (gameState === 'gameOver') {
    const accuracy = perfectHits + goodHits + missedHits > 0 
      ? Math.round(((perfectHits + goodHits) / (perfectHits + goodHits + missedHits)) * 100)
      : 0;
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-morphism rounded-xl p-8 max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            {isBattleMode && legacyBotHealth <= 0 ? '🎉 Victory!' : 'Game Over'}
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between">
              <span>Final Score:</span>
              <span className="font-bold text-purple-400">{score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Max Combo:</span>
              <span className="font-bold text-blue-400">{maxCombo}</span>
            </div>
            <div className="flex justify-between">
              <span>Accuracy:</span>
              <span className="font-bold text-green-400">{accuracy}%</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
              <div className="text-center">
                <div className="text-green-400 font-bold">{perfectHits}</div>
                <div>Perfect</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold">{goodHits}</div>
                <div>Good</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-bold">{missedHits}</div>
                <div>Miss</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setGameState('menu')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Back to Menu
            </button>
            <button
              onClick={() => startGame(isBattleMode)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing Screen
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-green-900/30"></div>
      
      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-4 glass-morphism">
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <div className="text-purple-400 font-bold">{score.toLocaleString()}</div>
            <div className="text-xs opacity-75">Score</div>
          </div>
          <div className="text-sm">
            <div className={`font-bold ${combo > 10 ? 'text-green-400 combo-glow' : 'text-blue-400'}`}>
              {combo}x
            </div>
            <div className="text-xs opacity-75">Combo</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {isBattleMode && (
            <div className="text-sm text-center">
              <div className="text-red-400 font-bold">{legacyBotHealth}%</div>
              <div className="text-xs opacity-75">Legacy Bot</div>
            </div>
          )}
          <div className="text-sm text-center">
            <div className="text-green-400 font-bold">{health}%</div>
            <div className="text-xs opacity-75">Health</div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {/* Beat Indicator */}
        <div className={`absolute top-8 w-16 h-16 rounded-full border-4 border-purple-400 transition-all ${
          beatIndicator ? 'scale-125 bg-purple-400/30' : 'scale-100'
        }`}></div>

        {/* Characters */}
        <div className="flex items-center justify-center space-x-8 mb-8">
          {isBattleMode && (
            <div className="text-center">
              <img 
                src="/assets/legacy-bot.webp" 
                alt="Legacy Bot" 
                className={`w-24 h-24 mx-auto mb-2 ${legacyBotHealth > 0 ? 'legacy-lag' : 'opacity-50'}`}
              />
              <div className="text-sm text-gray-400">Legacy Bot</div>
              <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${legacyBotHealth}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <img 
              src="/assets/tanssi-mascot.webp" 
              alt="Tanssi Mascot" 
              className={`w-32 h-32 mx-auto mb-2 transition-all ${mascotAnimation} ${
                isGlitching ? 'glitch-effect' : ''
              }`}
            />
            <div className="text-sm text-purple-400 font-medium">Tanssi</div>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${health}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Current Move */}
        {currentMove && (
          <div className="text-center mb-8">
            <div className={`text-6xl mb-2 ${beatIndicator ? 'beat-pulse' : ''}`}>
              {currentMove === 'deploy' ? '🌀' : currentMove === 'sync' ? '↔️' : '⬆️'}
            </div>
            <div className={`text-2xl font-bold bg-gradient-to-r ${DANCE_MOVES[currentMove].color} bg-clip-text text-transparent`}>
              {DANCE_MOVES[currentMove].name}
            </div>
            <div className="text-lg text-gray-300">
              {DANCE_MOVES[currentMove].action}
            </div>
          </div>
        )}

        {/* Next Moves Preview */}
        <div className="flex space-x-4 mb-8">
          {nextMoves.slice(0, 3).map((move, index) => (
            <div key={index} className="text-center opacity-50">
              <div className="text-2xl">
                {move === 'deploy' ? '🌀' : move === 'sync' ? '↔️' : '⬆️'}
              </div>
              <div className="text-xs">{DANCE_MOVES[move].action}</div>
            </div>
          ))}
        </div>

        {/* Tap Zone */}
        <button
          onClick={handleTap}
          className="tap-zone w-64 h-64 rounded-full glass-morphism flex items-center justify-center text-2xl font-bold transition-all active:scale-95"
        >
          TAP TO DANCE
        </button>

        {/* Score Popup */}
        {showScorePopup && (
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 score-pop text-2xl font-bold ${
            showScorePopup.type === 'perfect' ? 'text-green-400' : 
            showScorePopup.type === 'good' ? 'text-blue-400' : 'text-red-400'
          }`}>
            {showScorePopup.type === 'perfect' ? 'PERFECT!' : 
             showScorePopup.type === 'good' ? 'GOOD!' : 'MISS!'}
            {showScorePopup.points > 0 && (
              <div className="text-lg">+{showScorePopup.points}</div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 p-4 glass-morphism text-center">
        <div className="text-sm text-gray-400 mb-2">
          Learning: {currentMove ? DANCE_MOVES[currentMove].name : 'Web3 Infrastructure'} 
          {isBattleMode ? ' | Battle Mode' : ''}
        </div>
        <button
          onClick={() => setGameState('menu')}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          Pause Game
        </button>
      </div>
    </div>
  );
}

window.GameEngine = GameEngine;