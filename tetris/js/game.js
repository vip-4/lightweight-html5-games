const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const nextC = document.getElementById('next');
const nctx = nextC.getContext('2d');
const COLS = 10, ROWS = 20, BLOCK = 24;
const COLORS = ['#000', '#00f0f0', '#0000f0', '#f0a000', '#f0f000', '#00f000', '#a000f0', '#f00000'];
const SHAPES = [
  [],
  [[1,1,1,1]],
  [[1,0,0],[1,1,1]],
  [[0,0,1],[1,1,1]],
  [[1,1],[1,1]],
  [[0,1,1],[1,1,0]],
  [[0,1,0],[1,1,1]],
  [[1,1,0],[0,1,1]]
];
let board, piece, next, score, lines, level, dropInterval, dropTimer, gameOver;

function newPiece() {
  const t = Math.floor(Math.random() * 7) + 1;
  const shape = SHAPES[t].map(r => [...r]);
  return { type: t, shape, x: 3, y: 0 };
}

function init() {
  board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  piece = newPiece();
  next = newPiece();
  score = 0; lines = 0; level = 1;
  gameOver = false;
  dropInterval = 800;
  updateUI();
  if (dropTimer) clearInterval(dropTimer);
  dropTimer = setInterval(drop, dropInterval);
  draw();
}

function collide(p, dx = 0, dy = 0, rot = false) {
  let shape = p.shape;
  if (rot) {
    const n = shape[0].length, m = shape.length;
    const r = Array.from({length: n}, (_, i) => Array.from({length: m}, (_, j) => shape[m - 1 - j][i]));
    shape = r;
  }
  for (let y = 0; y < shape.length; y++)
    for (let x = 0; x < shape[y].length; x++)
      if (shape[y][x]) {
        const nx = p.x + x + dx, ny = p.y + y + dy;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && board[ny][nx]) return true;
      }
  return false;
}

function rotate() {
  if (!collide(piece, 0, 0, true)) {
    const n = piece.shape[0].length, m = piece.shape.length;
    piece.shape = Array.from({length: n}, (_, i) => Array.from({length: m}, (_, j) => piece.shape[m - 1 - j][i]));
  }
}

function drop() {
  if (gameOver) return;
  if (!collide(piece, 0, 1)) {
    piece.y++;
  } else {
    // lock
    piece.shape.forEach((row, y) => row.forEach((v, x) => {
      if (v && piece.y + y >= 0) board[piece.y + y][piece.x + x] = piece.type;
    }));
    // clear lines
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y].every(v => v)) {
        board.splice(y, 1);
        board.unshift(Array(COLS).fill(0));
        cleared++;
        y++;
      }
    }
    if (cleared) {
      const pts = [0, 100, 300, 500, 800];
      score += (pts[cleared] || 800) * level;
      lines += cleared;
      level = Math.floor(lines / 10) + 1;
      dropInterval = Math.max(100, 800 - (level - 1) * 70);
      clearInterval(dropTimer);
      dropTimer = setInterval(drop, dropInterval);
      updateUI();
    }
    piece = next;
    next = newPiece();
    if (collide(piece, 0, 0)) { gameOver = true; clearInterval(dropTimer); draw(); alert('游戏结束！分数: ' + score); }
  }
  draw();
}

function hardDrop() {
  while (!collide(piece, 0, 1)) piece.y++;
  drop();
}

function move(dx) {
  if (!collide(piece, dx, 0)) piece.x += dx;
  draw();
}

function updateUI() {
  document.getElementById('score').textContent = score;
  document.getElementById('level').textContent = level;
  document.getElementById('lines').textContent = lines;
}

function drawBlock(ctx, x, y, type, bs) {
  ctx.fillStyle = COLORS[type];
  ctx.fillRect(x * bs, y * bs, bs, bs);
  ctx.strokeStyle = '#000';
  ctx.strokeRect(x * bs, y * bs, bs, bs);
}

function draw() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  board.forEach((row, y) => row.forEach((v, x) => { if (v) drawBlock(ctx, x, y, v, BLOCK); }));
  if (piece) piece.shape.forEach((row, y) => row.forEach((v, x) => {
    if (v && piece.y + y >= 0) drawBlock(ctx, piece.x + x, piece.y + y, piece.type, BLOCK);
  }));
  // next
  nctx.fillStyle = '#0f172a';
  nctx.fillRect(0, 0, nextC.width, nextC.height);
  const ns = 16;
  const offX = (nextC.width - next.shape[0].length * ns) / 2;
  const offY = (nextC.height - next.shape.length * ns) / 2;
  next.shape.forEach((row, y) => row.forEach((v, x) => {
    if (v) { nctx.fillStyle = COLORS[v]; nctx.fillRect(offX + x * ns, offY + y * ns, ns, ns); nctx.strokeStyle = '#000'; nctx.strokeRect(offX + x * ns, offY + y * ns, ns, ns); }
  }));
}

document.addEventListener('keydown', e => {
  if (gameOver) return;
  if (e.key === 'ArrowLeft') move(-1);
  else if (e.key === 'ArrowRight') move(1);
  else if (e.key === 'ArrowDown') drop();
  else if (e.key === 'ArrowUp') { rotate(); draw(); }
  else if (e.key === ' ') { e.preventDefault(); hardDrop(); }
});

document.getElementById('restart').addEventListener('click', init);
init();