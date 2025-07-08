import { WORLD_H } from './constants';

export class Paddle {
  readonly w = 15;
  readonly h = 100;

  constructor(public x: number, public y: number) {}

  move(dy: number): void {
    this.y = Math.min(Math.max(this.y + dy, this.h / 2), WORLD_H - this.h / 2);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
  }
}