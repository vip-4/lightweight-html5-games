const textEl = document.getElementById('text');
const inputEl = document.getElementById('input');
const wpmEl = document.getElementById('wpm');
const accEl = document.getElementById('accuracy');
const timeEl = document.getElementById('time');
const charsEl = document.getElementById('chars');
const durSel = document.getElementById('duration');
const startBtn = document.getElementById('start');

const PARAGRAPHS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump. The five boxing wizards jump quickly.",
  "Sphinx of black quartz, judge my vow. Two driven jocks help fax my big quiz.",
  "The journey of a thousand miles begins with a single step. Practice makes perfect.",
  "In the middle of difficulty lies opportunity. Every expert was once a beginner."
];

let target = '', input = '', timer = 0, interval = null, running = false, totalChars = 0, correctChars = 0;

function init() {
  clearInterval(interval);
  running = false;
  input = ''; totalChars = 0; correctChars = 0;
  inputEl.value = ''; inputEl.disabled = true;
  timeEl.textContent = durSel.value; wpmEl.textContent = 0; accEl.textContent = 100; charsEl.textContent = 0;
  target = PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)];
  renderText();
}

function renderText() {
  textEl.innerHTML = '';
  for (let i = 0; i < target.length; i++) {
    const span = document.createElement('span');
    if (i < input.length) {
      span.className = input[i] === target[i] ? 'correct' : 'wrong';
    } else if (i === input.length) {
      span.className = 'current';
    }
    span.textContent = target[i];
    textEl.appendChild(span);
  }
}

function start() {
  init();
  running = true;
  timer = +durSel.value;
  timeEl.textContent = timer;
  inputEl.disabled = false;
  inputEl.focus();
  interval = setInterval(() => {
    timer--;
    timeEl.textContent = timer;
    if (timer <= 0) { clearInterval(interval); running = false; inputEl.disabled = true; showResult(); }
  }, 1000);
}

function showResult() {
  const wpm = Math.round((correctChars / 5) / (+durSel.value / 60));
  alert(`时间到！WPM: ${wpm}, 准确率: ${Math.round(correctChars/totalChars*100)}%`);
}

inputEl.addEventListener('input', () => {
  if (!running) return;
  input = inputEl.value;
  totalChars = input.length;
  correctChars = 0;
  for (let i = 0; i < input.length && i < target.length; i++) {
    if (input[i] === target[i]) correctChars++;
  }
  charsEl.textContent = totalChars;
  const wpm = Math.round((correctChars / 5) / ((+durSel.value - timer) / 60 || 1));
  wpmEl.textContent = wpm || 0;
  accEl.textContent = totalChars > 0 ? Math.round(correctChars / totalChars * 100) : 100;
  renderText();
});

startBtn.addEventListener('click', start);
durSel.addEventListener('change', init);
init();