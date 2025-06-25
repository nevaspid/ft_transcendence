import { fitCanvas } from './io/viewport';
import { pressed }   from './io/keyboard';

import { Paddle } from './core/paddle';
import { Ball }   from './core/ball';
import { step }   from './core/physics';
import { drawScene } from './render/draw2d';

import { WORLD_H, PADDLE_SPEED } from './core/constants';

const wrapper = document.querySelector<HTMLDivElement>('.game-wrapper')!;
const hud     = document.getElementById('hud')! as HTMLElement;
const scoreEl = document.getElementById('score')!;

const canvas = document.createElement('canvas');
canvas.id = 'game';
wrapper.appendChild(canvas);
const ctx = canvas.getContext('2d')!;

const left  = new Paddle(30, WORLD_H / 2);
const right = new Paddle(770, WORLD_H / 2);
const ball  = new Ball(0, 0);

let scoreL = 0;
let scoreR = 0;
function updateScore() {
  scoreEl.textContent = `P1 : ${scoreL} | P2 : ${scoreR}`;
}

function newRound(direction: 'left' | 'right' | 'random') {
  ball.reset(direction);
}

fitCanvas(wrapper, hud, canvas);
window.addEventListener('resize', () => fitCanvas(wrapper, hud, canvas));

let last = performance.now();
function loop(now = performance.now()) {
  const dtSec = Math.min(now - last, 32) / 1000;
  last = now;

  const dy = PADDLE_SPEED * dtSec;
  if (pressed('s')) left.move(+dy);
  if (pressed('z')) left.move(-dy);
  if (pressed('ArrowDown')) right.move(+dy);
  if (pressed('ArrowUp'))   right.move(-dy);

  const point = step(ball, left, right, dtSec);
  if (point === 'left') {
    scoreL++; updateScore(); newRound('left');
  } else if (point === 'right') {
    scoreR++; updateScore(); newRound('right');
  }

  drawScene(ctx, canvas, left, right, ball);
  requestAnimationFrame(loop);
}
updateScore();
newRound('random');
requestAnimationFrame(loop);
