import { fitCanvas } from './io/viewport';
import { pressed, pressedCode } from './io/keyboard';
import { Paddle } from './core/paddle';
import { Ball } from './core/ball';
import { step } from './core/physics';
import { drawScene } from './render/draw2d';
//import { drawOverlay } from './render/hud';
import { create3DScene, loadShips, syncShips } from './render/render3d';
import { loadBall3D, syncBall3D, setupBallControls } from './render/render3dBall';
import { createGameField, loadStarDestroyerBackground, addBackgroundImage } from './render/render3dField';
import { createCamera, setupCameraControls } from './render/cam3d';
import { debugAll } from './render/debug3d';
import { pseudoUser, userId, avatarplayer } from '../../src/script';
import { postMatch, getNextMatchId } from './blockchainApi';
// CSS is loaded via HTML <link>, no direct import needed


import {
  WORLD_W,
  WORLD_H,
  PADDLE_SPEED,
  WIN_SCORE,
  START_DELAY_SEC,
  ROUND_DELAY_SEC
} from './core/constants';

import type { GamePhase } from './core/types';

//let player1Name = pseudoUser?.trim() || 'Player 1';

// === CONFIGURATION DOM ===
const wrapper = document.querySelector<HTMLDivElement>('.game-wrapper')!;
const hud = document.getElementById('hud')! as HTMLElement;
const scoreEl = document.getElementById('score')!;
const p2Overlay = document.getElementById('p2-name-overlay') as HTMLDivElement | null;
const p2Input = document.getElementById('p2-input') as HTMLInputElement | null;
const p2Apply = document.getElementById('p2-apply') as HTMLButtonElement | null;
const startLoader = document.getElementById('start-loader') as HTMLDivElement | null;
const betweenOverlay = document.getElementById('between-overlay') as HTMLDivElement | null;
const victoryOverlay = document.getElementById('victory-overlay') as HTMLDivElement | null;
const victRankNum = document.getElementById('vict-rank-num') as HTMLParagraphElement | null;
const victRankWord = document.getElementById('vict-rank-word') as HTMLParagraphElement | null;
const victUserName = document.getElementById('vict-user-name') as HTMLParagraphElement | null;
const victScore = document.getElementById('vict-score') as HTMLSpanElement | null;

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
//let scene3D: any = null;
let camera3D: any = null;
let ships3D: { xwing: any; tie: any; paddleAnimation: any } | null = null;
let ball3D: any = null;
// let field3D: any = null;

// === ÉTAT DU JEU ===
let scoreL = 0;
let scoreR = 0;
let phase: GamePhase = 'naming';
let countdown = START_DELAY_SEC;

// Noms des joueurs
let player1Name = (pseudoUser || document.getElementById('p1-name')?.textContent || 'Player 1').trim();
let player2Name = (document.getElementById('p2-name')?.textContent || 'Player 2').trim();
let isInitialStarting = false;
// const urlParams = new URLSearchParams(window.location.search);
// const isTournamentMode = urlParams.get('tournament') === '1';
// if (isTournamentMode) {
//   const p1 = urlParams.get('p1');
//   const p2 = urlParams.get('p2');
//   if (p1) player1Name = decodeURIComponent(p1);
//   if (p2) player2Name = decodeURIComponent(p2);
// }


// // Noms des joueurs
// let player1Name = (userId || document.getElementById('p1-name')?.textContent || 'Player 1').trim();
// let player2Name = (document.getElementById('p2-name')?.textContent || 'Player 2').trim();
// //let palyerId = (userId);
// let isInitialStarting = false;
// // let player1 = {
// //   id: userId ? userId.trim() : null,
// //   name: player1Name
// // };

// Vérifie si on est en mode tournoi
const urlParams = new URLSearchParams(window.location.search);
const isTournamentMode = urlParams.get('tournament') === '1';

if (isTournamentMode) {
  const p1 = urlParams.get('p1');
  const p2 = urlParams.get('p2');
  if (p1) player1Name = decodeURIComponent(p1);
  if (p2) player2Name = decodeURIComponent(p2);
}
console.log('userId dans le jeu:', userId);

// matchId fourni par le serveur via /nextId

function getCurrentTournamentId(): number | null {
  const raw = localStorage.getItem('current_tournament_id');
  return raw ? parseInt(raw, 10) || null : null;
}

// Met à jour l’affichage HTML pour refléter les bons pseudos
const p1Element = document.getElementById('p1-name');
if (p1Element) {
  p1Element.textContent = player1Name;
}


const p2Element = document.getElementById('p2-name');
if (p2Element) {
  p2Element.textContent = player2Name;
}


// === FONCTIONS DU JEU ===
function updateScore(): void {
  // Reconstruire le score avec les noms et valeurs
  scoreEl.innerHTML = `<span id="p1-name">${player1Name}</span> : ${scoreL} | <span id="p2-name">${player2Name}</span> : ${scoreR}`;
}

// === FONCTION DEBUG ===
function debugPlayerLose(): void {
  // Numpad1 -> fait gagner le joueur 1, Numpad2 -> fait gagner le joueur 2
  if (pressedCode('Numpad1')) {
    scoreL = WIN_SCORE;
    updateScore();
    setPhase('gameover');
    console.log('🐛 DEBUG: Player 2 a perdu instantanément (Numpad1) !');
  }
  if (pressedCode('Numpad2')) {
    scoreR = WIN_SCORE;
    updateScore();
    setPhase('gameover');
    console.log('🐛 DEBUG: Player 1 a perdu instantanément (Numpad2) !');
  }
}

function setPhase(newPhase: GamePhase): void {
  phase = newPhase;
  switch (phase) {
    case 'naming':
      // En mode tournoi, on saute la saisie et on démarre directement
      if (isTournamentMode) {
        updateScore();
        isInitialStarting = true;
        setPhase('starting');
        break;
		//! fetch les datas de tournoi ici ?
      }
      // Afficher l'overlay de saisie
      if (p2Overlay) {
        p2Overlay.classList.add('visible');
        p2Overlay.setAttribute('aria-hidden', 'false');
      }
      if (p2Input) {
        p2Input.value = '';
        setTimeout(() => p2Input?.focus(), 0);
      }
      break;
    case 'starting':
      countdown = START_DELAY_SEC;
      if (isInitialStarting && startLoader) {
        startLoader.classList.add('visible');
        startLoader.setAttribute('aria-hidden', 'false');
      }
      break;
    case 'playing':
      ball.reset('random');
      if (startLoader) {
        startLoader.classList.remove('visible');
        startLoader.setAttribute('aria-hidden', 'true');
      }
      if (betweenOverlay) {
        betweenOverlay.classList.remove('visible');
        betweenOverlay.setAttribute('aria-hidden', 'true');
      }
      if (victoryOverlay) {
        victoryOverlay.classList.remove('visible');
        victoryOverlay.setAttribute('aria-hidden', 'true');
      }
      isInitialStarting = false;
      break;
    case 'between':
      countdown = ROUND_DELAY_SEC;
      if (betweenOverlay) {
        betweenOverlay.classList.add('visible');
        betweenOverlay.setAttribute('aria-hidden', 'false');
      }
      break;
    case 'gameover':
      // En tournoi, on renvoie le résultat à la page tournoi et on sort
      if (isTournamentMode) {
        const winner = (scoreL > scoreR ? player1Name : player2Name);
        const res = { winner, score: `${scoreL}-${scoreR}` };
        try { localStorage.setItem('pong_result', JSON.stringify(res)); } catch {}
        // Déclaration du match blockchain en mode tournoi
        (async () => {
          try {
            const matchId = await getNextMatchId();
            const p1Id = Number(userId) || 1;
            const p2Id = 2; // ID synthétique local
            const winnerId = (scoreL > scoreR) ? p1Id : p2Id;
            const tournamentId = getCurrentTournamentId() || 1;
            await postMatch({
              isTournament: tournamentId,
              matchId,
              p1: p1Id,
              p2: p2Id,
              p1Score: scoreL,
              p2Score: scoreR,
              winner: winnerId
            });
          } catch (err) {
            console.warn('postMatch (tournament) failed:', err);
          }
        })();
        const back = localStorage.getItem('tournament_return_to') || 'tournament.html';
        // petite pause pour laisser finir les animations éventuelles
        setTimeout(() => { window.location.href = back; }, 200);
        break;
		//! fetch les resultats de match ici ?
      }
      if (victoryOverlay) {
          const winnerName = scoreL > scoreR ? player1Name : player2Name;
          const avatarContainer = document.getElementById('vict-avatar') as HTMLElement;
          const userNameEl = document.getElementById('vict-user-name') as HTMLElement;
          console.log("avatarplayer dans le jeu:", avatarplayer);
          if (victRankNum) victRankNum.textContent = '';
          if (victRankWord) victRankWord.textContent = 'WIN';
          if (userNameEl) userNameEl.textContent = winnerName;
          if (victScore) victScore.textContent = `${scoreL}-${scoreR}`;

          // 🖼️ Avatar dynamique
          if (avatarContainer) {
            if (scoreL > scoreR) {
              // Player 1 → avatar dynamique
              avatarContainer.innerHTML = `<img src="${avatarplayer}" alt="Avatar ${winnerName}">`;
            } else {
              // Player 2 → avatar fixe
              avatarContainer.innerHTML = `<img src="/uploads/choices/jabba.png" alt="Player 2">`;
            }
          }

          victoryOverlay.classList.add('visible');
          victoryOverlay.setAttribute('aria-hidden', 'false');
        }

        // Déclaration du match blockchain en partie libre
        ;(async () => {
          try {
            const matchId = await getNextMatchId();
            const p1Id = Number(userId) || 1;
            const p2Id = 2; // ID synthétique local
            const winnerId = (scoreL > scoreR) ? p1Id : p2Id;
            await postMatch({
              isTournament: 0,
              matchId,
              p1: p1Id,
              p2: p2Id,
              p1Score: scoreL,
              p2Score: scoreR,
              winner: winnerId
            });
          } catch (err) {
            console.warn('postMatch (free play) failed:', err);
          }
        })();

      break;
  }
}

function runGameplay(dt: number): void {
  // Mouvement des paddles
  if (pressed('w')) left.move(-PADDLE_SPEED * dt);
  if (pressed('s')) left.move(PADDLE_SPEED * dt);
  if (pressed('W')) left.move(-PADDLE_SPEED * dt);
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
    let scene3D: any = null;
    let field3D: any = null;
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

    // Activer le système de debug 3D
    debugAll();

    // Démarrer le rendu 3D
    engine.runRenderLoop(() => {
      if (ships3D) {
        // Récupérer l'état des touches pour les animations
        const leftUpPressed = pressed('w') || pressed('W');
        const leftDownPressed = pressed('s') || pressed('S');
        const rightUpPressed = pressed('ArrowUp');
        const rightDownPressed = pressed('ArrowDown');

        syncShips(ships3D, left, right, leftUpPressed, leftDownPressed, rightUpPressed, rightDownPressed);
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

// === LOGIQUE DE SAISIE PLAYER 2 ===
function applyPlayer2NameAndStart(): void {
  const name = (p2Input?.value || '').trim();
  player2Name = name.length > 0 ? name : 'Player 2';
  updateScore();
  if (p2Overlay) {
    p2Overlay.classList.remove('visible');
    p2Overlay.setAttribute('aria-hidden', 'true');
  }
  isInitialStarting = true;
  setPhase('starting');
}

if (p2Apply) {
  p2Apply.addEventListener('click', applyPlayer2NameAndStart);
}
if (p2Input) {
  p2Input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyPlayer2NameAndStart();
    }
  });
}

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

  // Debug: victoire instantanée via Numpad1 (P1) / Numpad2 (P2)
  debugPlayerLose();

  // Rendu 2D
  drawScene(ctx, canvas, left, right, ball);

  // Overlays
  // L'overlay numérique n'est plus utilisé pendant 'between' (remplacé par betweenOverlay)
  // En phase gameover, on n'affiche plus de texte sur le canvas (uniquement l'animation overlay)

  requestAnimationFrame(loop);
}

// === INITIALISATION ===
console.log('🎮 Initializing Pong...');
updateScore();
setPhase('naming');
loop();
