const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
let player, aliens, bullets, alienBullets, score, lives, level, running, keys = {}, frame, alienDir, alienSpeed;
const ALIEN_ROWS = 4, ALIEN_COLS = 8, ALIEN_W = 36, ALIEN_H = 24, ALIEN_PAD = 8;

function init() {
  player = {x: W/2 - 20, y: H - 40, w: 40, h: 20};
  bullets = []; alienBullets = [];
  score = 0; lives = 3; level = 1;
  document.getElementById('score').textContent = 0;
  document.getElementById('lives').textContent = 3;
  document.getElementById('level').textContent = 1;
  spawnAliens();
  alienDir = 1; alienSpeed = 0.5;
  running = true;
  if (window._raf) cancelAnimationFrame(window._raf);
  window._raf = requestAnimationFrame(loop);
}

function spawnAliens() {
  aliens = [];
  for (let r = 0; r < ALIEN_ROWS; r++)
    for (let c = 0; c < ALIEN_COLS; c++)
      aliens.push({x: 40 + c * (ALIEN_W + ALIEN_PAD), y: 40 + r * (ALIEN_H + ALIEN_PAD), w: ALIEN_W, h: ALIEN_H, alive: true, row: r});
}

function loop() {
  if (!running) return;
  update();
  draw();
  window._raf = requestAnimationFrame(loop);
}

function update() {
  // player movement
  if (keys['ArrowLeft']) player.x = Math.max(0, player.x - 5);
  if (keys['ArrowRight']) player.x = Math.min(W - player.w, player.x + 5);

  // aliens movement
  let hitEdge = false;
  aliens.forEach(a => {
    if (!a.alive) return;
    a.x += alienDir * alienSpeed;
    if (a.x + a.w > W - 10 || a.x < 10) hitEdge = true;
  });
  if (hitEdge) {
    alienDir = -alienDir;
    aliens.forEach(a => { if (a.alive) a.y += 10; });
  }

  // alien shooting
  if (Math.random() < 0.02 && aliens.some(a => a.alive)) {
    const shooters = aliens.filter(a => a.alive);
    const shooter = shooters[Math.floor(Math.random() * shooters.length)];
    alienBullets.push({x: shooter.x + shooter.w/2 - 2, y: shooter.y + shooter.h, vy: 3});
  }

  // bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.y -= 6;
    if (b.y < 0) { bullets.splice(i, 1); continue; }
    for (const a of aliens) {
      if (!a.alive) continue;
      if (b.x > a.x && b.x < a.x + a.w && b.y > a.y && b.y < a.y + a.h) {
        a.alive = false;
        bullets.splice(i, 1);
        score += (4 - a.row) * 10;
        document.getElementById('score').textContent = score;
        break;
      }
    }
  }

  // alien bullets
  for (let i = alienBullets.length - 1; i >= 0; i--) {
    const b = alienBullets[i];
    b.y += b.vy;
    if (b.y > H) { alienBullets.splice(i, 1); continue; }
    if (b.x > player.x && b.x < player.x + player.w && b.y > player.y && b.y < player.y + player.h) {
      alienBullets.splice(i, 1);
      lives--;
      document.getElementById('lives').textContent = lives;
      if (lives <= 0) { gameOver(); return; }
    }
  }

  // check win
  if (aliens.every(a => !a.alive)) {
    level++;
    document.getElementById('level').textContent = level;
    alienSpeed += 0.3;
    spawnAliens();
  }

  // check game over (aliens reach bottom)
  if (aliens.some(a => a.alive && a.y + a.h >= player.y)) {
    gameOver(); return;
  }
}

function draw() {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, H);
  // stars
  ctx.fillStyle = '#333';
  for (let i = 0; i < 50; i++) ctx.fillRect((i*137)%W, (i*89)%H, 1, 1);
  // player
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  // aliens
  aliens.forEach(a => {
    if (!a.alive) return;
    const colors = ['#ef4444','#f97316','#eab308','#22c55e'];
    ctx.fillStyle = colors[a.row];
    ctx.fillRect(a.x, a.y, a.w, a.h);
    // eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(a.x + 8, a.y + 8, 6, 6);
    ctx.fillRect(a.x + a.w - 14, a.y + 8, 6, 6);
  });
  // bullets
  ctx.fillStyle = '#fbbf24';
  bullets.forEach(b => ctx.fillRect(b.x - 2, b.y, 4, 8));
  // alien bullets
  ctx.fillStyle = '#ef4444';
  alienBullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 8));
}

function gameOver() {
  running = false;
  cancelAnimationFrame(window._raf);
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('游戏结束', W/2, H/2 - 10);
  ctx.font = '18px sans-serif';
  ctx.fillText('分数: ' + score, W/2, H/2 + 25);
}

document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.code === 'Space') {
    e.preventDefault();
    if (running) bullets.push({x: player.x + player.w/2, y: player.y, vy: 6});
  }
});
document.addEventListener('keyup', e => { keys[e.key] = false; });
document.getElementById('restart').addEventListener('click', init);
init();