const SIZE = 4;
let grid = [], score = 0, best = +localStorage.getItem('2048-best') || 0;
const gridEl = document.getElementById('grid');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');

function init() {
  grid = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  score = 0;
  addTile(); addTile();
  render();
}

function addTile() {
  const empty = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (grid[r][c] === 0) empty.push({r, c});
  if (!empty.length) return;
  const {r, c} = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
  gridEl.innerHTML = '';
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const v = grid[r][c];
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = v || '';
      if (v) cell.dataset.val = v;
      gridEl.appendChild(cell);
    }
  scoreEl.textContent = score;
  if (score > best) { best = score; localStorage.setItem('2048-best', best); }
  bestEl.textContent = best;
}

function slide(row) {
  const arr = row.filter(x => x);
  const merged = [];
  let i = 0;
  while (i < arr.length) {
    if (i + 1 < arr.length && arr[i] === arr[i+1]) {
      merged.push(arr[i] * 2);
      score += arr[i] * 2;
      i += 2;
    } else {
      merged.push(arr[i]);
      i++;
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return merged;
}

function move(dir) {
  let changed = false;
  if (dir === 'left' || dir === 'right') {
    for (let r = 0; r < SIZE; r++) {
      const row = dir === 'left' ? grid[r] : [...grid[r]].reverse();
      const newRow = slide(row);
      const final = dir === 'left' ? newRow : newRow.reverse();
      if (final.join() !== grid[r].join()) changed = true;
      grid[r] = final;
    }
  } else {
    for (let c = 0; c < SIZE; c++) {
      const col = [];
      for (let r = 0; r < SIZE; r++) col.push(grid[r][c]);
      const reversed = dir === 'up' ? col : [...col].reverse();
      const newRow = slide(reversed);
      const final = dir === 'up' ? newRow : newRow.reverse();
      for (let r = 0; r < SIZE; r++) {
        if (grid[r][c] !== final[r]) changed = true;
        grid[r][c] = final[r];
      }
    }
  }
  if (changed) { addTile(); render(); checkGameOver(); }
}

function checkGameOver() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return;
      if (c < SIZE-1 && grid[r][c] === grid[r][c+1]) return;
      if (r < SIZE-1 && grid[r][c] === grid[r+1][c]) return;
    }
  setTimeout(() => alert('游戏结束！分数: ' + score), 100);
}

// Keyboard
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') move('left');
  else if (e.key === 'ArrowRight') move('right');
  else if (e.key === 'ArrowUp') move('up');
  else if (e.key === 'ArrowDown') move('down');
});

// Touch
let touchStart = null;
document.addEventListener('touchstart', e => { touchStart = {x: e.touches[0].clientX, y: e.touches[0].clientY}; });
document.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) move('right'); else if (dx < -30) move('left');
  } else {
    if (dy > 30) move('down'); else if (dy < -30) move('up');
  }
  touchStart = null;
});

document.getElementById('new-game').addEventListener('click', init);
bestEl.textContent = best;
init();