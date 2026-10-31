const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const COLS = 9, ROWS = 10;
const CELL = 50, MARGIN = 25;
// piece types: 1=general,2=advisor,3=elephant,4=horse,5=chariot,6=cannon,7=soldier
// positive = red, negative = black
const RED_NAMES = ['', '帅', '仕', '相', '马', '车', '炮', '兵'];
const BLACK_NAMES = ['', '将', '士', '象', '马', '车', '炮', '卒'];

let board = [], selected = null, turn = 1, gameOver = false, mode = 'pvp';
const turnEl = document.getElementById('turn');
const infoEl = document.getElementById('info');

function initBoard() {
  board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  // Black (top, rows 0-2)
  const back = [-4,-3,-2,-1,-7,-1,-2,-3,-4]; // chariot,horse,elephant,advisor,general,advisor,elephant,horse,chariot
  // Actually use: 4=chariot,3=horse,2=elephant,1=advisor,7? no. Let me define: 1=general,2=advisor,3=elephant,4=horse,5=chariot,6=cannon,7=soldier
  const row0 = [-5,-4,-3,-2,-1,-2,-3,-4,-5];
  for (let c = 0; c < COLS; c++) board[0][c] = row0[c];
  board[2][1] = -6; board[2][7] = -6;
  for (let c = 0; c < COLS; c += 2) board[3][c] = -7;
  // Red (bottom, rows 7-9)
  const row9 = [5,4,3,2,1,2,3,4,5];
  for (let c = 0; c < COLS; c++) board[9][c] = row9[c];
  board[7][1] = 6; board[7][7] = 6;
  for (let c = 0; c < COLS; c += 2) board[6][c] = 7;
}

function pieceColor(p) { return p > 0 ? 1 : (p < 0 ? -1 : 0); }
function pieceType(p) { return Math.abs(p); }

function inPalace(r, c, color) {
  if (c < 3 || c > 5) return false;
  if (color === 1) return r >= 7 && r <= 9;
  return r >= 0 && r <= 2;
}

function crossRiver(r, color) {
  if (color === 1) return r <= 4;
  return r >= 5;
}

function isEmpty(r, c) { return r>=0 && r<ROWS && c>=0 && c<COLS && board[r][c] === 0; }
function isEnemy(r, c, color) { return r>=0 && r<ROWS && c>=0 && c<COLS && board[r][c] !== 0 && pieceColor(board[r][c]) !== color; }

function countBetween(r1, c1, r2, c2) {
  let count = 0;
  if (r1 === r2) {
    const step = c2 > c1 ? 1 : -1;
    for (let c = c1 + step; c !== c2; c += step) if (board[r1][c] !== 0) count++;
  } else if (c1 === c2) {
    const step = r2 > r1 ? 1 : -1;
    for (let r = r1 + step; r !== r2; r += step) if (board[r][c1] !== 0) count++;
  }
  return count;
}

function legalMoves(r, c) {
  const p = board[r][c];
  if (p === 0) return [];
  const color = pieceColor(p);
  const type = pieceType(p);
  const moves = [];
  const add = (nr, nc) => {
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return;
    if (board[nr][nc] === 0) moves.push({r: nr, c: nc});
    else if (pieceColor(board[nr][nc]) !== color) moves.push({r: nr, c: nc});
  };
  switch (type) {
    case 1: // general
      for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nr = r+dr, nc = c+dc;
        if (inPalace(nr, nc, color)) add(nr, nc);
      }
      break;
    case 2: // advisor
      for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
        const nr = r+dr, nc = c+dc;
        if (inPalace(nr, nc, color)) add(nr, nc);
      }
      break;
    case 3: // elephant
      for (const [dr, dc] of [[2,2],[2,-2],[-2,2],[-2,-2]]) {
        const nr = r+dr, nc = c+dc;
        const er = r + dr/2, ec = c + dc/2;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (board[er][ec] !== 0) continue; // blocked
        // cannot cross river
        if (color === 1 && nr < 5) continue;
        if (color === -1 && nr > 4) continue;
        add(nr, nc);
      }
      break;
    case 4: // horse
      for (const [dr, dc, lr, lc] of [[2,1,1,0],[2,-1,1,0],[-2,1,-1,0],[-2,-1,-1,0],[1,2,0,1],[-1,2,0,1],[1,-2,0,-1],[-1,-2,0,-1]]) {
        const nr = r+dr, nc = c+dc;
        const lr2 = r+lr, lc2 = c+lc;
        if (lr2 < 0 || lr2 >= ROWS || lc2 < 0 || lc2 >= COLS) continue;
        if (board[lr2][lc2] !== 0) continue; // leg blocked
        add(nr, nc);
      }
      break;
    case 5: // chariot
      for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          if (board[nr][nc] === 0) { moves.push({r: nr, c: nc}); }
          else { if (pieceColor(board[nr][nc]) !== color) moves.push({r: nr, c: nc}); break; }
          nr += dr; nc += dc;
        }
      }
      break;
    case 6: // cannon
      for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        let nr = r + dr, nc = c + dc;
        let jumped = false;
        while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          if (board[nr][nc] === 0) {
            if (!jumped) moves.push({r: nr, c: nc});
          } else {
            if (!jumped) { jumped = true; }
            else { if (pieceColor(board[nr][nc]) !== color) moves.push({r: nr, c: nc}); break; }
          }
          nr += dr; nc += dc;
        }
      }
      break;
    case 7: // soldier
      const forward = color === 1 ? -1 : 1;
      add(r + forward, c);
      if (crossRiver(r, color)) {
        add(r, c - 1);
        add(r, c + 1);
      }
      break;
  }
  return moves;
}

function generalsFace() {
  // check if generals face each other (illegal)
  let redGen = null, blackGen = null;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === 1) redGen = {r, c};
      if (board[r][c] === -1) blackGen = {r, c};
    }
  if (!redGen || !blackGen) return false;
  if (redGen.c !== blackGen.c) return false;
  for (let r = Math.min(redGen.r, blackGen.r) + 1; r < Math.max(redGen.r, blackGen.r); r++) {
    if (board[r][redGen.c] !== 0) return false;
  }
  return true;
}

function isInCheck(color) {
  // find general
  const genVal = color === 1 ? 1 : -1;
  let gr = -1, gc = -1;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === genVal) { gr = r; gc = c; }
    }
  if (gr < 0) return true; // general captured
  // check if any enemy piece can capture general
  const enemyColor = color === 1 ? -1 : 1;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (pieceColor(board[r][c]) === enemyColor) {
        const moves = legalMoves(r, c);
        if (moves.some(m => m.r === gr && m.c === gc)) return true;
      }
    }
  // generals facing
  if (generalsFace()) return true;
  return false;
}

function makeMove(from, to) {
  const captured = board[to.r][to.c];
  board[to.r][to.c] = board[from.r][from.c];
  board[from.r][from.c] = 0;
  // check check
  const color = turn;
  if (isInCheck(color)) {
    // illegal, undo
    board[from.r][from.c] = board[to.r][to.c];
    board[to.r][to.c] = captured;
    return false;
  }
  // generals facing check
  if (generalsFace()) {
    board[from.r][from.c] = board[to.r][to.c];
    board[to.r][to.c] = captured;
    return false;
  }
  // check if opponent general captured
  if (captured === (color === 1 ? -1 : 1)) {
    gameOver = true;
    infoEl.textContent = (color === 1 ? '红方' : '黑方') + ' 获胜！';
  }
  return true;
}

function drawBoard() {
  ctx.fillStyle = '#d4a373';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 1.5;
  // grid lines
  for (let r = 0; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(MARGIN, MARGIN + r * CELL);
    ctx.lineTo(MARGIN + (COLS-1) * CELL, MARGIN + r * CELL);
    ctx.stroke();
  }
  for (let c = 0; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(MARGIN + c * CELL, MARGIN);
    ctx.lineTo(MARGIN + c * CELL, MARGIN + (ROWS-1) * CELL);
    ctx.stroke();
  }
  // river text
  ctx.fillStyle = '#8b6914';
  ctx.font = 'bold 18px serif';
  ctx.textAlign = 'center';
  ctx.fillText('楚 河', MARGIN + 2*CELL, MARGIN + 4.5*CELL);
  ctx.fillText('汉 界', MARGIN + 6*CELL, MARGIN + 4.5*CELL);
  // palace diagonals
  // top palace
  ctx.beginPath();
  ctx.moveTo(MARGIN + 3*CELL, MARGIN);
  ctx.lineTo(MARGIN + 5*CELL, MARGIN + 2*CELL);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(MARGIN + 5*CELL, MARGIN);
  ctx.lineTo(MARGIN + 3*CELL, MARGIN + 2*CELL);
  ctx.stroke();
  // bottom palace
  ctx.beginPath();
  ctx.moveTo(MARGIN + 3*CELL, MARGIN + 7*CELL);
  ctx.lineTo(MARGIN + 5*CELL, MARGIN + 9*CELL);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(MARGIN + 5*CELL, MARGIN + 7*CELL);
  ctx.lineTo(MARGIN + 3*CELL, MARGIN + 9*CELL);
  ctx.stroke();
  // pieces
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c];
      if (p === 0) continue;
      const color = pieceColor(p);
      const type = pieceType(p);
      const name = color === 1 ? RED_NAMES[type] : BLACK_NAMES[type];
      const x = MARGIN + c * CELL;
      const y = MARGIN + r * CELL;
      // circle
      ctx.fillStyle = color === 1 ? '#f5e6d3' : '#2d2d2d';
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = color === 1 ? '#c0392b' : '#1a1a1a';
      ctx.lineWidth = 2;
      ctx.stroke();
      // text
      ctx.fillStyle = color === 1 ? '#c0392b' : '#f5f5f5';
      ctx.font = 'bold 18px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, x, y);
      // selected highlight
      if (selected && selected.r === r && selected.c === c) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI*2);
        ctx.stroke();
      }
    }
  // legal move hints
  if (selected) {
    const moves = legalMoves(selected.r, selected.c);
    for (const m of moves) {
      const x = MARGIN + m.c * CELL;
      const y = MARGIN + m.r * CELL;
      ctx.fillStyle = board[m.r][m.c] === 0 ? 'rgba(0,200,0,0.3)' : 'rgba(200,0,0,0.3)';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI*2);
      ctx.fill();
    }
  }
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
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
  if (selected) {
    const moves = legalMoves(selected.r, selected.c);
    if (moves.some(m => m.r === r && m.c === c)) {
      const ok = makeMove(selected, {r, c});
      if (ok) {
        if (!gameOver) {
          turn = turn === 1 ? -1 : 1;
          turnEl.textContent = turn === 1 ? '红方' : '黑方';
          if (mode === 'ai' && turn === -1 && !gameOver) {
            setTimeout(aiTurn, 400);
          }
        }
      }
    }
    selected = null;
  } else {
    if (board[r][c] !== 0 && pieceColor(board[r][c]) === turn) {
      selected = {r, c};
    }
  }
  drawBoard();
});

function aiTurn() {
  // collect all legal moves for black
  const allMoves = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (pieceColor(board[r][c]) === -1) {
        const moves = legalMoves(r, c);
        for (const m of moves) allMoves.push({from: {r, c}, to: m});
      }
    }
  if (allMoves.length === 0) return;
  // prefer captures
  const captures = allMoves.filter(m => board[m.to.r][m.to.c] !== 0);
  const pool = captures.length ? captures : allMoves;
  const move = pool[Math.floor(Math.random() * pool.length)];
  const ok = makeMove(move.from, move.to);
  if (ok && !gameOver) {
    turn = 1;
    turnEl.textContent = '红方';
    drawBoard();
  }
}

document.getElementById('mode').addEventListener('change', e => { mode = e.target.value; init(); });
document.getElementById('restart').addEventListener('click', init);

function init() {
  initBoard();
  selected = null;
  turn = 1;
  gameOver = false;
  turnEl.textContent = '红方';
  infoEl.textContent = '';
  drawBoard();
}
init();