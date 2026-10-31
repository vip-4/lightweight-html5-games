const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const SIZE = 15, CELL = 40, MARGIN = 20;
const board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
let currentPlayer = 1; // 1=black, 2=white
let gameOver = false, mode = 'pvp';

const turnEl = document.getElementById('turn');
const infoEl = document.getElementById('info');

function drawBoard() {
  ctx.fillStyle = '#d4a373';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 1;
  for (let i = 0; i < SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(MARGIN, MARGIN + i * CELL);
    ctx.lineTo(MARGIN + (SIZE-1) * CELL, MARGIN + i * CELL);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(MARGIN + i * CELL, MARGIN);
    ctx.lineTo(MARGIN + i * CELL, MARGIN + (SIZE-1) * CELL);
    ctx.stroke();
  }
  // star points
  for (const [r, c] of [[3,3],[3,11],[7,7],[11,3],[11,11]]) {
    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.arc(MARGIN + c*CELL, MARGIN + r*CELL, 3, 0, Math.PI*2);
    ctx.fill();
  }
  // pieces
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c]) {
        ctx.fillStyle = board[r][c] === 1 ? '#1a1a1a' : '#f5f5f5';
        ctx.beginPath();
        ctx.arc(MARGIN + c*CELL, MARGIN + r*CELL, 16, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
}

function checkWin(r, c, player) {
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  for (const [dr, dc] of dirs) {
    let count = 1;
    for (let i = 1; i < 5; i++) {
      const nr = r + dr*i, nc = c + dc*i;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || board[nr][nc] !== player) break;
      count++;
    }
    for (let i = 1; i < 5; i++) {
      const nr = r - dr*i, nc = c - dc*i;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || board[nr][nc] !== player) break;
      count++;
    }
    if (count >= 5) return true;
  }
  return false;
}

function isFull() { return board.every(row => row.every(c => c !== 0)); }

function aiMove() {
  // Simple AI: try to win, block opponent, else center-ish random
  const opponent = currentPlayer === 1 ? 2 : 1;
  // Try winning move
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) {
        board[r][c] = currentPlayer;
        if (checkWin(r, c, currentPlayer)) { board[r][c] = 0; return {r, c}; }
        board[r][c] = 0;
      }
    }
  // Block opponent
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) {
        board[r][c] = opponent;
        if (checkWin(r, c, opponent)) { board[r][c] = 0; return {r, c}; }
        board[r][c] = 0;
      }
    }
  // Prefer center
  const center = 7;
  let best = null, bestDist = Infinity;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) {
        const d = Math.abs(r - center) + Math.abs(c - center);
        if (d < bestDist) { bestDist = d; best = {r, c}; }
      }
    }
  return best || {r: 7, c: 7};
}

canvas.addEventListener('click', e => {
  if (gameOver) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  const c = Math.round((x - MARGIN) / CELL);
  const r = Math.round((y - MARGIN) / CELL);
  if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return;
  if (board[r][c] !== 0) return;
  board[r][c] = currentPlayer;
  if (checkWin(r, c, currentPlayer)) { gameOver = true; infoEl.textContent = (currentPlayer === 1 ? '黑棋' : '白棋') + ' 获胜！'; drawBoard(); return; }
  if (isFull()) { gameOver = true; infoEl.textContent = '平局！'; drawBoard(); return; }
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  turnEl.textContent = currentPlayer === 1 ? '黑棋' : '白棋';
  drawBoard();
  if (mode === 'ai' && currentPlayer === 2 && !gameOver) {
    setTimeout(() => {
      const m = aiMove();
      board[m.r][m.c] = 2;
      if (checkWin(m.r, m.c, 2)) { gameOver = true; infoEl.textContent = '白棋 (AI) 获胜！'; drawBoard(); return; }
      if (isFull()) { gameOver = true; infoEl.textContent = '平局！'; drawBoard(); return; }
      currentPlayer = 1;
      turnEl.textContent = '黑棋';
      drawBoard();
    }, 300);
  }
});

document.getElementById('mode').addEventListener('change', e => { mode = e.target.value; init(); });
document.getElementById('restart').addEventListener('click', init);
init(); drawBoard();