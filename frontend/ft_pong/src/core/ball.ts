import { BALL_SPEED, WORLD_W, WORLD_H, MIN_RAD, MAX_RAD } from './constants';

export class Ball {
  readonly size = 16;
  vx = 0;
  vy = 0;
  hitCooldown = 0;
  constructor(public x: number, public y: number) {}

  setDirection(direction: 'left' | 'right' | 'random'): void {
    let towardRight = direction === 'right';
    if (direction === 'random') towardRight = Math.random() < 0.5;

    const theta = MIN_RAD + Math.random() * (MAX_RAD - MIN_RAD);
    let signY = 1;
    const rand = Math.random();
    if (rand < 0.5) {
      signY = -1;
    }

    const ux = Math.cos(theta);
    const uy = Math.sin(theta) * signY;

    let dirX = -1;
    if (towardRight) {
      dirX = 1;
    } else {
      dirX = -1;
    }
    this.vx = BALL_SPEED * ux * dirX;
    this.vy = BALL_SPEED * uy;
  }

  reset(dir: 'left' | 'right' | 'random'): void {
    this.x = WORLD_W / 2;
    this.y = WORLD_H / 2;
    this.setDirection(dir);
    this.hitCooldown = 0;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
}
