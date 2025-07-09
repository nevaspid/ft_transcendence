import { fitCanvas } from './io/viewport';
import { pressed } from './io/keyboard';
import { Paddle } from './core/paddle';
import { Ball } from './core/ball';
import { step } from './core/physics';
import { drawScene } from './render/draw2d';
import { drawOverlay } from './render/hud';
import { checkBallCount, loadBall3D , syncBall3D , /*addBallEffects*/ } from './render/render3dBall';

// === IMPORTS 3D ===
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { 
  createBabylonScene,
  loadStarWarsShips,
  syncStarWarsShips 
} from './render/render3dPaddle';

import {
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

// Canvas WebGL pour Babylon.js (derrière)
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
canvas.style.pointerEvents = 'none';
wrapper.appendChild(canvas);
const ctx = canvas.getContext('2d')!;

// === ENTITÉS DU JEU ===
const left = new Paddle(30, WORLD_H / 2);
const right = new Paddle(770, WORLD_H / 2);
const ball = new Ball(0, 0);

// === VARIABLES 3D ===
let babylonEngine: BABYLON.Engine | null = null;
let babylonScene: BABYLON.Scene | null = null;
let starWarsShips: { leftShip: BABYLON.Mesh; rightShip: BABYLON.Mesh } | null = null;
let ball3D: BABYLON.Mesh | null = null;

// === ÉTAT DU JEU ===
let scoreL = 0;
let scoreR = 0;
let phase: GamePhase = 'starting';
let countdown = START_DELAY_SEC;

// === FONCTIONS DU JEU ===
function updateScore(): void {
  scoreEl.textContent = `P1 : ${scoreL} | P2 : ${scoreR}`;
}

function setPhase(newPhase: GamePhase, delaySec = 0): void {
  phase = newPhase;
  countdown = delaySec;
}

function newRound(dir: 'left' | 'right' | 'random'): void {
  ball.reset(dir);
  setPhase('between', ROUND_DELAY_SEC);
}

function runGameplay(dt: number): void {
  const dy = PADDLE_SPEED * dt;
  if (pressed('s')) left.move(+dy);
  if (pressed('z')) left.move(-dy);
  if (pressed('ArrowDown')) right.move(+dy);
  if (pressed('ArrowUp')) right.move(-dy);

  const point = step(ball, left, right, dt);
  if (point === 'left') { scoreR++; afterPoint('left'); }
  if (point === 'right') { scoreL++; afterPoint('right'); }
}

function afterPoint(outSide: 'left' | 'right'): void {
  updateScore();
  if (scoreL >= WIN_SCORE || scoreR >= WIN_SCORE) {
    setPhase('gameover');
  } else {
    newRound(outSide);
  }
}

// === GESTION DES REDIMENSIONNEMENTS ===
window.addEventListener('resize', () => {
  fitCanvas(wrapper, hud, canvas);
  webglCanvas.width = canvas.width;
  webglCanvas.height = canvas.height;
  if (babylonEngine) {
    babylonEngine.resize();
  }
});

fitCanvas(wrapper, hud, canvas);
webglCanvas.width = canvas.width;
webglCanvas.height = canvas.height;

// === INITIALISATION 3D ===
async function init3D() {
  try {
    console.log('🎯 Initializing 3D layer...');
    
    const { engine, scene } = createBabylonScene(webglCanvas);
    babylonEngine = engine;
    babylonScene = scene;
    
    console.log('🚀 Loading Star Wars ships as paddles...');
    starWarsShips = await loadStarWarsShips(scene);
    ball3D = await loadBall3D(scene);
    checkBallCount(scene);
    
    
    // Démarrer le rendu 3D
    engine.runRenderLoop(() => {
      if (starWarsShips) {
        syncStarWarsShips(starWarsShips, left, right);
      }
      if (ball3D) {
      syncBall3D(ball3D, ball);
    }
      scene.render();
    });
    
    console.log('✅ 3D layer initialized');
  } catch (error) {
    console.error('❌ 3D initialization failed:', error);
    // En cas d'erreur, le jeu continue en mode 2D uniquement
  }
}

// Lancer la 3D en parallèle
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
console.log('🎮 Initializing Star Wars Pong...');
updateScore();
ball.reset('random');
setPhase('starting', START_DELAY_SEC);
requestAnimationFrame(loop);
console.log('✅ Game started successfully!');