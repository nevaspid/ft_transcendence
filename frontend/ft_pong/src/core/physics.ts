import { Ball } from './ball';
import { Paddle } from './paddle';
import { WORLD_W, WORLD_H } from './constants';

const MAX_BOUNCE_ANGLE = 60 * Math.PI / 180;
const SPEED_INCREASE = 1.03;

export function step(ball: Ball, left: Paddle, right: Paddle, dt: number): 'left' | 'right' | null {
	ball.hitCooldown = Math.max(0, ball.hitCooldown - dt);
	ball.x += ball.vx * dt;
	ball.y += ball.vy * dt;

	const half = ball.size / 2;
	if (ball.y - half < 0) {
		ball.y = half;
		if (ball.vy < 0)
			ball.vy = -ball.vy;
	}
	if (ball.y + half > WORLD_H) {
		ball.y = WORLD_H - half;
		if (ball.vy > 0) ball.vy = -ball.vy;
	}
	if (ball.hitCooldown === 0) {
		if (ball.vx < 0) {
			collideWithPaddle(ball, left, /*towardRight=*/true);
		} else {
			collideWithPaddle(ball, right, /*towardRight=*/false);
		}
	}
	if (ball.x + half < 0)
		return 'left';
	if (ball.x - half > WORLD_W)
		return 'right';
	return null;
}

function reflectFromPaddle(ball: Ball, paddle: Paddle, towardRight: boolean): void {
	const relativeY = (ball.y - paddle.y) / (paddle.h / 2);
	const bounceAngle = relativeY * MAX_BOUNCE_ANGLE;

	const newSpeed = Math.hypot(ball.vx, ball.vy) * SPEED_INCREASE;
	let dirX: number;
	if (towardRight) {
		dirX = 1;
	} else {
		dirX = -1;
	}
	ball.vx = newSpeed * Math.cos(bounceAngle) * dirX;
	ball.vy = newSpeed * Math.sin(bounceAngle);
}

function collideWithPaddle(ball: Ball, paddle: Paddle, towardRight: boolean): boolean {
	const half = ball.size / 2;
	const dx = ball.x - paddle.x;
	const dy = ball.y - paddle.y;

	const overlapX = (paddle.w / 2 + half) - Math.abs(dx);
	const overlapY = (paddle.h / 2 + half) - Math.abs(dy);

	if (overlapX <= 0 || overlapY <= 0)
		return false;
	if (overlapX < overlapY) {
    	if (towardRight) {
   		   ball.x = paddle.x + paddle.w / 2 + half;
    	} else {
   		   ball.x = paddle.x - paddle.w / 2 - half;
   		}
   		 reflectFromPaddle(ball, paddle, towardRight);
 	} else {
   		if (dy > 0) {
      		ball.y = paddle.y + paddle.h / 2 + half;
    	} else {
      		ball.y = paddle.y - paddle.h / 2 - half;
    	}
    	ball.vy = -ball.vy;
  	}
	ball.hitCooldown = 0.2;
  	return true;
}