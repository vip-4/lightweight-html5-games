const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const SIZE = 8, CELL = 60;
const PIECES = { 'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙', 'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' };
// board: uppercase = white, lowercase = black
let board = [], selected = null, turn = 'w', gameOver = false, mode = 'pvp';
const turnEl = document.getElementById('turn');
const infoEl = document.getElementById('info');

const INIT = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

function init() {
  board = INIT.map(r => [...r]);
  selected = null; turn = 'w'; gameOver = false;
  turnEl.textContent = '白方';
  infoEl.textContent = '';
  draw();
}

function color(p) { return p === '' ? 0 : (p === p.toUpperCase() ? 1 : -1); }
function isWhite(p) { return p !== '' && p === p.toUpperCase(); }
function isBlack(p) { return p !== '' && p === p.toLowerCase(); }

function moves(r, c) {
  const p = board[r][c];
  if (!p) return [];
  const w = isWhite(p);
  const type = p.toLowerCase();
  const res = [];
  const add = (rr, cc) => {
    if (rr < 0 || rr >= 8 || cc < 0 || cc >= 8) return false;
    const t = board[rr][cc];
    if (t === '') { res.push({r: rr, c: cc}); return true; }
    if ((w && isBlack(t)) || (!w && isWhite(t))) res.push({r: rr, c: cc});
    return false;
  };
  const slide = (dr, dc) => {
    let rr = r + dr, cc = c + dc;
    while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
      const t = board[rr][cc];
      if (t === '') { res.push({r: rr, c: cc}); }
      else { if ((w && isBlack(t)) || (!w && isWhite(t))) res.push({r: rr, c: cc}); break; }
      rr += dr; cc += dc;
    }
  };
  switch (type) {
    case 'p': {
      const dir = w ? -1 : 1;
      const startRow = w ? 6 : 1;
      // forward
      if (r + dir >= 0 && r + dir < 8 && board[r+dir][c] === '') {
        res.push({r: r+dir, c});
        if (r === startRow && board[r+2*dir][c] === '') res.push({r: r+2*dir, c});
      }
      // captures
      for (const dc of [-1, 1]) {
        const nr = r + dir, nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const t = board[nr][nc];
          if (t !== '' && ((w && isBlack(t)) || (!w && isWhite(t)))) res.push({r: nr, c: nc});
        }
      }
      break;
    }
    case 'n': {
      for (const [dr, dc] of [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]) add(r+dr, c+dc);
      break;
    }
    case 'b': {
      for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1]]) slide(dr, dc);
      break;
    }
    case 'r': {
      for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) slide(dr, dc);
      break;
    }
    case 'q': {
      for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) slide(dr, dc);
      break;
    }
    case 'k': {
      for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) add(r+dr, c+dc);
      break;
    }
  }
  return res;
}

function inCheck(color) {
  // find king
  const king = color === 1 ? 'K' : 'k';
  let kr = -1, kc = -1;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c] === king) { kr = r; kc = c; }
  if (kr < 0) return true;
  const enemyColor = color === 1 ? -1 : 1;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p === '' || (color === 1 ? isBlack(p) : isWhite(p)) === false) continue;
      if (color === 1 ? isWhite(p) : isBlack(p)) continue;
      const ms = moves(r, c);
      if (ms.some(m => m.r === kr && m.c === kc)) return true;
    }
  return false;
}

function legalMoves(r, c) {
  const p = board[r][c];
  const w = isWhite(p);
  const color = w ? 1 : -1;
  const ms = moves(r, c);
  // filter moves that leave king in check
  return ms.filter(m => {
    const saved = board[m.r][m.c];
    board[m.r][m.c] = p;
    board[r][c] = '';
    const inChk = inCheck(color);
    board[r][c] = p;
    board[m.r][m.c] = saved;
    return !inChk;
  });
}

function allLegalMoves(color) {
  const ms = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p === '') continue;
      if (color === 1 && !isWhite(p)) continue;
      if (color === -1 && !isBlack(p)) continue;
      for (const m of legalMoves(r, c)) ms.push({from: {r, c}, to: m});
    }
  return ms;
}

canvas.addEventListener('click', e => {
  if (gameOver) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  const c = Math.floor(x / CELL);
  const r = Math.floor(y / CELL);
  if (r < 0 || r >= 8 || c < 0 || c >= 8) return;
  const color = turn === 'w' ? 1 : -1;
  if (selected) {
    const ms = legalMoves(selected.r, selected.c);
    if (ms.some(m => m.r === r && m.c === c)) {
      const p = board[selected.r][selected.c];
      board[r][c] = p;
      board[selected.r][selected.c] = '';
      // pawn promotion
      if (p.toLowerCase() === 'p' && (r === 0 || r === 7)) board[r][c] = (color === 1 ? 'Q' : 'q');
      selected = null;
      // check checkmate/stalemate
      const enemyColor = color === 1 ? -1 : 1;
      const enemyMoves = allLegalMoves(enemyColor);
      turn = turn === 'w' ? 'b' : 'w';
      turnEl.textContent = turn === 'w' ? '白方' : '黑方';
      if (enemyMoves.length === 0) {
        if (inCheck(enemyColor)) { gameOver = true; infoEl.textContent = (turn === 'b' ? '白方' : '黑方') + ' 获胜！将死'; }
        else { gameOver = true; infoEl.textContent = '和棋（逼和）'; }
      } else if (inCheck(enemyColor)) {
        infoEl.textContent = '将军！';
      } else {
        infoEl.textContent = '';
      }
      draw();
      if (mode === 'ai' && turn === 'b' && !gameOver) {
        setTimeout(aiTurn, 300);
      }
      return;
    }
    selected = null;
  }
  if (board[r][c] !== '' && ((turn === 'w' && isWhite(board[r][c])) || (turn === 'b' && isBlack(board[r][c])))) {
    selected = {r, c};
  }
  draw();
});

function aiTurn() {
  const ms = allLegalMoves(-1);
  if (ms.length === 0) return;
  const captures = ms.filter(m => board[m.to.r][m.to.c] !== '');
  const pool = captures.length ? captures : ms;
  const m = pool[Math.floor(Math.random() * pool.length)];
  const p = board[m.from.r][m.from.c];
  board[m.to.r][m.to.c] = p;
  board[m.from.r][m.from.c] = '';
  if (p === 'p' && m.to.r === 0) board[m.to.r][m.to.c] = 'q';
  const enemyMoves = allLegalMoves(1);
  turn = 'w';
  turnEl.textContent = '白方';
  if (enemyMoves.length === 0) {
    if (inCheck(1)) { gameOver = true; infoEl.textContent = '黑方 (AI) 获胜！'; }
    else { gameOver = true; infoEl.textContent = '和棋（逼和）'; }
  } else if (inCheck(1)) {
    infoEl.textContent = '将军！';
  } else {
    infoEl.textContent = '';
  }
  draw();
}

function draw() {
  const light = '#f0d9b5', dark = '#b58863';
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? light : dark;
      ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
      const p = board[r][c];
      if (p) {
        ctx.fillStyle = isWhite(p) ? '#fff' : '#000';
        ctx.font = 'bold 36px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(PIECES[p], c * CELL + CELL/2, r * CELL + CELL/2);
      }
      if (selected && selected.r === r && selected.c === c) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.strokeRect(c * CELL + 2, r * CELL + 2, CELL - 4, CELL - 4);
      }
    }
  if (selected) {
    ctx.fillStyle = 'rgba(0,200,0,0.3)';
    for (const m of legalMoves(selected.r, selected.c)) {
      ctx.beginPath();
      ctx.arc(m.c * CELL + CELL/2, m.r * CELL + CELL/2, 8, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

document.getElementById('mode').addEventListener('change', e => { mode = e.target.value; init(); });
document.getElementById('restart').addEventListener('click', init);
init();