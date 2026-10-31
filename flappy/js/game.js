const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
let bird, pipes, score, best, running, frame;
best = +localStorage.getItem('flappy-best') || 0;
document.getElementById('best').textContent = best;

function init() {
  bird = {x: 60, y: H/2, vy: 0};
  pipes = [];
  score = 0;
  running = true;
  frame = 0;
  document.getElementById('score').textContent = 0;
  if (window._raf) cancelAnimationFrame(window._raf);
  window._raf = requestAnimationFrame(loop);
}

function jump() {
  if (!running) return;
  bird.vy = -7;
}

function loop() {
  if (!running) return;
  update();
  draw();
  window._raf = requestAnimationFrame(loop);
}

function update() {
  bird.vy += 0.4;
  bird.y += bird.vy;
  if (bird.y + 12 > H || bird.y - 12 < 0) { gameOver(); return; }
  // pipes
  if (frame % 90 === 0) {
    const gap = 130;
    const topH = 60 + Math.random() * (H - gap - 120);
    pipes.push({x: W, topH, gap, scored: false});
  }
  frame++;
  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= 2.5;
    // collision
    if (bird.x + 12 > p.x && bird.x - 12 < p.x + 40) {
      if (bird.y - 12 < p.topH || bird.y + 12 > p.topH + p.gap) { gameOver(); return; }
    }
    if (!p.scored && p.x + 40 < bird.x) { p.scored = true; score++; document.getElementById('score').textContent = score; if (score > best) { best = score; localStorage.setItem('flappy-best', best); document.getElementById('best').textContent = best; } }
    if (p.x + 40 < 0) pipes.splice(i, 1);
  }
}

function draw() {
  // sky
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);
  // ground
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, H - 20, W, 20);
  // pipes
  pipes.forEach(p => {
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(p.x, 0, 40, p.topH);
    ctx.fillRect(p.x, p.topH + p.gap, 40, H - p.topH - p.gap);
  });
  // bird
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(bird.x + 4, bird.y - 3, 3, 0, Math.PI * 2);
  ctx.fill();
}

function gameOver() {
  running = false;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('游戏结束', W/2, H/2 - 10);
  ctx.font = '16px sans-serif';
  ctx.fillText('分数: ' + score, W/2, H/2 + 20);
}

canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', e => { e.preventDefault(); jump(); }, {passive: false});
document.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); jump(); } });
document.getElementById('restart').addEventListener('click', init);
init();