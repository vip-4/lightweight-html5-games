const WORDS = {
  animals: ['ELEPHANT','GIRAFFE','PENGUIN','DOLPHIN','KANGAROO','CROCODILE','BUTTERFLY','OCTOPUS'],
  fruits: ['STRAWBERRY','PINEAPPLE','WATERMELON','BLUEBERRY','POMEGRANATE','AVOCADO','PAPAYA'],
  countries: ['JAPAN','BRAZIL','CANADA','AUSTRALIA','EGYPT','GERMANY','FRANCE','ITALY']
};
const PARTS = ['rope','head','body','left-arm','right-arm','left-leg','right-leg'];
let word = '', guessed = new Set(), lives = 6, gameOver = false;

const wordEl = document.getElementById('word');
const kbEl = document.getElementById('keyboard');
const livesEl = document.getElementById('lives');
const msgEl = document.getElementById('message');
const themeSel = document.getElementById('theme');
const restartBtn = document.getElementById('restart');

function init() {
  const list = WORDS[themeSel.value];
  word = list[Math.floor(Math.random() * list.length)];
  guessed = new Set(); lives = 6; gameOver = false;
  livesEl.textContent = 6;
  msgEl.textContent = '';
  PARTS.forEach(p => { const el = document.getElementById(p); if (el) el.setAttribute('opacity', '0'); });
  renderWord();
  renderKeyboard();
}

function renderWord() {
  wordEl.innerHTML = '';
  for (const ch of word) {
    const span = document.createElement('div');
    span.className = 'letter';
    span.textContent = guessed.has(ch) ? ch : '';
    wordEl.appendChild(span);
  }
  if (word.split('').every(c => guessed.has(c))) {
    gameOver = true; msgEl.textContent = '恭喜你猜对了！';
  }
}

function renderKeyboard() {
  kbEl.innerHTML = '';
  for (let i = 65; i <= 90; i++) {
    const ch = String.fromCharCode(i);
    const btn = document.createElement('button');
    btn.textContent = ch;
    if (guessed.has(ch)) btn.classList.add('used');
    btn.addEventListener('click', () => guess(ch));
    kbEl.appendChild(btn);
  }
}

function guess(ch) {
  if (gameOver || guessed.has(ch)) return;
  guessed.add(ch);
  if (word.includes(ch)) {
    renderWord();
  } else {
    lives--;
    livesEl.textContent = lives;
    const partIdx = 6 - lives;
    if (partIdx < PARTS.length) {
      const el = document.getElementById(PARTS[partIdx]);
      if (el) el.setAttribute('opacity', '1');
    }
    if (lives <= 0) { gameOver = true; msgEl.textContent = '游戏结束！单词是: ' + word; revealWord(); }
  }
  renderKeyboard();
}

function revealWord() {
  wordEl.innerHTML = '';
  for (const ch of word) {
    const span = document.createElement('div');
    span.className = 'letter';
    span.textContent = ch;
    span.style.color = guessed.has(ch) ? '#f8fafc' : '#ef4444';
    wordEl.appendChild(span);
  }
}

themeSel.addEventListener('change', init);
restartBtn.addEventListener('click', init);
init();