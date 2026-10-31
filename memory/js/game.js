const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const diffSel = document.getElementById('difficulty');
const restartBtn = document.getElementById('restart');

const EMOJIS = ['🍎','🍊','🍋','🍇','🍓','🍒','🍑','🥝','🍍','🥭','🍌','🍉','🥥','🥑','🥕','🌽'];
let cards = [], flipped = [], matched = 0, moves = 0, timer = 0, timerInterval = null, lock = false;

function init() {
  clearInterval(timerInterval);
  timer = 0; moves = 0; matched = 0; flipped = []; lock = false;
  timerEl.textContent = 0; movesEl.textContent = 0;
  const size = +diffSel.value;
  const pairs = (size * size) / 2;
  const emojis = EMOJIS.slice(0, pairs);
  cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  board.innerHTML = '';
  cards.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = i;
    card.innerHTML = `<div class="front">❓</div><div class="back">${emoji}</div>`;
    card.addEventListener('click', () => flip(card, i));
    board.appendChild(card);
  });
  timerInterval = setInterval(() => { timer++; timerEl.textContent = timer; }, 1000);
}

function flip(card, i) {
  if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  flipped.push({card, i});
  if (flipped.length === 2) {
    moves++; movesEl.textContent = moves;
    lock = true;
    const [a, b] = flipped;
    if (cards[a.i] === cards[b.i]) {
      a.card.classList.add('matched');
      b.card.classList.add('matched');
      matched += 2;
      flipped = [];
      lock = false;
      if (matched === cards.length) {
        clearInterval(timerInterval);
        setTimeout(() => alert(`恭喜！步数: ${moves}, 时间: ${timer}s`), 300);
      }
    } else {
      setTimeout(() => {
        a.card.classList.remove('flipped');
        b.card.classList.remove('flipped');
        flipped = [];
        lock = false;
      }, 800);
    }
  }
}

diffSel.addEventListener('change', init);
restartBtn.addEventListener('click', init);
init();