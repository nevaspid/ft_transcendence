import { WORLD_W, WORLD_H } from '../core/constants';
import { Paddle } from '../core/paddle';
import { Ball } from '../core/ball';

export function drawScene(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  left: Paddle, 
  right: Paddle, 
  ball: Ball
): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(canvas.width / WORLD_W, canvas.height / WORLD_H);

  // Bordures du terrain
  ctx.strokeStyle = '#8B4513'; // Marron pour les bordures
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  
  // Rectangle de bordure
  ctx.strokeRect(0, 0, WORLD_W, WORLD_H);

  // Dessiner les paddles et la balle
  // left.draw(ctx);
  // right.draw(ctx);
  // ball.draw(ctx);

  ctx.restore();
}