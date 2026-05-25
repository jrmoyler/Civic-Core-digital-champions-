// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Entry Point
// ============================================================

import Phaser from 'phaser';
import { gameConfig } from './game/config';

// Bootstrap the game
window.addEventListener('load', () => {
  try {
    const game = new Phaser.Game(gameConfig);

    // Prevent default touch behaviors that interfere with mobile gameplay
    document.addEventListener('touchstart', (e) => { e.preventDefault(); }, { passive: false });
    document.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive: false });
    document.addEventListener('contextmenu', (e) => { e.preventDefault(); });

    // Global error handler — keep game running
    window.addEventListener('error', (event) => {
      console.error('[CIVIC CORE] Uncaught error:', event.error);
    });

    // Expose for debugging
    (window as unknown as Record<string, unknown>).__civicCore = game;

    console.log('%c CIVIC CORE: DIGITAL CHAMPIONS ', 'background:#0a0a1a;color:#4A90D9;font-size:16px;padding:4px;');
    console.log('%c Debug: Press G to toggle collision overlay ', 'color:#00CC66;');
    console.log('%c Controls: WASD/Arrows=Move, SPACE=Jump, J=Attack, K=Ability, P=Pause, M=Map ', 'color:#888;');

  } catch (err) {
    console.error('[CIVIC CORE] Failed to initialize game:', err);
    document.getElementById('game-container')!.innerHTML = `
      <div style="color:#FF4444;padding:40px;font-family:monospace;text-align:center;">
        <h2>⚠ Game failed to initialize</h2>
        <p>Please check the console for errors.</p>
        <p>Make sure you ran: <code>npm install</code></p>
        <p>Then: <code>npm run dev</code></p>
        <p style="color:#666;margin-top:20px;">Error: ${err instanceof Error ? err.message : String(err)}</p>
      </div>
    `;
  }
});
