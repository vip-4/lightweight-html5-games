const board = document.getElementById('board');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const restartBtn = document.getElementById('restart');
const COLS = 8, ROWS = 8;
const GEMS = ['💎','🔴','🟢','🔵','🟡','🟣'];
let grid = [], score = 0, timer = 60, timerInterval, selected = null, lock = false;

function init() {
  clearInterval(timerInterval);
  score = 0; timer = 60;
  scoreEl.textContent = 0; timerEl.textContent = 60;
  grid = Array.from({length: ROWS}, () => Array.from({length: COLS}, () => GEMS[Math.floor(Math.random()*GEMS.length)]));
  // ensure no initial matches
  let hasMatch = true;
  while (hasMatch) {
    hasMatch = false;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (c >= 2 && grid[r][c] === grid[r][c-1] && grid[r][c] === grid[r][c-2]) { grid[r][c] = GEMS[Math.floor(Math.random()*GEMS.length)]; hasMatch = true; }
        if (r >= 2 && grid[r][c] === grid[r-1][c] && grid[r][c] === grid[r-2][c]) { grid[r][c] = GEMS[Math.floor(Math.random()*GEMS.length)]; hasMatch = true; }
      }
  }
  render();
  timerInterval = setInterval(() => { timer--; timerEl.textContent = timer; if (timer <= 0) { clearInterval(timerInterval); alert('时间到！分数: ' + score); } }, 1000);
}

function render() {
  board.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
  board.innerHTML = '';
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const gem = document.createElement('div');
      gem.className = 'gem';
      gem.textContent = grid[r][c];
      gem.dataset.r = r; gem.dataset.c = c;
      gem.addEventListener('click', () => selectGem(r, c));
      board.appendChild(gem);
    }
}

function selectGem(r, c) {
  if (lock) return;
  const idx = r * COLS + c;
  const gemEl = board.children[idx];
  if (selected) {
    const [sr, sc] = selected;
    if (Math.abs(sr - r) + Math.abs(sc - c) === 1) {
      // swap
      [grid[sr][sc], grid[r][c]] = [grid[r][c], grid[sr][sc]];
      render();
      if (!findMatches().length) {
        // revert
        [grid[sr][sc], grid[r][c]] = [grid[r][c], grid[sr][sc]];
        render();
      } else {
        processMatches();
      }
    }
    selected = null;
    document.querySelectorAll('.gem.selected').forEach(e => e.classList.remove('selected'));
  } else {
    selected = [r, c];
    gemEl.classList.add('selected');
  }
}

function findMatches() {
  const matched = new Set();
  // horizontal
  for (let r = 0; r < ROWS; r++) {
    let count = 1;
    for (let c = 1; c <= COLS; c++) {
      if (c < COLS && grid[r][c] === grid[r][c-1] && grid[r][c] !== '') count++;
      else {
        if (count >= 3) for (let k = c - count; k < c; k++) matched.add(r * COLS + k);
        count = 1;
      }
    }
  }
  // vertical
  for (let c = 0; c < COLS; c++) {
    let count = 1;
    for (let r = 1; r <= ROWS; r++) {
      if (r < ROWS && grid[r][c] === grid[r-1][c] && grid[r][c] !== '') count++;
      else {
        if (count >= 3) for (let k = r - count; k < r; k++) matched.add(k * COLS + c);
        count = 1;
      }
    }
  }
  return [...matched];
}

function processMatches() {
  lock = true;
  const matched = findMatches();
  if (!matched.length) { lock = false; return; }
  score += matched.length * 10;
  scoreEl.textContent = score;
  matched.forEach(idx => {
    const el = board.children[idx];
    if (el) el.classList.add('removing');
  });
  setTimeout(() => {
    matched.forEach(idx => {
      const r = Math.floor(idx / COLS), c = idx % COLS;
      grid[r][c] = '';
    });
    // drop
    for (let c = 0; c < COLS; c++) {
      const col = [];
      for (let r = ROWS - 1; r >= 0; r--) if (grid[r][c]) col.push(grid[r][c]);
      for (let r = ROWS - 1; r >= 0; r--) grid[r][c] = col[ROWS - 1 - r] || '';
    }
    // refill
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (!grid[r][c]) grid[r][c] = GEMS[Math.floor(Math.random()*GEMS.length)];
    render();
    // chain
    if (findMatches().length) processMatches(); else lock = false;
  }, 300);
}

restartBtn.addEventListener('click', init);
init();