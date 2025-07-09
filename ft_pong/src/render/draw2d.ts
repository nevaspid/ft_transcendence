import { WORLD_W, WORLD_H } from '../core/constants';
import { Paddle } from '../core/paddle';
import { Ball } from '../core/ball';

// export function drawScene(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, left: Paddle, right: Paddle, ball: Ball): void {
//   // ctx.fillStyle = '#000';
//   // ctx.fillRect(0, 0, canvas.width, canvas.height);

//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   ctx.save();
//   ctx.scale(canvas.width / WORLD_W, canvas.height / WORLD_H);

//   ctx.strokeStyle = '#444';
//   ctx.setLineDash([10, 10]);
//   ctx.beginPath();
//   ctx.moveTo(WORLD_W / 2, 0);
//   ctx.lineTo(WORLD_W / 2, WORLD_H);
//   ctx.stroke();
//   ctx.setLineDash([]);

//   // left.draw(ctx);
//   // right.draw(ctx);
//   // ball.draw(ctx);

//   ctx.restore();
// }

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

  // 🚫 DÉSACTIVER LA LIGNE CENTRALE 2D
  // Vérifier si le rendu 2D du terrain est activé
  const render2DField = (window as any).render2DField !== false;
  
  if (render2DField) {
    ctx.strokeStyle = '#444';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(WORLD_W / 2, 0);
    ctx.lineTo(WORLD_W / 2, WORLD_H);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Les paddles et la balle continuent de se dessiner normalement
  // left.draw(ctx);
  // right.draw(ctx);
  // ball.draw(ctx);

  ctx.restore();
}