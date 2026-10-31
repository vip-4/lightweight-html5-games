const CACHE_NAME = 'games-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/2048/', '/2048/index.html', '/2048/css/style.css', '/2048/js/game.js',
  '/snake/', '/snake/index.html', '/snake/css/style.css', '/snake/js/game.js',
  '/tetris/', '/tetris/index.html', '/tetris/css/style.css', '/tetris/js/game.js',
  '/memory/', '/memory/index.html', '/memory/css/style.css', '/memory/js/game.js',
  '/breakout/', '/breakout/index.html', '/breakout/css/style.css', '/breakout/js/game.js',
  '/match3/', '/match3/index.html', '/match3/css/style.css', '/match3/js/game.js',
  '/sudoku/', '/sudoku/index.html', '/sudoku/css/style.css', '/sudoku/js/game.js',
  '/blackjack/', '/blackjack/index.html', '/blackjack/css/style.css', '/blackjack/js/game.js',
  '/gomoku/', '/gomoku/index.html', '/gomoku/css/style.css', '/gomoku/js/game.js',
  '/minesweeper/', '/minesweeper/index.html', '/minesweeper/css/style.css', '/minesweeper/js/game.js',
  '/xiangqi/', '/xiangqi/index.html', '/xiangqi/css/style.css', '/xiangqi/js/game.js',
  '/chess/', '/chess/index.html', '/chess/css/style.css', '/chess/js/game.js',
  '/sokoban/', '/sokoban/index.html', '/sokoban/css/style.css', '/sokoban/js/game.js',
  '/flappy/', '/flappy/index.html', '/flappy/css/style.css', '/flappy/js/game.js',
  '/whackamole/', '/whackamole/index.html', '/whackamole/css/style.css', '/whackamole/js/game.js',
  '/hangman/', '/hangman/index.html', '/hangman/css/style.css', '/hangman/js/game.js',
  '/reaction/', '/reaction/index.html', '/reaction/css/style.css', '/reaction/js/game.js',
  '/typing/', '/typing/index.html', '/typing/css/style.css', '/typing/js/game.js',
  '/pong/', '/pong/index.html', '/pong/css/style.css', '/pong/js/game.js',
  '/tictactoe/', '/tictactoe/index.html', '/tictactoe/css/style.css', '/tictactoe/js/game.js',
  '/pacman/', '/pacman/index.html',
  '/img/og-image.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((resp) => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return resp;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
