import { pseudoUser, userId } from '../../src/script';
// Constants
const ORIGINAL_WORLD_W = 900;
const ORIGINAL_WORLD_H = 600;
let WORLD_W = 900;
let WORLD_H = 600;

// Scale factor for proportional sizing
let scaleX = 1;
let scaleY = 1;
const MAX_SCORE_TARGET = 5000;
const UNLOCK_2_SHOTS = Math.floor(MAX_SCORE_TARGET / 3);
const UNLOCK_3_SHOTS = Math.floor((2 * MAX_SCORE_TARGET) / 3);
const PLAYER_INIT_LIVES = 3;
const PLAYER_INVULN_SEC = 3;

// Types
type Mode = 'none' | 'solo' | 'coop';
interface Ship {
  x: number; y: number; w: number; h: number;
  speed: number; cooldown: number; color: string;
  lives: number; invuln: number;
}
interface Bullet { x: number; y: number; vx: number; vy: number; r: number; color: string; owner: 'p' | 'e'; shooter?: 'p1' | 'p2'; }
interface Enemy { x: number; y: number; w: number; h: number; alive: boolean; row: number; cd: number; }
interface Boss { x: number; y: number; w: number; h: number; hp: number; maxHp: number; dir: number; speed: number; cd: number; }

const clientScoreEl = document.getElementById('si-score-p1') as HTMLSpanElement;

clientScoreEl.textContent = pseudoUser;

// Input
let keys: Record<string, boolean> = {};
let justPressed: Record<string, boolean> = {};
function setupInput(): void {
  window.addEventListener('keydown', (e) => {
    if (!keys[e.key]) {
      justPressed[e.key] = true;
    }
    keys[e.key] = true;
  });
  window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    justPressed[e.key] = false;
  });
}
function pressed(key: string): boolean { return !!keys[key]; }
function pressedOnce(key: string): boolean {
  if (justPressed[key]) { justPressed[key] = false; return true; }
  return false;
}

// UI helpers
function renderLives(livesEl: HTMLElement, p1: Ship | null, p2: Ship | null): void {
  const heartSvg = (opacity: number) => `<svg class="si-heart-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" fill-opacity="${opacity}" d="M12 21s-6.716-4.246-9.193-7.04C.513 11.47.86 8.4 2.93 6.72c1.87-1.52 4.68-1.116 6.29.7L12 9.4l2.78-1.98c1.61-1.816 4.42-2.22 6.29-.7 2.07 1.68 2.42 4.75.12 7.24C18.716 16.754 12 21 12 21z"/></svg>`;
  const hearts = (n: number) => `<span class="si-lives-frame">${Array.from({ length: 3 }, (_, i) => heartSvg(i < n ? 1 : 0.25)).join('')}</span>`;
  const p1Hearts = p1 ? hearts(p1.lives) : '';
  const p2Hearts = p2 ? hearts(p2.lives) : '';
  livesEl.innerHTML = `${p1Hearts}${p2 ? '<span style="width:14px;display:inline-block"></span>' : ''}${p2Hearts}`;
}
function showVictoryOverlay(
  _wrapper: HTMLElement,
  scoreVal: number,
  p1Ref: Ship | null,
  p2Ref: Ship | null,
  onRetry: () => void,
  extra?: { mode: Mode; p1Score: number; p2Score: number; p1Bonus: number; p2Bonus: number; winner: string }
): void {
  victoryEl.style.display = '';
  if (extra && extra.mode === 'coop') {
    victorySoloEl.style.display = 'none';
    victoryCoopEl.style.display = '';
    vTeamEl.textContent = `Score d'équipe: ${scoreVal}`;
    vP1El.innerHTML = `${pseudoUser}: ${extra.p1Score} + ${extra.p1Bonus} bonus vies = <strong>${extra.p1Score + extra.p1Bonus}</strong>`;
    vP2El.innerHTML = `${p2Name}: ${extra.p2Score} + ${extra.p2Bonus} bonus vies = <strong>${extra.p2Score + extra.p2Bonus}</strong>`;
    vWinnerEl.textContent = `Vainqueur: ${extra.winner}`;
  } else {
    victoryCoopEl.style.display = 'none';
    victorySoloEl.style.display = '';
    vSoloScoreEl.textContent = `Score: ${scoreVal}`;
    vSoloLivesEl.textContent = `❤️ P1: ${p1Ref?.lives ?? 0}${p2Ref ? ` | ❤️ P2: ${p2Ref.lives}` : ''}`;
  }
  const onClick = () => {
    victoryEl.style.display = 'none';
    retryVictoryBtn.removeEventListener('click', onClick);
    onRetry();
  };
  retryVictoryBtn.addEventListener('click', onClick);
}
function showDefeatOverlay(_wrapper: HTMLElement, scoreVal: number, p1Ref: Ship | null, p2Ref: Ship | null, onRetry: () => void): void {
  defeatEl.style.display = '';
  dScoreEl.textContent = `Score: ${scoreVal}`;
  dLivesEl.textContent = `❤️ P1: ${p1Ref?.lives ?? 0}${p2Ref ? ` | ❤️ P2: ${p2Ref.lives}` : ''}`;
  const onClick = () => {
    defeatEl.style.display = 'none';
    retryDefeatBtn.removeEventListener('click', onClick);
    onRetry();
  };
  retryDefeatBtn.addEventListener('click', onClick);
}

// Render helpers
function drawPlayerShip(ctx: CanvasRenderingContext2D, s: Ship): void {
  const barH = Math.max(2, Math.round(s.h * 0.35));
  const stemW = Math.max(2, Math.round(s.w * 0.25));
  ctx.fillStyle = s.color;
  ctx.fillRect(Math.round(s.x), Math.round(s.y + s.h - barH), Math.round(s.w), barH);
  const stemX = Math.round(s.x + (s.w - stemW) / 2);
  const stemY = Math.round(s.y);
  const stemH = Math.round(s.h - barH);
  ctx.fillRect(stemX, stemY, stemW, stemH);
}
function drawEnemyShip(ctx: CanvasRenderingContext2D, e: Enemy): void {
  const colW = Math.max(2, Math.round(e.w * 0.22));
  const midH = Math.max(2, Math.round(e.h * 0.24));
  ctx.fillStyle = '#f472b6';
  ctx.fillRect(Math.round(e.x), Math.round(e.y), colW, Math.round(e.h));
  ctx.fillRect(Math.round(e.x + e.w - colW), Math.round(e.y), colW, Math.round(e.h));
  const midY = Math.round(e.y + (e.h - midH) / 2);
  ctx.fillRect(Math.round(e.x), midY, Math.round(e.w), midH);
}
function drawBoss(ctx: CanvasRenderingContext2D, boss: Boss, canvasWidth: number): void {
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(Math.round(boss.x), Math.round(boss.y), boss.w, boss.h);
  const barW = Math.min(canvasWidth - 40, boss.w);
  const barX = Math.max(20, boss.x + (boss.w - barW) / 2);
  const barY = boss.y - 14;
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(barX, barY, barW, 8);
  const ratio = boss.hp / boss.maxHp;
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(barX, barY, Math.max(0, Math.floor(barW * ratio)), 8);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${boss.hp} / ${boss.maxHp}`, barX + barW / 2, barY - 2);
  ctx.textAlign = 'left';
}

// DOM
const wrapper = document.getElementById('si-wrapper') as HTMLDivElement;
const hud = document.getElementById('si-hud') as HTMLElement;
const scoreP1El = document.getElementById('si-score-p1') as HTMLElement;
const scoreP2El = document.getElementById('si-score-p2') as HTMLElement;
const livesEl = document.getElementById('si-lives') as HTMLElement;
const menuBtn = document.getElementById('si-menu-btn') as HTMLButtonElement;
// Ensure wrapper anchors absolutely-positioned children and allows clicks
wrapper.style.position = 'relative';
// Static overlays and controls from HTML
const selectEl = document.getElementById('si-select') as HTMLDivElement;
const btnSolo = document.getElementById('si-solo') as HTMLButtonElement;
const btnCoop = document.getElementById('si-coop') as HTMLButtonElement;
// Ensure overlays paint above the canvas
if (selectEl) selectEl.style.zIndex = '10';
if (selectEl) selectEl.style.pointerEvents = 'auto';

const p2OverlayEl = document.getElementById('si-p2-overlay') as HTMLDivElement;
const p1NameEl = document.getElementById('si-p1name') as HTMLElement;
const p2NameInput = document.getElementById('si-p2name') as HTMLInputElement;
const p2OkBtn = document.getElementById('si-p2-ok') as HTMLButtonElement;
const p2CancelBtn = document.getElementById('si-p2-cancel') as HTMLButtonElement;
if (p2OverlayEl) p2OverlayEl.style.zIndex = '10';
if (p2OverlayEl) p2OverlayEl.style.pointerEvents = 'auto';

const loaderEl = document.getElementById('si-loader') as HTMLDivElement;
if (loaderEl) loaderEl.style.zIndex = '10';
if (loaderEl) loaderEl.style.pointerEvents = 'auto';

const victoryEl = document.getElementById('si-victory') as HTMLDivElement;
const victoryCoopEl = document.getElementById('si-victory-coop') as HTMLDivElement;
const victorySoloEl = document.getElementById('si-victory-solo') as HTMLDivElement;
const vTeamEl = document.getElementById('si-v-team') as HTMLElement;
const vP1El = document.getElementById('si-v-p1') as HTMLElement;
const vP2El = document.getElementById('si-v-p2') as HTMLElement;
const vWinnerEl = document.getElementById('si-v-winner') as HTMLElement;
const vSoloScoreEl = document.getElementById('si-v-solo-score') as HTMLElement;
const vSoloLivesEl = document.getElementById('si-v-solo-lives') as HTMLElement;
const retryVictoryBtn = document.getElementById('si-retry-victory') as HTMLButtonElement;
if (victoryEl) victoryEl.style.zIndex = '10';
if (victoryEl) victoryEl.style.pointerEvents = 'auto';

const defeatEl = document.getElementById('si-defeat') as HTMLDivElement;
const dScoreEl = document.getElementById('si-d-score') as HTMLElement;
const dLivesEl = document.getElementById('si-d-lives') as HTMLElement;
const retryDefeatBtn = document.getElementById('si-retry-defeat') as HTMLButtonElement;
if (defeatEl) defeatEl.style.zIndex = '10';
if (defeatEl) defeatEl.style.pointerEvents = 'auto';

// Canvas
const canvas = document.createElement('canvas');
canvas.id = 'si-canvas';
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '0';
canvas.style.pointerEvents = 'none';
// Place canvas behind overlays to ensure overlays are clickable
if (wrapper.firstChild) {
  wrapper.insertBefore(canvas, wrapper.firstChild);
} else {
  wrapper.appendChild(canvas);
}
const ctx = canvas.getContext('2d')!;

// Background
const bgImg = new Image();
bgImg.src = '/models/space.jpg';
let bgReady = false;
bgImg.onload = () => { bgReady = true; };

// Fit
function fit() {
  const freeH = window.innerHeight - hud.getBoundingClientRect().height;
  const freeW = window.innerWidth;
  const ratio = ORIGINAL_WORLD_W / ORIGINAL_WORLD_H;
  let w = freeW * 0.95;
  let h = w / ratio;
  if (h > freeH * 0.95) { h = freeH * 0.95; w = h * ratio; }
  wrapper.style.width = `${w}px`;
  wrapper.style.height = `${h}px`;
  canvas.width = w; canvas.height = h;

  // Update world dimensions and scale factors
  WORLD_W = w;
  WORLD_H = h;
  scaleX = WORLD_W / ORIGINAL_WORLD_W;
  scaleY = WORLD_H / ORIGINAL_WORLD_H;

  // Reposition and rescale players and other elements if game is running
  if (mode !== 'none' && p1) {
    repositionGameElements();
  }
}
// Reposition game elements when window is resized
function repositionGameElements() {
  const w = WORLD_W;
  const h = WORLD_H;
  const bottomOffset = Math.round(40 * scaleY);
  const sideMargin = Math.round(20 * scaleX);

  // Resize and reposition players
  if (p1) {
    const newPlayerW = Math.round(24 * scaleX);
    const newPlayerH = Math.round(16 * scaleY);
    const newSpeed = Math.round(420 * scaleX);

    // Keep relative position but update size
    const relativeX = p1.x / (w - p1.w);
    p1.w = newPlayerW;
    p1.h = newPlayerH;
    p1.speed = newSpeed;
    p1.x = Math.max(0, Math.min(w - p1.w, relativeX * (w - p1.w)));
    p1.y = h - bottomOffset;
  }
  if (p2) {
    const newPlayerW = Math.round(24 * scaleX);
    const newPlayerH = Math.round(16 * scaleY);
    const newSpeed = Math.round(420 * scaleX);

    const relativeX = p2.x / (w - p2.w);
    p2.w = newPlayerW;
    p2.h = newPlayerH;
    p2.speed = newSpeed;
    p2.x = Math.max(0, Math.min(w - p2.w, relativeX * (w - p2.w)));
    p2.y = h - bottomOffset;
  }

  // Resize and reposition boss if exists
  if (boss) {
    const newBossW = Math.round(200 * scaleX);
    const newBossH = Math.round(40 * scaleY);
    const newBossSpeed = Math.round(140 * scaleX);

    const relativeX = boss.x / (w - boss.w);
    boss.w = newBossW;
    boss.h = newBossH;
    boss.speed = newBossSpeed;
    boss.x = Math.max(sideMargin, Math.min(w - boss.w - sideMargin, relativeX * (w - boss.w)));
    boss.y = Math.round(80 * scaleY);
  }

  // Update bullet sizes and remove out of bounds bullets
  bullets.forEach(b => {
    b.r = Math.round((b.owner === 'p' ? 3 : (b.color === '#a78bfa' ? 4 : 3)) * Math.min(scaleX, scaleY));
  });
  bullets = bullets.filter(b => b.x >= 0 && b.x <= w && b.y >= -10 && b.y <= h + 10);

  // Completely recalculate enemy grid with proper spacing
  if (enemies.length > 0) {
    const cols = 10;
    const gapX = Math.round(16 * scaleX);
    const gapY = Math.round(18 * scaleY);
    const sideMargin = Math.round(40 * scaleX);
    const topOffset = Math.round(60 * scaleY);

    const cellW = (w - 2 * sideMargin - (cols - 1) * gapX) / cols;
    const newEnemyW = Math.max(Math.round(20 * scaleX), Math.min(Math.round(40 * scaleX), Math.floor(cellW * 0.65)));
    const newEnemyH = Math.round(20 * scaleY);

    // Reorganize enemies in proper grid formation
    const aliveEnemiesByRow: { [key: number]: Enemy[] } = {};
    enemies.forEach(e => {
      if (e.alive) {
        if (!aliveEnemiesByRow[e.row]) aliveEnemiesByRow[e.row] = [];
        aliveEnemiesByRow[e.row].push(e);
      }
    });

    // Reposition each row with correct spacing
    for (let r = 0; r < currentRows; r++) {
      if (aliveEnemiesByRow[r]) {
        const rowEnemies = aliveEnemiesByRow[r].sort((a, b) => a.x - b.x); // Sort by current x position
        const baseX = rowDirs[r] < 0 ? (w - sideMargin - cols * (newEnemyW + gapX) + gapX) : sideMargin;

        rowEnemies.forEach((e, colIndex) => {
          e.w = newEnemyW;
          e.h = newEnemyH;
          e.x = baseX + colIndex * (newEnemyW + gapX);
          e.y = topOffset + r * (newEnemyH + gapY);
        });

        // Update row boundaries
        rowLeftX[r] = baseX;
        rowRightX[r] = baseX + (rowEnemies.length - 1) * (newEnemyW + gapX) + newEnemyW;
      }
    }
  }
}

// Initialize canvas size first
const initialFit = () => {
  const freeH = window.innerHeight - hud.getBoundingClientRect().height;
  const freeW = window.innerWidth;
  const ratio = ORIGINAL_WORLD_W / ORIGINAL_WORLD_H;
  let w = freeW * 0.95;
  let h = w / ratio;
  if (h > freeH * 0.95) { h = freeH * 0.95; w = h * ratio; }
  wrapper.style.width = `${w}px`;
  wrapper.style.height = `${h}px`;
  canvas.width = w; canvas.height = h;
  // Don't update WORLD_W and WORLD_H yet - wait for game start
};

initialFit();
window.addEventListener('resize', fit);

// Input
setupInput();

// Game state
let mode: Mode = 'none';
let score = 0; // team score used for progression
let scoreP1 = 0;
let scoreP2 = 0;
let multiplierP1 = 1;
let multiplierP2 = 1;
let playerShotCount = 1;
let hitStreakP1 = 0;
let hitStreakP2 = 0;
let isGameOver = false;
let enemySpeed = 50;
let currentRows = 1;
let p1: Ship | null = null;
let p2: Ship | null = null;
let bullets: Bullet[] = [];
let enemies: Enemy[] = [];
let rowDirs: number[] = [];
let rowDrops: number[] = [];
let rowLeftX: number[] = [];
let rowRightX: number[] = [];
let boss: Boss | null = null;

// Flow
btnSolo.onclick = () => start('solo');
btnCoop.onclick = () => start('coop');
menuBtn.onclick = () => returnToMenu();

let p1Name: string = pseudoUser || 'P1';
let p2Name: string = 'P2';

function promptP2Name(): Promise<boolean> {
  return new Promise((resolve) => {
    p1NameEl.textContent = pseudoUser;
    p2NameInput.value = '';
    p2OverlayEl.style.display = '';
    const onOk = () => {
      const val = p2NameInput.value.trim();
      p2Name = val || 'P2';
      p2OverlayEl.style.display = 'none';
      cleanup();
      resolve(true);
    };
    const onCancel = () => {
      p2OverlayEl.style.display = 'none';
      cleanup();
      resolve(false);
    };

    // attach listeners
    p2OkBtn.addEventListener('click', onOk);
    p2CancelBtn.addEventListener('click', onCancel);

    // cleanup pour éviter les doublons
    function cleanup() {
      p2OkBtn.removeEventListener('click', onOk);
      p2CancelBtn.removeEventListener('click', onCancel);
    }
  });
}

function start(m: Mode) {
  const proceed = () => {
    showHackerLoader(5000).then(() => {
      mode = m;
      resetGame();
      selectEl.remove();
    });
  };

  if (m === 'coop') {
    p1Name = (pseudoUser || 'P1');
    promptP2Name().then((confirmed) => {
      if (confirmed) {
        proceed();
      }
      // keep selection visible on cancel
      if (!confirmed) {
        selectEl.style.display = '';
      }
    });
  } else {
    proceed();
  }
}

function returnToMenu(): void {
  // Stop game loop state and show selection
  mode = 'none';
  isGameOver = false;
  // Clear entities
  p1 = null; p2 = null; enemies = []; bullets = []; boss = null;
  // Reset HUD
  score = 0; scoreP1 = 0; scoreP2 = 0; multiplierP1 = 1; multiplierP2 = 1; playerShotCount = 1;
  scoreP2El.style.display = 'none';
  updateScoreHud();
  renderLives(livesEl, p1, p2);
  // Show menu overlay back
  selectEl.style.display = '';
}

function resetGame() {
  // Update world dimensions to match current canvas size
  WORLD_W = canvas.width;
  WORLD_H = canvas.height;

  // Calculate scale factors for proportional sizing
  scaleX = WORLD_W / ORIGINAL_WORLD_W;
  scaleY = WORLD_H / ORIGINAL_WORLD_H;

  score = 0;
  scoreP1 = 0;
  scoreP2 = 0;
  multiplierP1 = 1;
  multiplierP2 = 1;
  playerShotCount = 1;
  hitStreakP1 = 0;
  hitStreakP2 = 0;
  enemySpeed = 50;
  currentRows = 1;
  boss = null;
  bullets = [];
  enemies = [];
  updateScoreHud();
  renderLives(livesEl, p1, p2);
  isGameOver = false;
  createPlayers();
  initLevel(1);
}

function createPlayers() {
  const w = WORLD_W, h = WORLD_H;
  // Base sizes scaled proportionally
  const playerW = Math.round(24 * scaleX);
  const playerH = Math.round(16 * scaleY);
  const bottomOffset = Math.round(40 * scaleY);
  const separationOffset = Math.round(30 * scaleX);
  const baseSpeed = Math.round(420 * scaleX); // Scale speed proportionally

  p1 = { x: w / 2 - separationOffset, y: h - bottomOffset, w: playerW, h: playerH, speed: baseSpeed, cooldown: 0, color: '#60a5fa', lives: PLAYER_INIT_LIVES, invuln: 0 };
  if (mode === 'coop') {
    p2 = { x: w / 2 + separationOffset, y: h - bottomOffset, w: playerW, h: playerH, speed: baseSpeed, cooldown: 0, color: '#34d399', lives: PLAYER_INIT_LIVES, invuln: 0 };
  } else {
    p2 = null;
  }
  if (mode === 'coop') { scoreP2El.style.display = ''; } else { scoreP2El.style.display = 'none'; }
  updateScoreHud();
}

function initLevel(rows: number) {
  bullets = [];
  enemies = [];
  rowDirs = [];
  rowDrops = [];
  rowLeftX = [];
  rowRightX = [];
  currentRows = rows;
  const w = WORLD_W;
  const cols = 10;

  // Scale gaps and sizes proportionally
  const gapX = Math.round(16 * scaleX);
  const gapY = Math.round(18 * scaleY);
  const sideMargin = Math.round(40 * scaleX);
  const topOffset = Math.round(60 * scaleY);

  const cellW = (w - 2 * sideMargin - (cols - 1) * gapX) / cols;
  const eW = Math.max(Math.round(20 * scaleX), Math.min(Math.round(40 * scaleX), Math.floor(cellW * 0.65)));
  const eH = Math.round(20 * scaleY);

  for (let r = 0; r < rows; r++) {
    rowDirs[r] = (r % 2 === 0) ? -1 : 1;
    rowDrops[r] = 0;
    const baseX = rowDirs[r] < 0 ? (w - sideMargin - cols * (eW + gapX) + gapX) : sideMargin;
    rowLeftX[r] = baseX;
    rowRightX[r] = baseX + (cols - 1) * (eW + gapX) + eW;
    for (let c = 0; c < cols; c++) {
      const x = baseX + c * (eW + gapX);
      const y = topOffset + r * (eH + gapY);
      enemies.push({ x, y, w: eW, h: eH, alive: true, row: r, cd: 1 + Math.random() * 4 });
    }
  }
}

function nextWave(increase: boolean): void {
  if (increase && currentRows < 5) {
    enemySpeed += 12;
    initLevel(currentRows + 1);
  } else if (increase) {
    spawnBoss();
  } else {
    initLevel(currentRows);
  }
}

function spawnBoss(): void {
  enemies = [];
  currentRows = 0;
  const w = WORLD_W;
  const bossHP = (mode === 'coop') ? 1500 : 750;

  // Scale boss proportionally
  const bossW = Math.round(200 * scaleX);
  const bossH = Math.round(40 * scaleY);
  const bossY = Math.round(80 * scaleY);
  const bossSpeed = Math.round(140 * scaleX);
  const sideMargin = Math.round(20 * scaleX);

  boss = {
    x: Math.max(sideMargin, w / 2 - bossW / 2),
    y: bossY,
    w: bossW,
    h: bossH,
    hp: bossHP,
    maxHp: bossHP,
    dir: 1,
    speed: bossSpeed,
    cd: 0.5 + Math.random() * 1.0
  };
}

function shoot(from: Ship): void {
  if (from.cooldown > 0) return;
  const x0 = from.x; const x1 = from.x + from.w;
  const positions: number[] = [];
  if (playerShotCount === 1) positions.push(from.x + from.w / 2);
  else if (playerShotCount === 2) positions.push(x0 + from.w * 0.35, x0 + from.w * 0.65);
  else positions.push(x0 + from.w * 0.25, x0 + from.w * 0.5, x0 + from.w * 0.75);
  const shooter: 'p1' | 'p2' = (p2 && from === p2) ? 'p2' : 'p1';

  // Scale bullet properties proportionally
  const bulletSpeed = Math.round(-600 * scaleY);
  const bulletRadius = Math.round(3 * Math.min(scaleX, scaleY));

  positions.forEach(px => bullets.push({
    x: Math.max(x0 + 1, Math.min(x1 - 1, px)),
    y: from.y,
    vx: 0,
    vy: bulletSpeed,
    r: bulletRadius,
    color: '#fbbf24',
    owner: 'p',
    shooter
  }));
  from.cooldown = 0.25;
}

function handlePlayerHit(player: Ship): void {
  player.lives = Math.max(0, player.lives - 1);
  player.invuln = PLAYER_INVULN_SEC;
  if (p1 && player === p1) multiplierP1 = Math.max(1, multiplierP1 - 1);
  if (p2 && player === p2) multiplierP2 = Math.max(1, multiplierP2 - 1);
  updateScoreHud();
  renderLives(livesEl, p1, p2);
  if (player.lives <= 0 && !isGameOver) triggerGameOver();
}

function update(dt: number): void {
  if (!p1 || isGameOver) return;

  const speed = p1.speed;
  if (pressed('ArrowLeft')) p1.x -= speed * dt;
  if (pressed('ArrowRight')) p1.x += speed * dt;
  if (pressed(' ') && p1.lives > 0 && p1.invuln <= 0) shoot(p1);
  if (p2) {
    if (pressed('a') || pressed('A') || pressed('q') || pressed('Q')) p2.x -= speed * dt;
    if (pressed('d') || pressed('D')) p2.x += speed * dt;
    if ((pressed('z') || pressed('Z') || pressed('w') || pressed('W')) && p2.lives > 0 && p2.invuln <= 0) shoot(p2);
  }
  p1.x = Math.max(0, Math.min(WORLD_W - p1.w, p1.x));
  if (p2) p2.x = Math.max(0, Math.min(WORLD_W - p2.w, p2.x));
  if (p1.cooldown > 0) p1.cooldown -= dt; if (p2 && p2.cooldown > 0) p2.cooldown -= dt;
  if (p1.invuln > 0) p1.invuln -= dt; if (p2 && p2.invuln > 0) p2.invuln -= dt;

  if (pressedOnce('p') || pressedOnce('P')) nextWave(true);

  if (!boss && !enemies.some(e => e.alive)) { nextWave(true); return; }

  const aliveYs: number[] = [];
  if (p1 && p1.lives > 0) aliveYs.push(p1.y);
  if (p2 && p2.lives > 0) aliveYs.push(p2.y);
  const guardY = (aliveYs.length ? Math.min(...aliveYs) : WORLD_H) - 12;

  for (let r = 0; r < currentRows; r++) {
    let anyAlive = false;
    for (const e of enemies) { if (e.alive && e.row === r) { anyAlive = true; break; } }
    if (!anyAlive) continue;
    const edgeMargin = Math.round(10 * scaleX);
    const dropDistance = Math.round(20 * scaleY);
    if (rowLeftX[r] < edgeMargin && rowDirs[r] < 0) { rowDirs[r] = 1; rowDrops[r] = dropDistance; }
    if (rowRightX[r] > WORLD_W - edgeMargin && rowDirs[r] > 0) { rowDirs[r] = -1; rowDrops[r] = dropDistance; }
    const dx = rowDirs[r] * enemySpeed * scaleX * dt;
    for (const e of enemies) {
      if (!e.alive || e.row !== r) continue;
      e.x += dx;
      if (rowDrops[r] > 0) e.y += 40 * scaleY * dt;
      if (e.y + e.h >= guardY) { triggerGameOver(); return; }
      e.cd -= dt;
      if (e.cd <= 0) {
        const activeEnemyBullets = bullets.reduce((n, b) => n + (b.owner === 'e' ? 1 : 0), 0);
        if (activeEnemyBullets < 10) {
          const enemyBulletSpeed = Math.round(240 * scaleY);
          const enemyBulletRadius = Math.round(3 * Math.min(scaleX, scaleY));
          bullets.push({ x: e.x + e.w / 2, y: e.y + e.h, vx: 0, vy: enemyBulletSpeed, r: enemyBulletRadius, color: '#38bdf8', owner: 'e' });
          e.cd = 1 + Math.random() * 4;
        } else {
          e.cd = 0.25 + Math.random() * 0.5;
        }
      }
    }
    rowLeftX[r] += dx;
    rowRightX[r] += dx;
    rowDrops[r] = Math.max(0, rowDrops[r] - 40 * scaleY * dt);
  }

  if (boss) {
    boss.x += boss.dir * boss.speed * dt;
    const bossMargin = Math.round(10 * scaleX);
    if (boss.x < bossMargin) { boss.x = bossMargin; boss.dir = 1; }
    if (boss.x + boss.w > WORLD_W - bossMargin) { boss.x = WORLD_W - bossMargin - boss.w; boss.dir = -1; }
    boss.cd -= dt;
    if (boss.cd <= 0) {
      const burst = Math.floor(Math.random() * 8) + 3;
      const bossBulletSpeed = Math.round(320 * scaleY);
      const bossBulletRadius = Math.round(4 * Math.min(scaleX, scaleY));
      for (let i = 0; i < burst; i++) {
        const px = boss.x + boss.w * ((i + 1) / (burst + 1));
        bullets.push({ x: px, y: boss.y + boss.h, vx: 0, vy: bossBulletSpeed, r: bossBulletRadius, color: '#a78bfa', owner: 'e' });
      }
      boss.cd = 0.5 + Math.random() * 1.0;
    }
  }

  bullets.forEach(b => { b.x += b.vx * dt; b.y += b.vy * dt; });
  bullets = bullets.filter(b => b.y > -10 && b.y < WORLD_H + 10);

  for (const b of bullets) {
    if (b.owner !== 'p') continue;
    if (boss) {
      const bx = b.x, by = b.y;
      if (bx > boss.x && bx < boss.x + boss.w && by > boss.y && by < boss.y + boss.h) {
        b.y = -9999;
        boss.hp = Math.max(0, boss.hp - 10);
        if (b.shooter === 'p1') {
          hitStreakP1++;
          if (hitStreakP1 % 3 === 0) multiplierP1 = Math.min(4, multiplierP1 + 1);
        } else if (b.shooter === 'p2') {
          hitStreakP2++;
          if (hitStreakP2 % 3 === 0) multiplierP2 = Math.min(4, multiplierP2 + 1);
        }
        updateScoreHud();
        if (boss.hp <= 0) {
          score += 2000;
          if (b.shooter === 'p1') scoreP1 += 2000; else if (b.shooter === 'p2') scoreP2 += 2000;
          updateScoreHud();
          boss = null;
          bullets = bullets.filter(bb => bb.owner !== 'e');
          enemies = [];
          triggerVictory();
          return;
        }
        continue;
      }
    }
    for (const e of enemies) {
      if (!e.alive) continue;
      if (b.x > e.x && b.x < e.x + e.w && b.y > e.y && b.y < e.y + e.h) {
        e.alive = false; b.y = -9999;
        const shooterMul = b.shooter === 'p2' ? multiplierP2 : multiplierP1;
        const gained = 10 * shooterMul;
        score += gained;
        if (b.shooter === 'p1') scoreP1 += gained; else if (b.shooter === 'p2') scoreP2 += gained;
        if (b.shooter === 'p1') {
          hitStreakP1++;
          if (hitStreakP1 % 3 === 0) multiplierP1 = Math.min(4, multiplierP1 + 1);
        } else if (b.shooter === 'p2') {
          hitStreakP2++;
          if (hitStreakP2 % 3 === 0) multiplierP2 = Math.min(4, multiplierP2 + 1);
        }
        recomputeProgress();
        updateScoreHud();
        break;
      }
    }
  }

  for (const b of bullets) {
    if (b.owner !== 'e') continue;
    if (p1 && p1.lives > 0 && p1.invuln <= 0 && b.x >= p1.x && b.x <= p1.x + p1.w && b.y >= p1.y && b.y <= p1.y + p1.h) {
      b.y = WORLD_H + 100;
      handlePlayerHit(p1);
      continue;
    }
    if (p2 && p2.lives > 0 && p2.invuln <= 0 && b.x >= p2.x && b.x <= p2.x + p2.w && b.y >= p2.y && b.y <= p2.y + p2.h) {
      b.y = WORLD_H + 100;
      handlePlayerHit(p2);
      continue;
    }
  }
}

function draw(): void {
  if (bgReady) ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height); else ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (mode !== 'none' && (p1 || p2)) {
    const guardY = Math.min(p1?.y ?? WORLD_H, p2?.y ?? WORLD_H) - 12;
    ctx.save(); ctx.setLineDash([8, 8]); ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, guardY); ctx.lineTo(canvas.width, guardY); ctx.stroke(); ctx.restore();
  }
  if (p1) { if (p1.invuln <= 0 || Math.floor(performance.now() / 120) % 2 !== 0) drawPlayerShip(ctx, p1); }
  if (p2) { if (p2.invuln <= 0 || Math.floor(performance.now() / 120) % 2 !== 0) drawPlayerShip(ctx, p2); }
  enemies.forEach(e => { if (!e.alive) return; drawEnemyShip(ctx, e); });
  if (boss) {
    drawBoss(ctx, boss, WORLD_W);
    const moveSpeed = boss.speed * (1 / 60);
    boss.x += boss.dir * moveSpeed;
    const bossMargin = Math.round(10 * scaleX);
    if (boss.x < bossMargin) { boss.x = bossMargin; boss.dir = 1; }
    if (boss.x + boss.w > WORLD_W - bossMargin) { boss.x = WORLD_W - bossMargin - boss.w; boss.dir = -1; }
  }
  bullets.forEach(b => { ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); });
  renderLives(livesEl, p1, p2);
}

function recomputeProgress(): void {
  if (score >= UNLOCK_3_SHOTS) playerShotCount = 3; else if (score >= UNLOCK_2_SHOTS) playerShotCount = 2; else playerShotCount = 1;
}

function triggerGameOver(): void {
  isGameOver = true;
  showDefeatOverlay(wrapper, score, p1, p2, () => { isGameOver = false; resetGame(); });
  //! fetch
}

function triggerVictory(): void {
  isGameOver = true;
  if (mode === 'coop') {
    const p1Bonus = (p1?.lives ?? 0) * 500;
    const p2Bonus = (p2?.lives ?? 0) * 500;
    const p1Total = scoreP1 + p1Bonus;
    const p2Total = scoreP2 + p2Bonus;
    const winner = p1Total === p2Total ? 'Égalité' : (p1Total > p2Total ? p1Name : p2Name);
    showVictoryOverlay(wrapper, score, p1, p2, () => { isGameOver = false; resetGame(); }, { mode, p1Score: scoreP1, p2Score: scoreP2, p1Bonus, p2Bonus, winner });
	//! fetch duo
	//! VOIR PAYLOAD BLOCKCHAIN API
  } else {
    showVictoryOverlay(wrapper, score, p1, p2, () => { isGameOver = false; resetGame(); });
	//! fetch solo
  }
}

function updateScoreHud(): void {
  if (mode === 'coop') {
    scoreP1El.textContent = `${pseudoUser} = ${scoreP1} x${multiplierP1}`;
    scoreP2El.textContent = `${p2Name} = ${scoreP2} x${multiplierP2}`;
  } else {
    scoreP1El.textContent = `Score: ${score}  x${multiplierP1}`;
  }
}

// Loop
let last = performance.now();
function loop(now: number = performance.now()) {
  const dt = Math.min(32, now - last) / 1000; last = now;
  if (mode !== 'none') { update(dt); draw(); }
  requestAnimationFrame(loop);
}
loop();

// Simple overlay for the hacker loader
function showHackerLoader(ms: number): Promise<void> {
  return new Promise((resolve) => {
    loaderEl.style.display = '';
    const timer = setTimeout(() => {
      loaderEl.style.display = 'none';
      clearTimeout(timer);
      resolve();
    }, ms);
  });
}
