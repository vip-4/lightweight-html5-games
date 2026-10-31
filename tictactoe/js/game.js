const boardEl = document.getElementById('board');
const turnEl = document.getElementById('turn');
const infoEl = document.getElementById('info');
const modeSel = document.getElementById('mode');
const restartBtn = document.getElementById('restart');
let board = Array(9).fill(''), turn = 'X', gameOver = false, mode = 'pvp';

function init() {
  board = Array(9).fill('');
  turn = 'X'; gameOver = false;
  turnEl.textContent = 'X';
  infoEl.textContent = '';
  render();
}

function render() {
  boardEl.innerHTML = '';
  board.forEach((v, i) => {
    const cell = document.createElement('div');
    cell.className = 'cell' + (v ? ' ' + v.toLowerCase() : '');
    cell.textContent = v;
    cell.addEventListener('click', () => move(i));
    boardEl.appendChild(cell);
  });
}

function checkWin(b, player) {
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return wins.some(w => w.every(i => b[i] === player));
}

function isFull(b) { return b.every(c => c !== ''); }

function minimax(b, depth, isMax) {
  if (checkWin(b, 'O')) return 10 - depth;
  if (checkWin(b, 'X')) return depth - 10;
  if (isFull(b)) return 0;
  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i] === '') { b[i] = 'O'; best = Math.max(best, minimax(b, depth+1, false)); b[i] = ''; }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i] === '') { b[i] = 'X'; best = Math.min(best, minimax(b, depth+1, true)); b[i] = ''; }
    }
    return best;
  }
}

function aiMove() {
  let best = -Infinity, move = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      const score = minimax(board, 0, false);
      board[i] = '';
      if (score > best) { best = score; move = i; }
    }
  }
  return move;
}

function move(i) {
  if (gameOver || board[i] !== '') return;
  board[i] = turn;
  if (checkWin(board, turn)) {
    gameOver = true;
    infoEl.textContent = turn + ' 获胜！';
    render(); return;
  }
  if (isFull(board)) {
    gameOver = true;
    infoEl.textContent = '平局！';
    render(); return;
  }
  turn = turn === 'X' ? 'O' : 'X';
  turnEl.textContent = turn;
  render();
  if (mode === 'ai' && turn === 'O' && !gameOver) {
    setTimeout(() => {
      const m = aiMove();
      if (m >= 0) move(m);
    }, 300);
  }
}

modeSel.addEventListener('change', e => { mode = e.target.value; init(); });
restartBtn.addEventListener('click', init);
init();