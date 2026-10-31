const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
let p1, p2, ball, score1, score2, running, mode, keys = {};
const PADDLE_H = 80, PADDLE_W = 10, BALL_R = 8, SPEED = 4;

function init() {
  p1 = {x: 20, y: H/2 - PADDLE_H/2};
  p2 = {x: W - 30, y: H/2 - PADDLE_H/2};
  ball = {x: W/2, y: H/2, vx: SPEED * (Math.random() > 0.5 ? 1 : -1), vy: (Math.random()-0.5)*4};
  score1 = 0; score2 = 0;
  document.getElementById('p1').textContent = 0;
  document.getElementById('p2').textContent = 0;
  running = true;
  if (window._raf) cancelAnimationFrame(window._raf);
  window._raf = requestAnimationFrame(loop);
}

function loop() {
  if (!running) return;
  update();
  draw();
  window._raf = requestAnimationFrame(loop);
}

function update() {
  // player 1 (left) - W/S or ArrowUp/ArrowDown
  if (keys['w'] || keys['W'] || keys['ArrowUp']) p1.y -= 5;
  if (keys['s'] || keys['S'] || keys['ArrowDown']) p1.y += 5;
  p1.y = Math.max(0, Math.min(H - PADDLE_H, p1.y));
  // player 2
  if (mode === 'pvp') {
    // use separate keys? For simplicity, p2 uses I/K
    if (keys['i'] || keys['I']) p2.y -= 5;
    if (keys['k'] || keys['K']) p2.y += 5;
  } else {
    // AI
    const target = ball.y - PADDLE_H/2;
    if (p2.y + PADDLE_H/2 < target - 10) p2.y += 3.5;
    else if (p2.y + PADDLE_H/2 > target + 10) p2.y -= 3.5;
  }
  p2.y = Math.max(0, Math.min(H - PADDLE_H, p2.y));

  // ball
  ball.x += ball.vx;
  ball.y += ball.vy;
  if (ball.y - BALL_R < 0 || ball.y + BALL_R > H) ball.vy = -ball.vy;

  // paddle collision
  if (ball.x - BALL_R < p1.x + PADDLE_W && ball.y > p1.y && ball.y < p1.y + PADDLE_H) {
    ball.vx = Math.abs(ball.vx);
    ball.vy += (ball.y - (p1.y + PADDLE_H/2)) * 0.05;
  }
  if (ball.x + BALL_R > p2.x && ball.y > p2.y && ball.y < p2.y + PADDLE_H) {
    ball.vx = -Math.abs(ball.vx);
    ball.vy += (ball.y - (p2.y + PADDLE_H/2)) * 0.05;
  }

  // scoring
  if (ball.x < 0) { score2++; document.getElementById('p2').textContent = score2; resetBall(1); }
  if (ball.x > W) { score1++; document.getElementById('p1').textContent = score1; resetBall(-1); }
}

function resetBall(dir) {
  ball.x = W/2; ball.y = H/2;
  ball.vx = SPEED * dir;
  ball.vy = (Math.random() - 0.5) * 4;
}

function draw() {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, W, H);
  // center line
  ctx.strokeStyle = '#334155';
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(W/2, 0);
  ctx.lineTo(W/2, H);
  ctx.stroke();
  ctx.setLineDash([]);
  // paddles
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(p1.x, p1.y, PADDLE_W, PADDLE_H);
  ctx.fillRect(p2.x, p2.y, PADDLE_W, PADDLE_H);
  // ball
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
}

document.addEventListener('keydown', e => { keys[e.key] = true; });
document.addEventListener('keyup', e => { keys[e.key] = false; });
document.getElementById('mode').addEventListener('change', e => { mode = e.target.value; init(); });
document.getElementById('restart').addEventListener('click', init);
mode = document.getElementById('mode').value;
init();