const board = document.getElementById('board');
const diffSel = document.getElementById('difficulty');
const minesEl = document.getElementById('mines');
const flagsEl = document.getElementById('flags');
const restartBtn = document.getElementById('restart');
const CONFIGS = { easy: {cols:9, rows:9, mines:10}, medium: {cols:16, rows:16, mines:40}, hard: {cols:30, rows:16, mines:99} };
let cols, rows, mines, grid, revealed, flagged, gameOver, firstClick;

function init() {
  const cfg = CONFIGS[diffSel.value];
  cols = cfg.cols; rows = cfg.rows; mines = cfg.mines;
  minesEl.textContent = mines; flagsEl.textContent = 0;
  grid = Array.from({length: rows}, () => Array(cols).fill(0));
  revealed = Array.from({length: rows}, () => Array(cols).fill(false));
  flagged = Array.from({length: rows}, () => Array(cols).fill(false));
  gameOver = false; firstClick = true;
  render();
}

function placeMines(safeR, safeC) {
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (grid[r][c] === -1) continue;
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
    grid[r][c] = -1; placed++;
  }
  // compute numbers
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === -1) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r+dr, nc = c+dc;
          if (nr>=0 && nr<rows && nc>=0 && nc<cols && grid[nr][nc] === -1) n++;
        }
      grid[r][c] = n;
    }
}

function render() {
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  board.innerHTML = '';
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = r; cell.dataset.c = c;
      if (revealed[r][c]) {
        cell.classList.add('revealed');
        if (grid[r][c] === -1) { cell.classList.add('mine'); cell.textContent = '💣'; }
        else if (grid[r][c] > 0) { cell.textContent = grid[r][c]; cell.classList.add('n' + grid[r][c]); }
      } else if (flagged[r][c]) {
        cell.classList.add('flag'); cell.textContent = '🚩';
      }
      cell.addEventListener('click', () => reveal(r, c));
      cell.addEventListener('contextmenu', (e) => { e.preventDefault(); toggleFlag(r, c); });
      board.appendChild(cell);
    }
}

function reveal(r, c) {
  if (gameOver || revealed[r][c] || flagged[r][c]) return;
  if (firstClick) { placeMines(r, c); firstClick = false; }
  if (grid[r][c] === -1) { gameOver = true; revealAll(); alert('游戏结束！踩到地雷了'); return; }
  // flood fill
  const stack = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop();
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
    if (revealed[cr][cc] || flagged[cr][cc]) continue;
    revealed[cr][cc] = true;
    if (grid[cr][cc] === 0) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr !== 0 || dc !== 0) stack.push([cr+dr, cc+dc]);
    }
  }
  render();
  checkWin();
}

function toggleFlag(r, c) {
  if (gameOver || revealed[r][c]) return;
  flagged[r][c] = !flagged[r][c];
  const count = flagged.flat().filter(Boolean).length;
  flagsEl.textContent = count;
  render();
}

function revealAll() {
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) revealed[r][c] = true;
  render();
}

function checkWin() {
  let unrevealed = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (!revealed[r][c] && grid[r][c] !== -1) unrevealed++;
  if (unrevealed === 0) { gameOver = true; alert('恭喜！你赢了！'); }
}

diffSel.addEventListener('change', init);
restartBtn.addEventListener('click', init);
init();