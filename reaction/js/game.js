const box = document.getElementById('box');
const lastEl = document.getElementById('last');
const avgEl = document.getElementById('avg');
const bestEl = document.getElementById('best');
const countEl = document.getElementById('count');
const resetBtn = document.getElementById('reset');
let state = 'idle'; // idle, waiting, ready, go
let startTime = 0, timeoutId = null;
const results = JSON.parse(localStorage.getItem('reaction-results') || '[]');

function updateStats() {
  countEl.textContent = results.length;
  if (results.length === 0) { lastEl.textContent = '-'; avgEl.textContent = '-'; bestEl.textContent = '-'; return; }
  lastEl.textContent = results[results.length - 1];
  const avg = Math.round(results.reduce((a,b) => a+b, 0) / results.length);
  avgEl.textContent = avg;
  bestEl.textContent = Math.min(...results);
}

function setState(s, text) {
  state = s;
  box.className = 'box ' + s;
  box.textContent = text;
}

function start() {
  setState('waiting', '等待变色...');
  const delay = 1000 + Math.random() * 3000;
  timeoutId = setTimeout(() => {
    setState('go', '点击！');
    startTime = performance.now();
  }, delay);
}

function click() {
  if (state === 'idle' || state === 'waiting') {
    if (state === 'waiting') {
      clearTimeout(timeoutId);
      setState('too-early', '太早了！点击重试');
      setTimeout(() => setState('idle', '点击开始'), 1000);
    } else {
      start();
    }
    return;
  }
  if (state === 'go') {
    const rt = Math.round(performance.now() - startTime);
    results.push(rt);
    if (results.length > 20) results.shift();
    localStorage.setItem('reaction-results', JSON.stringify(results));
    setState('idle', rt + ' ms — 点击继续');
    updateStats();
    return;
  }
  if (state === 'too-early') {
    setState('idle', '点击开始');
  }
}

box.addEventListener('click', click);
resetBtn.addEventListener('click', () => { results.length = 0; localStorage.removeItem('reaction-results'); updateStats(); setState('idle', '点击开始'); });
updateStats();
setState('idle', '点击开始');