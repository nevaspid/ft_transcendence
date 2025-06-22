console.log('Étape 1 OK : Vite + TS prêt');

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function update(dt: number) {
  //dt = tmp ecouler entre 2 frames
  //implémenter logique du jeu
}

function draw() {
  ctx.fillStyle = '#000';
  ctx?.fillRect(0, 0, canvas.width, canvas.height);
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