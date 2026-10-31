const board = document.getElementById('board');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const comboEl = document.getElementById('combo');
const restartBtn = document.getElementById('restart');
let score = 0, timer = 30, combo = 0, interval = null, moleTimer = null, running = false;

function init() {
  clearInterval(interval); clearInterval(moleTimer);
  score = 0; timer = 30; combo = 0; running = true;
  scoreEl.textContent = 0; timerEl.textContent = 30; comboEl.textContent = 0;
  board.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const hole = document.createElement('div');
    hole.className = 'hole';
    hole.innerHTML = '<div class="mole">🐹</div>';
    const mole = hole.querySelector('.mole');
    hole.addEventListener('click', () => whack(hole, mole));
    board.appendChild(hole);
  }
  interval = setInterval(() => {
    timer--; timerEl.textContent = timer;
    if (timer <= 0) { clearInterval(interval); clearInterval(moleTimer); running = false; alert('时间到！分数: ' + score); }
  }, 1000);
  showMole();
}

function showMole() {
  if (!running) return;
  const holes = document.querySelectorAll('.hole');
  holes.forEach(h => h.classList.remove('up'));
  const idx = Math.floor(Math.random() * holes.length);
  holes[idx].classList.add('up');
  const duration = Math.max(400, 1000 - (30 - timer) * 15);
  moleTimer = setTimeout(() => { if (running) { combo = 0; comboEl.textContent = 0; showMole(); } }, duration);
}

function whack(hole, mole) {
  if (!running || !hole.classList.contains('up')) return;
  hole.classList.remove('up');
  combo++;
  const points = 10 * combo;
  score += points;
  scoreEl.textContent = score;
  comboEl.textContent = combo;
  clearTimeout(moleTimer);
  setTimeout(showMole, 200);
}

restartBtn.addEventListener('click', init);
init();