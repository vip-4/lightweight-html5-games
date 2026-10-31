const board = document.getElementById('board');
const diffSel = document.getElementById('difficulty');
const newBtn = document.getElementById('new-game');
const checkBtn = document.getElementById('check');
const solveBtn = document.getElementById('solve');
let puzzle = [], solution = [], selected = null;

function generate(difficulty) {
  // Generate a complete solution via backtracking
  const grid = Array.from({length: 9}, () => Array(9).fill(0));
  function solve(g) {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++) {
        if (g[r][c] === 0) {
          const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random()-0.5);
          for (const n of nums) {
            if (isValid(g, r, c, n)) {
              g[r][c] = n;
              if (solve(g)) return true;
              g[r][c] = 0;
            }
          }
          return false;
        }
      }
    return true;
  }
  solve(grid);
  solution = grid.map(r => [...r]);
  // Remove cells based on difficulty
  const removeCount = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 55;
  puzzle = grid.map(r => [...r]);
  let removed = 0;
  while (removed < removeCount) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== 0) { puzzle[r][c] = 0; removed++; }
  }
}

function isValid(g, r, c, n) {
  for (let i = 0; i < 9; i++) {
    if (g[r][i] === n || g[i][c] === n) return false;
  }
  const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
  for (let i = br; i < br+3; i++)
    for (let j = bc; j < bc+3; j++)
      if (g[i][j] === n) return false;
  return true;
}

function render() {
  board.innerHTML = '';
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (puzzle[r][c] !== 0) { cell.textContent = puzzle[r][c]; cell.classList.add('fixed'); }
      else if (solution[r][c] !== 0 && selected && selected.r === r && selected.c === c) { }
      cell.dataset.r = r; cell.dataset.c = c;
      cell.addEventListener('click', () => { selected = {r, c}; highlight(); });
      board.appendChild(cell);
    }
}

function highlight() {
  document.querySelectorAll('.cell').forEach(el => el.classList.remove('selected'));
  if (selected) {
    const idx = selected.r * 9 + selected.c;
    const cell = board.children[idx];
    if (cell && !cell.classList.contains('fixed')) cell.classList.add('selected');
  }
}

function setValue(n) {
  if (!selected) return;
  const {r, c} = selected;
  const cell = board.children[r*9+c];
  if (cell.classList.contains('fixed')) return;
  if (n === 0) { cell.textContent = ''; puzzle[r][c] = 0; }
  else { cell.textContent = n; puzzle[r][c] = n; cell.classList.remove('error'); }
}

function check() {
  let errors = 0;
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      const cell = board.children[r*9+c];
      const val = puzzle[r][c];
      if (val !== 0 && val !== solution[r][c]) { cell.classList.add('error'); errors++; }
      else cell.classList.remove('error');
    }
  alert(errors === 0 ? '全部正确！' : `发现 ${errors} 个错误`);
}

function solve() {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      const cell = board.children[r*9+c];
      if (!cell.classList.contains('fixed')) {
        cell.textContent = solution[r][c];
        puzzle[r][c] = solution[r][c];
        cell.classList.remove('error');
      }
    }
}

document.querySelectorAll('.numpad button').forEach(btn => {
  btn.addEventListener('click', () => setValue(+btn.dataset.n));
});
diffSel.addEventListener('change', () => { generate(diffSel.value); render(); });
newBtn.addEventListener('click', () => { generate(diffSel.value); render(); });
checkBtn.addEventListener('click', check);
solveBtn.addEventListener('click', solve);

generate(diffSel.value);
render();