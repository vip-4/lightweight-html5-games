const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const CELL = 40;
// Level data: # = wall, @ = player, $ = box, . = target, * = box on target, + = player on target, space = floor
const LEVELS = [
  "#####\n#@$.#\n#####",
  "#######\n#     #\n#  $  #\n#  .  #\n#  @  #\n#######",
  "  #####\n###   #\n#.@$  #\n###  .#\n#     #\n#  ####\n#  #\n####",
  "########\n#      #\n#  $   #\n#   .  #\n#   @  #\n########",
  "########\n#      #\n#  $$  #\n#  ..  #\n#  @   #\n########"
];
let level = 0, grid = [], player = {r:0,c:0}, boxes = [], targets = [], history = [], moves = 0;

function parseLevel(str) {
  const lines = str.trim().split('\n');
  const rows = lines.length;
  const cols = Math.max(...lines.map(l => l.length));
  grid = Array.from({length: rows}, () => Array(cols).fill(1)); // 1=wall
  boxes = []; targets = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = (lines[r][c] || ' ');
      if (ch === ' ' || ch === '.') { grid[r][c] = 0; }
      if (ch === '#') grid[r][c] = 1;
      if (ch === '@' || ch === '+') { player = {r, c}; grid[r][c] = 0; }
      if (ch === '$' || ch === '*') { boxes.push({r, c}); grid[r][c] = 0; }
      if (ch === '.' || ch === '*' || ch === '+') { targets.push({r, c}); }
    }
  }
  moves = 0; history = [];
  document.getElementById('level').textContent = level + 1;
  document.getElementById('moves').textContent = moves;
  document.getElementById('info').textContent = '';
}

function init() {
  parseLevel(LEVELS[level % LEVELS.length]);
  render();
}

function isWall(r, c) { return r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] === 1; }
function isBox(r, c) { return boxes.some(b => b.r === r && b.c === c); }
function boxIndex(r, c) { return boxes.findIndex(b => b.r === r && b.c === c); }

function move(dr, dc) {
  if (moves === undefined) return;
  const nr = player.r + dr, nc = player.c + dc;
  if (isWall(nr, nc)) return;
  const bi = boxIndex(nr, nc);
  if (bi >= 0) {
    const br = nr + dr, bc = nc + dc;
    if (isWall(br, bc) || isBox(br, bc)) return;
    // push box
    history.push({player: {r: player.r, c: player.c}, box: {idx: bi, from: {r: nr, c: nc}, to: {r: br, c: bc}}, moves});
    boxes[bi] = {r: br, c: bc};
  } else {
    history.push({player: {r: player.r, c: player.c}, box: null, moves});
  }
  player = {r: nr, c: nc};
  moves++;
  document.getElementById('moves').textContent = moves;
  render();
  checkWin();
}

function undo() {
  if (history.length === 0) return;
  const last = history.pop();
  player = last.player;
  if (last.box) {
    const bi = last.box.idx;
    boxes[bi] = last.box.from;
  }
  moves = last.moves;
  document.getElementById('moves').textContent = moves;
  render();
}

function checkWin() {
  const allOnTarget = targets.every(t => boxes.some(b => b.r === t.r && b.c === t.c));
  if (allOnTarget && boxes.length === targets.length) {
    document.getElementById('info').textContent = '恭喜通关！';
  }
}

function render() {
  const rows = grid.length, cols = grid[0].length;
  canvas.width = cols * CELL;
  canvas.height = rows * CELL;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = c * CELL, y = r * CELL;
      if (grid[r][c] === 1) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(x, y, CELL, CELL);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y, CELL, CELL);
        // target
        if (targets.some(t => t.r === r && t.c === c)) {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(x + CELL/2, y + CELL/2, 6, 0, Math.PI*2);
          ctx.fill();
        }
      }
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(x, y, CELL, CELL);
    }
  // boxes
  boxes.forEach(b => {
    const onTarget = targets.some(t => t.r === b.r && t.c === b.c);
    ctx.fillStyle = onTarget ? '#22c55e' : '#f97316';
    ctx.fillRect(b.c * CELL + 4, b.r * CELL + 4, CELL - 8, CELL - 8);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(b.c * CELL + 4, b.r * CELL + 4, CELL - 8, CELL - 8);
  });
  // player
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(player.c * CELL + CELL/2, player.r * CELL + CELL/2, 12, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('@', player.c * CELL + CELL/2, player.r * CELL + CELL/2);
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') move(-1, 0);
  else if (e.key === 'ArrowDown') move(1, 0);
  else if (e.key === 'ArrowLeft') move(0, -1);
  else if (e.key === 'ArrowRight') move(0, 1);
  else if (e.key === 'z' || e.key === 'Z') undo();
});

document.getElementById('undo').addEventListener('click', undo);
document.getElementById('restart').addEventListener('click', init);
document.getElementById('next-level').addEventListener('click', () => { level = (level + 1) % LEVELS.length; init(); });

init();