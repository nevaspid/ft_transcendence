import { fitCanvas }  from './io/viewport';
import { pressed }    from './io/keyboard';

import { Paddle }     from './core/paddle';
import { Ball }       from './core/ball';
import { step }       from './core/physics';
import { drawScene }  from './render/draw2d';

import {
  WORLD_H,
  PADDLE_SPEED,
  WIN_SCORE,
  START_DELAY_SEC,
  ROUND_DELAY_SEC
} from './core/constants';

import type { GamePhase } from './core/types';
import { drawOverlay }    from './render/hud';

const wrapper = document.querySelector<HTMLDivElement>('.game-wrapper')!;
const hud     = document.getElementById('hud')! as HTMLElement;
const scoreEl = document.getElementById('score')!;

const canvas = document.createElement('canvas');
canvas.id = 'game';
wrapper.appendChild(canvas);
const ctx = canvas.getContext('2d')!;

const left   = new Paddle(30, WORLD_H / 2);
const right  = new Paddle(770, WORLD_H / 2);
const ball   = new Ball(0, 0);

let scoreL = 0;
let scoreR = 0;

function updateScore(): void {
  scoreEl.textContent = `P1 : ${scoreL} | P2 : ${scoreR}`;
}

let phase: GamePhase = 'starting';
let countdown = START_DELAY_SEC;

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
  if (pressed('s'))           left.move(+dy);
  if (pressed('z'))           left.move(-dy);
  if (pressed('ArrowDown'))  right.move(+dy);
  if (pressed('ArrowUp'))    right.move(-dy);

  const point = step(ball, left, right, dt);
  if (point === 'left')  { scoreR++; afterPoint('left');  }
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

fitCanvas(wrapper, hud, canvas);
window.addEventListener('resize', () => fitCanvas(wrapper, hud, canvas));

let last = performance.now();
function loop(now: number = performance.now()): void {
  const dt = Math.min(now - last, 32) / 1000;
  last = now;

  countdown = Math.max(0, countdown - dt);

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

  drawScene(ctx, canvas, left, right, ball);

  if (phase === 'starting' || phase === 'between') {
    drawOverlay(ctx, canvas, Math.ceil(countdown).toString());
  }
  if (phase === 'gameover') {
    const winner = scoreL > scoreR ? 'Player 1 wins!' : 'Player 2 wins!';
    drawOverlay(ctx, canvas, winner);
  }

  requestAnimationFrame(loop);
}

updateScore();
ball.reset('random');
setPhase('starting', START_DELAY_SEC);
requestAnimationFrame(loop);
