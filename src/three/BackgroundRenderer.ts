// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Three.js Background Renderer
// Singleton that manages a WebGL canvas placed BEHIND Phaser's
// canvas for a live 3D parallax environment layer.
//
// Architecture:
//   <div #game-container>
//     <canvas id="three-bg">   ← Three.js (z-index 0)
//     <canvas>                  ← Phaser  (z-index 1, created by Phaser)
//   </div>
//
// The Three.js renderer renders zone-specific procedural shader
// backgrounds at 3 parallax depths, synced each frame to
// Phaser's camera scrollX.
// ============================================================

import * as THREE from 'three';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import type { ZoneId } from '../game/types';
import { ParallaxLayer } from './ParallaxLayer';
import { ZONE_SHADERS } from './ZoneShaders';

export class BackgroundRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene3d: THREE.Scene;
  private camera3d: THREE.OrthographicCamera;
  private canvas: HTMLCanvasElement;
  private layers: ParallaxLayer[] = [];
  private time: number = 0;
  private visible: boolean = false;

  private static _instance: BackgroundRenderer | null = null;

  /** Singleton accessor */
  static getInstance(): BackgroundRenderer {
    if (!BackgroundRenderer._instance) {
      BackgroundRenderer._instance = new BackgroundRenderer();
    }
    return BackgroundRenderer._instance;
  }

  private constructor() {
    // Create canvas and insert before Phaser's canvas in the DOM
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'three-bg';
    Object.assign(this.canvas.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '0',
      pointerEvents: 'none',
    });

    const container = document.getElementById('game-container');
    if (container) {
      // Prepend so it sits BEHIND Phaser's canvas
      container.prepend(this.canvas);
    } else {
      document.body.prepend(this.canvas);
    }

    // Three.js WebGLRenderer on our canvas
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,          // transparent background so HTML/CSS shows through
      antialias: false,     // off for performance (we're doing full-screen quads)
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(GAME_WIDTH, GAME_HEIGHT);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Orthographic camera matching the Phaser game dimensions
    this.scene3d = new THREE.Scene();
    this.camera3d = new THREE.OrthographicCamera(
      -GAME_WIDTH / 2, GAME_WIDTH / 2,
       GAME_HEIGHT / 2, -GAME_HEIGHT / 2,
       0.1, 2000,
    );
    this.camera3d.position.z = 500;
  }

  // ── Zone setup ────────────────────────────────────────────────
  /**
   * Re-creates all parallax layers for the given zone.
   * Call once per level load.
   */
  setupZone(zoneId: ZoneId): void {
    // Dispose existing layers
    this.layers.forEach(l => l.dispose(this.scene3d));
    this.layers = [];

    const shaders = ZONE_SHADERS[zoneId];

    // Three layers: far (0.03), mid (0.12), near (0.30)
    // The planes are wider than the viewport so parallax shift stays filled.
    this.layers = [
      new ParallaxLayer(this.scene3d, GAME_WIDTH * 2.5, GAME_HEIGHT * 1.4, -400, 0.03,  shaders.far),
      new ParallaxLayer(this.scene3d, GAME_WIDTH * 1.8, GAME_HEIGHT * 1.2, -250, 0.12,  shaders.mid),
      new ParallaxLayer(this.scene3d, GAME_WIDTH * 1.4, GAME_HEIGHT * 1.0, -100, 0.30,  shaders.near),
    ];
  }

  // ── Per-frame update ──────────────────────────────────────────
  /**
   * Call every game frame with Phaser camera's current scrollX.
   * @param phaserScrollX  cameras.main.scrollX from LevelScene
   * @param deltaMs        frame delta in milliseconds
   */
  update(phaserScrollX: number, deltaMs: number): void {
    if (!this.visible || this.layers.length === 0) return;

    this.time += deltaMs * 0.001; // convert to seconds

    for (const layer of this.layers) {
      layer.update(phaserScrollX, this.time);
    }

    this.renderer.render(this.scene3d, this.camera3d);
  }

  // ── Visibility ────────────────────────────────────────────────
  show(): void {
    this.visible = true;
    this.canvas.style.display = 'block';
  }

  hide(): void {
    this.visible = false;
    this.canvas.style.display = 'none';
  }

  // ── Resize support ────────────────────────────────────────────
  resize(width: number, height: number): void {
    this.renderer.setSize(width, height, false);
    this.camera3d.left   = -width  / 2;
    this.camera3d.right  =  width  / 2;
    this.camera3d.top    =  height / 2;
    this.camera3d.bottom = -height / 2;
    this.camera3d.updateProjectionMatrix();
  }

  // ── Cleanup ───────────────────────────────────────────────────
  destroy(): void {
    this.layers.forEach(l => l.dispose(this.scene3d));
    this.layers = [];
    this.renderer.dispose();
    this.canvas.parentNode?.removeChild(this.canvas);
    BackgroundRenderer._instance = null;
  }
}
