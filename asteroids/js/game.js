const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
let ship, asteroids, bullets, score, lives, best, running, keys = {}, frame;
best = +localStorage.getItem('asteroids-best') || 0;
document.getElementById('best').textContent = best;

function init() {
  ship = {x: W/2, y: H/2, angle: -Math.PI/2, vx: 0, vy: 0};
  asteroids = []; bullets = [];
  score = 0; lives = 3; running = true; frame = 0;
  document.getElementById('score').textContent = 0;
  document.getElementById('lives').textContent = 3;
  // spawn asteroids
  for (let i = 0; i < 5; i++) spawnAsteroid();
  if (window._raf) cancelAnimationFrame(window._raf);
  window._raf = requestAnimationFrame(loop);
}

function spawnAsteroid(size = 3) {
  let x, y;
  do {
    x = Math.random() * W; y = Math.random() * H;
  } while (Math.hypot(x - ship.x, y - ship.y) < 100);
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.5 + Math.random() * 1.5;
  asteroids.push({x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, size, radius: size * 12, rot: Math.random()*Math.PI*2, rotSpeed: (Math.random()-0.5)*0.05});
}

function loop() {
  if (!running) return;
  update();
  draw();
  window._raf = requestAnimationFrame(loop);
}

function update() {
  // ship rotation/thrust
  if (keys['ArrowLeft']) ship.angle -= 0.06;
  if (keys['ArrowRight']) ship.angle += 0.06;
  if (keys['ArrowUp']) { ship.vx += Math.cos(ship.angle)*0.15; ship.vy += Math.sin(ship.angle)*0.15; }
  // friction
  ship.vx *= 0.99; ship.vy *= 0.99;
  ship.x = (ship.x + ship.vx + W) % W;
  ship.y = (ship.y + ship.vy + H) % H;

  // bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx; b.y += b.vy; b.life--;
    if (b.life <= 0 || b.x < 0 || b.x > W || b.y < 0 || b.y > H) { bullets.splice(i, 1); continue; }
    // collision with asteroids
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const a = asteroids[j];
      if (Math.hypot(b.x - a.x, b.y - a.y) < a.radius) {
        bullets.splice(i, 1);
        // split asteroid
        if (a.size > 1) {
          for (let k = 0; k < 2; k++) spawnAsteroid(a.size - 1);
          // fix position of new asteroids to a.x,a.y
          const newOnes = asteroids.splice(asteroids.length - 2, 2);
          newOnes.forEach(no => { no.x = a.x; no.y = a.y; });
          asteroids.push(...newOnes);
        }
        asteroids.splice(j, 1);
        score += a.size * 10;
        document.getElementById('score').textContent = score;
        if (score > best) { best = score; localStorage.setItem('asteroids-best', best); document.getElementById('best').textContent = best; }
        break;
      }
    }
  }

  // asteroids movement
  asteroids.forEach(a => {
    a.x = (a.x + a.vx + W) % W;
    a.y = (a.y + a.vy + H) % H;
    a.rot += a.rotSpeed;
  });

  // ship-asteroid collision
  for (const a of asteroids) {
    if (Math.hypot(ship.x - a.x, ship.y - a.y) < a.radius + 10) {
      lives--;
      document.getElementById('lives').textContent = lives;
      ship.x = W/2; ship.y = H/2; ship.vx = 0; ship.vy = 0;
      if (lives <= 0) { gameOver(); return; }
      break;
    }
  }

  // spawn more if empty
  if (asteroids.length === 0) {
    for (let i = 0; i < 5 + Math.floor(score/100); i++) spawnAsteroid();
  }
}

function draw() {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, W, H);
  // stars
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 60; i++) {
    const x = (i * 97 + frame) % W;
    const y = (i * 53) % H;
    ctx.fillRect(x, y, 1, 1);
  }
  // asteroids
  asteroids.forEach(a => {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const sides = 8 + a.size * 2;
    for (let i = 0; i < sides; i++) {
      const ang = a.rot + (i / sides) * Math.PI * 2;
      const r = a.radius * (0.8 + 0.2 * Math.sin(i * 2.3));
      const x = a.x + Math.cos(ang) * r;
      const y = a.y + Math.sin(ang) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  });
  // bullets
  ctx.fillStyle = '#fbbf24';
  bullets.forEach(b => { ctx.fillRect(b.x - 1, b.y - 1, 3, 3); });
  // ship
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ship.x + Math.cos(ship.angle) * 15, ship.y + Math.sin(ship.angle) * 15);
  ctx.lineTo(ship.x + Math.cos(ship.angle + 2.3) * 12, ship.y + Math.sin(ship.angle + 2.3) * 12);
  ctx.lineTo(ship.x + Math.cos(ship.angle - 2.3) * 12, ship.y + Math.sin(ship.angle - 2.3) * 12);
  ctx.closePath();
  ctx.stroke();
  // thrust
  if (keys['ArrowUp']) {
    ctx.strokeStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(ship.x + Math.cos(ship.angle + 2.8) * 8, ship.y + Math.sin(ship.angle + 2.8) * 8);
    ctx.lineTo(ship.x + Math.cos(ship.angle) * -8, ship.y + Math.sin(ship.angle) * -8);
    ctx.lineTo(ship.x + Math.cos(ship.angle - 2.8) * 8, ship.y + Math.sin(ship.angle - 2.8) * 8);
    ctx.stroke();
  }
  frame++;
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

let lastShot = 0;
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.code === 'Space') {
    e.preventDefault();
    if (running && Date.now() - lastShot > 200) {
      bullets.push({x: ship.x + Math.cos(ship.angle)*15, y: ship.y + Math.sin(ship.angle)*15, vx: Math.cos(ship.angle)*8, vy: Math.sin(ship.angle)*8, life: 60});
      lastShot = Date.now();
    }
  }
});
document.addEventListener('keyup', e => { keys[e.key] = false; });
document.getElementById('restart').addEventListener('click', init);
init();