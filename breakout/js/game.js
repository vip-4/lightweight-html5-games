const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const BRICK_ROWS = 5, BRICK_COLS = 8, BRICK_W = 56, BRICK_H = 20, BRICK_PAD = 4, BRICK_TOP = 40;
let paddle, ball, bricks, score, lives, running, dx, dy;

function init() {
  paddle = {x: W/2 - 40, y: H - 20, w: 80, h: 12};
  ball = {x: W/2, y: H/2, r: 6};
  dx = 3; dy = -3;
  score = 0; lives = 3;
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = lives;
  bricks = [];
  const colors = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6'];
  for (let r = 0; r < BRICK_ROWS; r++)
    for (let c = 0; c < BRICK_COLS; c++)
      bricks.push({x: c*(BRICK_W+BRICK_PAD)+BRICK_PAD, y: r*(BRICK_H+BRICK_PAD)+BRICK_TOP, w: BRICK_W, h: BRICK_H, color: colors[r], alive: true});
  running = true;
  requestAnimationFrame(loop);
}

function loop() {
  if (!running) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

function update() {
  ball.x += dx; ball.y += dy;
  if (ball.x - ball.r < 0 || ball.x + ball.r > W) dx = -dx;
  if (ball.y - ball.r < 0) dy = -dy;
  if (ball.y + ball.r > H) { lives--; document.getElementById('lives').textContent = lives; if (lives <= 0) { running = false; alert('游戏结束！分数: ' + score); return; } ball.x = W/2; ball.y = H/2; dx = 3; dy = -3; }
  // paddle collision
  if (ball.y + ball.r >= paddle.y && ball.x >= paddle.x && ball.x <= paddle.x + paddle.w) {
    dy = -Math.abs(dy);
    const hit = (ball.x - (paddle.x + paddle.w/2)) / (paddle.w/2);
    dx = hit * 4;
  }
  // brick collision
  bricks.forEach(b => {
    if (!b.alive) return;
    if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w && ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
      b.alive = false; dy = -dy; score += 10; document.getElementById('score').textContent = score;
    }
  });
  if (bricks.every(b => !b.alive)) { running = false; setTimeout(() => { alert('你赢了！分数: ' + score); init(); }, 100); }
}

function draw() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);
  bricks.forEach(b => { if (b.alive) { ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.w, b.h); } });
  ctx.fillStyle = '#fb923c';
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  paddle.x = (e.clientX - rect.left) * scaleX - paddle.w/2;
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
});

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  paddle.x = (e.touches[0].clientX - rect.left) * scaleX - paddle.w/2;
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
}, {passive: false});

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') paddle.x = Math.max(0, paddle.x - 20);
  if (e.key === 'ArrowRight') paddle.x = Math.min(W - paddle.w, paddle.x + 20);
});

document.getElementById('restart').addEventListener('click', init);
init();