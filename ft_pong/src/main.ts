console.log('Étape 1 OK : Vite + TS prêt');

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!; // le "!" indique que ctx ne sera jamais null

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

function resizeCanvas() {
  const ratio = GAME_WIDTH / GAME_HEIGHT;
  let w = window.innerWidth;
  let h = window.innerHeight;
  if (w / h > ratio) w = h * ratio; // bande latérale
  else               h = w / ratio; // bande horizontale
  canvas.width = w;
  canvas.height = h;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Paddle {
  readonly width = 15;
  readonly height = 100;
  public x: number;
  public y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x - this.width / 2,
                  this.y - this.height / 2,
                  this.width, this.height);
  }
}

class Ball {
  readonly radius = 8;
  public x: number;
  public y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

const leftPaddle = new Paddle(30, GAME_HEIGHT / 2);
const rightPaddle = new Paddle(GAME_WIDTH - 30, GAME_HEIGHT / 2);
const ball = new Ball(GAME_WIDTH / 2, GAME_HEIGHT / 2);

function update(_dt: number) {
  //dt = tmp ecouler entre 2 frames
  //implémenter logique du jeu
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.scale(canvas.width / GAME_WIDTH, canvas.height / GAME_HEIGHT);

  ctx.strokeStyle = '#444';
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(GAME_WIDTH / 2, 0);
  ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
  
  leftPaddle.draw(ctx);
  rightPaddle.draw(ctx);
  ball.draw(ctx);

  ctx.restore();
}

let lastTime = performance.now();
function gameLoop(now: number) {
  const dt = (now - lastTime) / 1000; //conversion secondes
  lastTime = now;

  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

console.log('Étape 2 OK : Boucle OK');
console.log('Étape 3 OK : terrain + paddles + balles OK');