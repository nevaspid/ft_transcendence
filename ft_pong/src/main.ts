import { fitCanvas } from './io/viewport';
import { pressed } from './io/keyboard';
import { Paddle } from './core/paddle';
import { Ball } from './core/ball';
import { step } from './core/physics';
import { drawScene } from './render/draw2d';
import { drawOverlay } from './render/hud';
import { create3DScene, loadShips, syncShips } from './render/render3d';
import { loadBall3D, syncBall3D, setupBallControls } from './render/render3dBall';
import { createGameField, loadStarDestroyerBackground, addBackgroundImage } from './render/render3dField';
import { createCamera, setupCameraControls } from './render/cam3d';

import {
  WORLD_W,
  WORLD_H,
  PADDLE_SPEED,
  WIN_SCORE,
  START_DELAY_SEC,
  ROUND_DELAY_SEC
} from './core/constants';

import type { GamePhase } from './core/types';

// === CONFIGURATION DOM ===
const wrapper = document.querySelector<HTMLDivElement>('.game-wrapper')!;
const hud = document.getElementById('hud')! as HTMLElement;
const scoreEl = document.getElementById('score')!;

// Canvas WebGL pour la 3D (derrière)
const webglCanvas = document.createElement('canvas');
webglCanvas.id = 'webgl';
webglCanvas.style.position = 'absolute';
webglCanvas.style.top = '0';
webglCanvas.style.left = '0';
webglCanvas.style.pointerEvents = 'none';
wrapper.appendChild(webglCanvas);

// Canvas 2D pour le jeu principal (devant)
const canvas = document.createElement('canvas');
canvas.id = 'game';
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
wrapper.appendChild(canvas);
const ctx = canvas.getContext('2d')!;

// === ENTITÉS DU JEU ===
const PADDLE_W = 15; // même valeur que Paddle.w
const left = new Paddle(PADDLE_W / 2, WORLD_H / 2);
const right = new Paddle(WORLD_W - PADDLE_W / 2, WORLD_H / 2);
const ball = new Ball(0, 0);

// === VARIABLES 3D ===
let engine3D: any = null;
let scene3D: any = null;
let camera3D: any = null;
let ships3D: { xwing: any; tie: any } | null = null;
let ball3D: any = null;
let field3D: any = null;

// === ÉTAT DU JEU ===
let scoreL = 0;
let scoreR = 0;
let phase: GamePhase = 'starting';
let countdown = START_DELAY_SEC;

// === FONCTIONS DU JEU ===
function updateScore(): void {
  scoreEl.textContent = `P1 : ${scoreL} | P2 : ${scoreR}`;
}

function setPhase(newPhase: GamePhase): void {
  phase = newPhase;
  switch (phase) {
    case 'starting':
      countdown = START_DELAY_SEC;
      break;
    case 'playing':
      ball.reset('random');
      break;
    case 'between':
      countdown = ROUND_DELAY_SEC;
      break;
    case 'gameover':
      break;
  }
}

function runGameplay(dt: number): void {
  // Mouvement des paddles
  if (pressed('z')) left.move(-PADDLE_SPEED * dt);
  if (pressed('s')) left.move(PADDLE_SPEED * dt);
  if (pressed('Z')) left.move(-PADDLE_SPEED * dt);
  if (pressed('S')) left.move(PADDLE_SPEED * dt);
  if (pressed('ArrowUp')) right.move(-PADDLE_SPEED * dt);
  if (pressed('ArrowDown')) right.move(PADDLE_SPEED * dt);

  // Physique de la balle
  const result = step(ball, left, right, dt);
  if (result === 'left') {
    scoreR++;
    updateScore();
    if (scoreR >= WIN_SCORE) {
      setPhase('gameover');
    } else {
      setPhase('between');
    }
  } else if (result === 'right') {
    scoreL++;
    updateScore();
    if (scoreL >= WIN_SCORE) {
      setPhase('gameover');
    } else {
      setPhase('between');
    }
  }
}

// === INITIALISATION 3D ===
async function init3D() {
  try {
    console.log('🎯 Initializing 3D...');
    
    // Créer la scène 3D
    const { engine, scene } = create3DScene(webglCanvas);
    engine3D = engine;
    scene3D = scene;

    // Créer la caméra
    camera3D = createCamera(scene);
    setupCameraControls(camera3D);
    
    // Créer le plateau de jeu
    field3D = createGameField(scene);
    
    // Charger les vaisseaux
    ships3D = await loadShips(scene);
    
    // Charger la balle 3D
    ball3D = await loadBall3D(scene);
    setupBallControls();
    
    // Charger le décor Star Destroyer en fond
    await loadStarDestroyerBackground(scene);
    
    // Ajouter l'image de fond (space.jpg)
    addBackgroundImage(scene, 'space.jpg');
    
    // Démarrer le rendu 3D
    engine.runRenderLoop(() => {
      if (ships3D) {
        syncShips(ships3D, left, right);
      }
      if (ball3D) {
        syncBall3D(ball3D, ball);
      }
      scene.render();
    });
    
    console.log('✅ 3D initialized');
  } catch (error) {
    console.error('❌ 3D initialization failed:', error);
  }
}

// === GESTION DES REDIMENSIONNEMENTS ===
window.addEventListener('resize', () => {
  fitCanvas(wrapper, hud, canvas);
  webglCanvas.width = canvas.width;
  webglCanvas.height = canvas.height;
  if (engine3D) {
    engine3D.resize();
  }
});

fitCanvas(wrapper, hud, canvas);
webglCanvas.width = canvas.width;
webglCanvas.height = canvas.height;

// Lancer la 3D
init3D();

// === BOUCLE DE JEU PRINCIPALE ===
let last = performance.now();

function loop(now: number = performance.now()): void {
  const dt = Math.min(now - last, 32) / 1000;
  last = now;

  countdown = Math.max(0, countdown - dt);

  // Logique de jeu
  switch (phase) {
    case 'starting':
      if (countdown === 0) setPhase('playing');
      break;
    case 'between':
      if (countdown === 0) setPhase('playing');
      break;
    case 'playing':
      runGameplay(dt);
      break;
    case 'gameover':
      break;
  }

  // Rendu 2D
  drawScene(ctx, canvas, left, right, ball);

  // Overlays
  if (phase === 'starting' || phase === 'between') {
    drawOverlay(ctx, canvas, Math.ceil(countdown).toString());
  }
  if (phase === 'gameover') {
    const winner = scoreL > scoreR ? 'Player 1 wins!' : 'Player 2 wins!';
    drawOverlay(ctx, canvas, winner);
  }

  requestAnimationFrame(loop);
}

// === INITIALISATION ===
console.log('🎮 Initializing Pong...');
updateScore();
loop();