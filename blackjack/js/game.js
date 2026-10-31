const SUITS = ['♠','♥','♦','♣'];
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
let deck = [], player = [], dealer = [], chips = 1000, bet = 10, state = 'idle';

const playerCards = document.getElementById('player-cards');
const dealerCards = document.getElementById('dealer-cards');
const playerScore = document.getElementById('player-score');
const dealerScore = document.getElementById('dealer-score');
const chipsEl = document.getElementById('chips');
const betEl = document.getElementById('bet');
const msgEl = document.getElementById('message');
const dealBtn = document.getElementById('deal');
const hitBtn = document.getElementById('hit');
const standBtn = document.getElementById('stand');
const doubleBtn = document.getElementById('double');
const betSlider = document.getElementById('bet-slider');

function cardValue(card) {
  if (card.rank === 'A') return 11;
  if (['J','Q','K'].includes(card.rank)) return 10;
  return +card.rank;
}

function handValue(hand) {
  let total = 0, aces = 0;
  for (const c of hand) { total += cardValue(c); if (c.rank === 'A') aces++; }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function makeDeck() {
  deck = [];
  for (const s of SUITS)
    for (const r of RANKS)
      deck.push({suit: s, rank: r});
  // shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function drawCard(hand, hidden = false) {
  const card = deck.pop();
  hand.push({...card, hidden});
  return card;
}

function renderCard(card, container, hidden = false) {
  const el = document.createElement('div');
  el.className = 'card' + (card.suit === '♥' || card.suit === '♦' ? ' red' : '');
  if (hidden) { el.textContent = '?'; el.style.background = '#334155'; el.style.color = '#fff'; }
  else { el.innerHTML = `<span>${card.rank}</span><span class="suit">${card.suit}</span>`; }
  container.appendChild(el);
}

function renderHands(showDealer = false) {
  playerCards.innerHTML = '';
  dealerCards.innerHTML = '';
  player.forEach(c => renderCard(c, playerCards));
  dealer.forEach((c, i) => renderCard(c, dealerCards, !showDealer && i === 1));
  playerScore.textContent = handValue(player);
  dealerScore.textContent = showDealer ? handValue(dealer) : '?';
}

function setMessage(msg) { msgEl.textContent = msg; }

function deal() {
  if (chips < bet) { setMessage('筹码不足！'); return; }
  chips -= bet;
  chipsEl.textContent = chips;
  makeDeck();
  player = []; dealer = [];
  drawCard(player); drawCard(dealer); drawCard(player); drawCard(dealer, true);
  renderHands();
  const pv = handValue(player);
  if (pv === 21) { endRound('blackjack'); return; }
  state = 'playing';
  dealBtn.disabled = true;
  hitBtn.disabled = false;
  standBtn.disabled = false;
  doubleBtn.disabled = chips < bet;
  setMessage('要牌 or 停牌？');
}

function hit() {
  drawCard(player);
  renderHands();
  const pv = handValue(player);
  if (pv > 21) { endRound('bust'); }
  else if (pv === 21) { stand(); }
}

function stand() {
  // reveal dealer
  dealer[1].hidden = false;
  renderHands(true);
  while (handValue(dealer) < 17) {
    drawCard(dealer);
    renderHands(true);
  }
  const pv = handValue(player), dv = handValue(dealer);
  if (dv > 21) endRound('dealer-bust');
  else if (pv > dv) endRound('win');
  else if (pv < dv) endRound('lose');
  else endRound('push');
}

function doubleDown() {
  if (chips < bet) return;
  chips -= bet;
  bet *= 2;
  chipsEl.textContent = chips; betEl.textContent = bet;
  drawCard(player);
  renderHands();
  if (handValue(player) > 21) endRound('bust');
  else stand();
}

function endRound(result) {
  state = 'ended';
  hitBtn.disabled = true;
  standBtn.disabled = true;
  doubleBtn.disabled = true;
  dealer[1].hidden = false;
  renderHands(true);
  let msg = '';
  switch (result) {
    case 'blackjack': msg = 'Blackjack! 赢得 ' + (bet * 1.5) + ' 筹码'; chips += bet + bet * 1.5; break;
    case 'win': msg = '你赢了！获得 ' + bet + ' 筹码'; chips += bet * 2; break;
    case 'dealer-bust': msg = '庄家爆牌！你赢了 ' + bet; chips += bet * 2; break;
    case 'bust': msg = '爆牌！你输了 ' + bet; break;
    case 'lose': msg = '庄家赢了，你输了 ' + bet; break;
    case 'push': msg = '平局，退还 ' + bet; chips += bet; break;
  }
  setMessage(msg);
  chipsEl.textContent = chips;
  bet /= (result === 'double' ? 2 : 1);
  betEl.textContent = bet;
  setTimeout(() => { dealBtn.disabled = false; }, 1500);
}

betSlider.addEventListener('input', () => {
  if (state !== 'idle' && state !== 'ended') return;
  bet = +betSlider.value;
  betEl.textContent = bet;
});

dealBtn.addEventListener('click', () => {
  if (state === 'playing') return;
  state = 'idle';
  bet = +betSlider.value;
  betEl.textContent = bet;
  deal();
});
hitBtn.addEventListener('click', hit);
standBtn.addEventListener('click', stand);
doubleBtn.addEventListener('click', doubleDown);

chipsEl.textContent = chips;
betEl.textContent = bet;