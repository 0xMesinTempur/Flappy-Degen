// src/app/app.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk'
import ConnectMenu from '../components/ConnectMenu';
import { useAccount, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';

// --- KONSTANTA GAME (Sama seperti sebelumnya) ---
const GAME_WIDTH = 320;
const GAME_HEIGHT = 480;
const DEGEN_SIZE = 40;
const GRAVITY = 0.4;
const JUMP_STRENGTH = -7;
const PIPE_WIDTH = 52;
const PIPE_GAP = 140;
const PIPE_SPEED = 2.5;
const PIPE_SPAWN_INTERVAL = 1450; 
const DEGEN_X_POSITION = 60;

// --- Objek Suara ---
// Hapus: const jumpSound = new Audio('/jump.mp3');

// Tipe untuk state game agar lebih rapi
type GameState = 'MENU' | 'PLAYING' | 'GAME_OVER';

const App = () => {
  // --- STATE MANAGEMENT BARU ---
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // State untuk fisika game
  const [degenPosition, setDegenPosition] = useState(GAME_HEIGHT / 2);
  const [degenVelocity, setDegenVelocity] = useState(0);
  const [pipes, setPipes] = useState<Array<{x: number, topHeight: number, scored: boolean}>>([]);

  // --- PENAMBAHAN 1: Menghitung Poin dari High Score ---
  // Ini adalah state turunan, dihitung setiap render agar selalu sinkron.
  const points = Math.floor(highScore / 10);

  // Tambahkan state untuk modal donasi
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');

  // Wagmi hooks
  const { isConnected, address } = useAccount();
  const { sendTransaction, isPending } = useSendTransaction();

  useEffect(() => {
    // Memanggil fungsi ready dari dalam objek actions
    sdk.actions.ready();
  }, []); // Array dependensi bisa dikosongkan karena sdk sekarang adalah impor statis

  // --- EFEK UNTUK MEMUAT HIGH SCORE DARI LOCAL STORAGE ---
  useEffect(() => {
    const savedHighScore = localStorage.getItem('flappyDegenHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Ref untuk audio jump
  const jumpSoundRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inisialisasi audio hanya di client
    if (typeof window !== 'undefined') {
      jumpSoundRef.current = new window.Audio('/jump.mp3');
    }
  }, []);

  // --- FUNGSI-FUNGSI GAME ---
  const jump = useCallback(() => {
    if (gameState === 'PLAYING') {
      setDegenPosition(prev => Math.max(0, prev + JUMP_STRENGTH)); // Mencegah degen keluar dari atas layar
      setDegenVelocity(JUMP_STRENGTH);
      if (jumpSoundRef.current) {
        jumpSoundRef.current.currentTime = 0;
        jumpSoundRef.current.play();
      }
    }
  }, [gameState]);

  const startGame = useCallback(() => {
    setGameState('PLAYING');
    setScore(0);
    setDegenPosition(GAME_HEIGHT / 2);
    setDegenVelocity(0);
    setPipes([]);
    // Removed jump() call to prevent immediate fall due to gravity
  }, []);

  const returnToMenu = useCallback(() => {
    setGameState('MENU');
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState('GAME_OVER');
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('flappyDegenHighScore', score.toString());
    }
  }, [score, highScore]);

  // --- GAME LOOP UTAMA (Hanya berjalan saat gameState === 'PLAYING') ---
  useEffect(() => {
    let gameLoop: number;
    
    if (gameState === 'PLAYING') {
      gameLoop = requestAnimationFrame(() => {
        // Fisika Degen
        const newVelocity = degenVelocity + GRAVITY;
        const newPosition = degenPosition + newVelocity;
        setDegenVelocity(newVelocity);
        setDegenPosition(newPosition);

        // Gerakan Pipa & Scoring
        let scoredPipe = false;
        const newPipes = pipes.map(pipe => {
            const newPipeX = pipe.x - PIPE_SPEED;
            if (newPipeX + PIPE_WIDTH < DEGEN_X_POSITION && !pipe.scored) {
                scoredPipe = true;
                return { ...pipe, x: newPipeX, scored: true };
            }
            return { ...pipe, x: newPipeX };
        }).filter(pipe => pipe.x > -PIPE_WIDTH);

        if (scoredPipe) {
            setScore(prev => prev + 1);
        }
        
        setPipes(newPipes);
        
        // Deteksi Tabrakan
        if (newPosition > GAME_HEIGHT - DEGEN_SIZE || newPosition < 0) {
          handleGameOver();
          return;
        }

        for (let pipe of pipes) {
            const degenRight = DEGEN_X_POSITION + DEGEN_SIZE;
            const pipeRight = pipe.x + PIPE_WIDTH;
            if (degenRight > pipe.x && DEGEN_X_POSITION < pipeRight) {
                const hitTopPipe = newPosition < pipe.topHeight;
                const hitBottomPipe = newPosition + DEGEN_SIZE > pipe.topHeight + PIPE_GAP;
                if (hitTopPipe || hitBottomPipe) {
                    handleGameOver();
                    return;
                }
            }
        }
      });
    }

    return () => cancelAnimationFrame(gameLoop);
  }, [gameState, degenPosition, degenVelocity, pipes, handleGameOver]);

  // SPAWN PIPA BARU
  useEffect(() => {
    let pipeSpawner: NodeJS.Timeout;

    if (gameState === 'PLAYING') {
      pipeSpawner = setInterval(() => {
        const topHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
        setPipes(prev => [...prev, { x: GAME_WIDTH, topHeight, scored: false }]);
      }, PIPE_SPAWN_INTERVAL);
    }
    
    return () => clearInterval(pipeSpawner);
  }, [gameState]);
  
  // Refactor handleDonation agar pakai wagmi
  const handleDonation = async () => {
    try {
      if (!isConnected) {
        alert('Please connect your wallet first!');
        return;
      }
      if (!donationAmount || isNaN(Number(donationAmount)) || Number(donationAmount) <= 0) {
        alert('Please enter a valid amount');
        return;
      }
      // Kirim transaksi donasi
      sendTransaction({
        to: '0x96eF7ba758adDd3ba0FA46036E4eeaD4685f31Ee',
        value: parseEther(donationAmount),
      });
      setShowDonationModal(false);
      alert('Thank you for your donation!');
    } catch (error: any) {
      console.error('Donation error:', error);
      alert('Transaction failed: ' + (error.message || 'Please try again'));
    }
  };

  return (
    <div
      className="game-container"
      onClick={gameState === 'PLAYING' ? jump : undefined} // Hanya bisa jump saat bermain
      style={{
        width: `${GAME_WIDTH}px`,
        height: `${GAME_HEIGHT}px`,
      }}
    >
      {/* Tampilkan ConnectMenu hanya di menu utama */}
      {gameState === 'MENU' && (
        <div style={{
          position: 'absolute',
          top: 24,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 40,
        }}>
          <ConnectMenu />
        </div>
      )}
      {/* Latar Belakang & Elemen Game yang selalu ada */}
      <div className="game-background" />
      {gameState === 'PLAYING' && <div className="score-display">{score}</div>}
      {(gameState === 'PLAYING' || gameState === 'GAME_OVER') && (
        <>
          <img 
            src="/flappydegen.png" 
            alt="Flappy Degen" 
            className="degen"
            style={{ top: `${degenPosition}px`, left: `${DEGEN_X_POSITION}px`, width: `${DEGEN_SIZE}px`, height: `${DEGEN_SIZE}px` }}
          />
          {pipes.map((pipe, index) => (
            <React.Fragment key={index}>
              <div className="pipe" style={{ left: `${pipe.x}px`, top: 0, height: `${pipe.topHeight}px`, width: `${PIPE_WIDTH}px` }}/>
              <div className="pipe" style={{ left: `${pipe.x}px`, top: `${pipe.topHeight + PIPE_GAP}px`, height: `${GAME_HEIGHT - pipe.topHeight - PIPE_GAP}px`, width: `${PIPE_WIDTH}px` }}/>
            </React.Fragment>
          ))}
        </>
      )}
      {/* Tampilan Menu Awal */}
      {gameState === 'MENU' && (
        <div className="menu-overlay">
          <div className="menu-box" style={{
            background: 'rgba(255,255,255,0.85)',
            boxShadow: '0 8px 32px 0 rgba(38, 50, 56, 0.25)',
            border: '1px solid rgba(123,47,247,0.15)',
            borderRadius: '22px',
            padding: '28px 16px 22px 16px',
            minWidth: 220,
            maxWidth: 250,
            marginTop: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
          }}>
            <h1 className="flappy-title" style={{
              fontSize: '0.95rem', // lebih kecil
              fontWeight: 900,
              color: '#7b2ff7',
              marginBottom: 2,
              marginTop: 16, // tambahkan jarak ke bawah
              letterSpacing: 1.2,
              textShadow: '0 2px 8px #f357a8aa',
              textAlign: 'center',
              lineHeight: 1.1,
            }}>Flappy Degen</h1>
            <div style={{
              fontSize: '0.5rem', // lebih kecil
              color: '#f357a8',
              fontWeight: 700,
              marginBottom: 14,
              marginTop: 2,
              textAlign: 'center',
              lineHeight: 1.2,
            }}>
              Fly, Score, and Degen on Base!
            </div>
            <button className="button-main" onClick={startGame} style={{
              fontSize: '1rem',
              padding: '12px 20px',
              margin: '14px 0 10px 0',
              borderRadius: '10px',
              background: 'linear-gradient(90deg, #7b2ff7 0%, #f357a8 100%)',
              boxShadow: '0 4px 12px #7b2ff744',
            }}>Let's Degen!</button>
            <div className="score-info" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              marginTop: '10px',
              marginBottom: '6px',
              padding: '10px 8px',
              borderRadius: '8px',
              backgroundColor: '#f3e8ff',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              fontWeight: '700',
              fontSize: '1rem',
              color: '#5a189a',
              boxShadow: '0 2px 8px rgba(90, 24, 154, 0.10)'
            }}>
              <h2 style={{ margin: 0, color: '#7b2ff7', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span role="img" aria-label="trophy">🏆</span> High Score: {highScore}
              </h2>
              <h2 style={{ margin: 0, color: '#9d4edd', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span role="img" aria-label="star">⭐</span> Points: {points}
              </h2>
              <p style={{ margin: 0, fontStyle: 'italic', color: '#6a4c93', fontSize: '0.95rem' }}>Enjoying the game?</p>
              <button
                className="button-secondary"
                style={{
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  backgroundColor: '#7b2ff7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  marginTop: 4,
                  transition: 'background-color 0.3s ease',
                }}
                onClick={() => setShowDonationModal(true)}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#9d4edd';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#7b2ff7';
                }}
              >
                Buy me a coffee ☕
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Tampilan Game Over */}
      {gameState === 'GAME_OVER' && (
         <div className="menu-overlay">
          <div className="menu-box">
            <h1>Game Over</h1>
            <h2>Your Score: {score}</h2>
            <h3>High Score: {highScore}</h3>
            <button className="button-main" onClick={returnToMenu}>Return to Menu</button>
          </div>
        </div>
      )}
      {/* Modal Donasi */}
      {showDonationModal && (
        <div className="menu-overlay" onClick={() => setShowDonationModal(false)}>
          <div className="menu-box" onClick={e => e.stopPropagation()} style={{ padding: '20px', maxWidth: '300px' }}>
            <h2 style={{ marginBottom: '15px' }}>Support the Developer</h2>
            <p style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isConnected ? (
                <>
                  <span style={{ color: '#22c55e' }}>●</span>
                  Wallet Connected
                </>
              ) : (
                <>
                  <span style={{ color: '#cbd5e1' }}>●</span>
                  Wallet Not Connected
                </>
              )}
            </p>
            <p style={{ marginBottom: '15px' }}>Enter amount in ETH (Base Network)</p>
            <input
              type="number"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              placeholder="0.01"
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '15px',
                borderRadius: '4px',
                border: '1px solid #7b2ff7'
              }}
              min="0"
              step="0.01"
            />
            <button
              className="button-main"
              onClick={handleDonation}
              style={{ marginRight: '10px' }}
              disabled={!isConnected || isPending}
            >
              {isPending ? 'Processing...' : 'Donate'}
            </button>
            <button
              className="button-secondary"
              onClick={() => setShowDonationModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;