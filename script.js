const board = document.getElementById('board');
const statusText = document.getElementById('status');
const cells = document.querySelectorAll('.cell');
const botLevelSelect = document.getElementById('botLevel');
let currentPlayer = 'X';
let isGameActive = true;
let botLevel = 'none';

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function getBoardState() {
  return Array.from(cells).map(cell => cell.innerText);
}

function checkWinner() {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (
      cells[a].innerText &&
      cells[a].innerText === cells[b].innerText &&
      cells[a].innerText === cells[c].innerText
    ) {
      cells[a].classList.add('win');
      cells[b].classList.add('win');
      cells[c].classList.add('win');
      statusText.innerText = `Player ${cells[a].innerText} wins! 🎉`;
      isGameActive = false;
      return cells[a].innerText;
    }
  }
  if ([...cells].every(cell => cell.innerText !== '')) {
    statusText.innerText = "It's a draw! 🤝";
    isGameActive = false;
    return 'draw';
  }
  return null;
}

function handleClick(event) {
  const cell = event.target;
  if (!isGameActive || cell.innerText !== '' || (isBotTurn() && botLevel !== 'none')) return;
  makeMove(cell, currentPlayer);
  if (isGameActive && botLevel !== 'none' && currentPlayer === 'O') {
    setTimeout(botMove, 400);
  }
}

function makeMove(cell, player) {
  cell.innerText = player;
  const winner = checkWinner();
  if (isGameActive) {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusText.innerText = `Current Player: ${currentPlayer}`;
  }
}

function resetGame() {
  cells.forEach(cell => {
    cell.innerText = '';
    cell.classList.remove('win');
  });
  currentPlayer = 'X';
  isGameActive = true;
  statusText.innerText = `Current Player: ${currentPlayer}`;
  if (botLevel !== 'none' && currentPlayer === 'O') {
    setTimeout(botMove, 400);
  }
}

function isBotTurn() {
  return botLevel !== 'none' && currentPlayer === 'O';
}

function botMove() {
  if (!isGameActive) return;
  let move;
  if (botLevel === 'easy') {
    move = getRandomMove();
  } else if (botLevel === 'hard') {
    move = getBestMove('O');
  }
  if (move !== undefined) {
    makeMove(cells[move], 'O');
  }
}

function getRandomMove() {
  const emptyCells = Array.from(cells).map((cell, i) => cell.innerText === '' ? i : null).filter(i => i !== null);
  if (emptyCells.length === 0) return;
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getBestMove(player) {
  // Minimax algorithm for unbeatable bot
  const boardState = getBoardState();
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (boardState[i] === '') {
      boardState[i] = player;
      let score = minimax(boardState, 0, false);
      boardState[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(boardState, depth, isMaximizing) {
  const winner = evaluateBoard(boardState);
  if (winner !== null) {
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (winner === 'draw') return 0;
  }
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardState[i] === '') {
        boardState[i] = 'O';
        let score = minimax(boardState, depth + 1, false);
        boardState[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (boardState[i] === '') {
        boardState[i] = 'X';
        let score = minimax(boardState, depth + 1, true);
        boardState[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function evaluateBoard(boardState) {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (
      boardState[a] &&
      boardState[a] === boardState[b] &&
      boardState[a] === boardState[c]
    ) {
      return boardState[a];
    }
  }
  if (boardState.every(cell => cell !== '')) return 'draw';
  return null;
}

botLevelSelect.addEventListener('change', function() {
  botLevel = this.value;
  resetGame();
});

cells.forEach(cell => cell.addEventListener('click', handleClick));
window.resetGame = resetGame;

// Start with correct bot if O starts
if (botLevel !== 'none' && currentPlayer === 'O') {
  setTimeout(botMove, 400);
} 