const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const size = 20, cols = 20, rows = 20;
let snake, dir, food, score, best, loop, speed;
best = +localStorage.getItem('snake-best') || 0;
document.getElementById('best').textContent = best;

function init() {
  snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
  dir = {x: 1, y: 0};
  nextDir = {x: 1, y: 0};
  placeFood();
  score = 0;
  speed = 150;
  document.getElementById('score').textContent = score;
  if (loop) clearInterval(loop);
  loop = setInterval(tick, speed);
}

let nextDir = {x: 1, y: 0};

function placeFood() {
  do {
    food = {x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows)};
  } while (snake.some(s => s.x === food.x && s.y === food.y));
}

function tick() {
  dir = nextDir;
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver(); return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    document.getElementById('score').textContent = score;
    if (score > best) { best = score; localStorage.setItem('snake-best', best); document.getElementById('best').textContent = best; }
    placeFood();
    if (speed > 60) { speed -= 2; clearInterval(loop); loop = setInterval(tick, speed); }
  } else {
    snake.pop();
  }
  draw();
}

function draw() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // food
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(food.x * size + 2, food.y * size + 2, size - 4, size - 4);
  // snake
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e';
    ctx.fillRect(s.x * size + 1, s.y * size + 1, size - 2, size - 2);
  });
}

function gameOver() {
  clearInterval(loop);
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('游戏结束', canvas.width/2, canvas.height/2 - 10);
  ctx.font = '16px sans-serif';
  ctx.fillText('分数: ' + score, canvas.width/2, canvas.height/2 + 20);
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { if (dir.y !== 1) nextDir = {x:0, y:-1}; }
  else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { if (dir.y !== -1) nextDir = {x:0, y:1}; }
  else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { if (dir.x !== 1) nextDir = {x:-1, y:0}; }
  else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { if (dir.x !== -1) nextDir = {x:1, y:0}; }
});

// Touch
let tx, ty;
canvas.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; e.preventDefault(); }, {passive:false});
canvas.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tx;
  const dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 20 && dir.x !== -1) nextDir = {x:1, y:0};
    else if (dx < -20 && dir.x !== 1) nextDir = {x:-1, y:0};
  } else {
    if (dy > 20 && dir.y !== -1) nextDir = {x:0, y:1};
    else if (dy < -20 && dir.y !== 1) nextDir = {x:0, y:-1};
  }
});

document.getElementById('restart').addEventListener('click', init);
init(); draw();