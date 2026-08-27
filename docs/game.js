// row 0 = top, row 5 = bottom. 1 = yellow, -1 = red/bot

let board = [];
let turn = 1;
let mode = null; // "2p", "EASY", "MEDIUM", "HARD", "IMPOSSIBLE"
let gameOver = false;
let botThinking = false;

let boardEl = document.getElementById("board");
let statusEl = document.getElementById("status");
let startScreen = document.getElementById("start-screen");
let gameScreen = document.getElementById("game-screen");

function newBoard() {
  let b = [];
  for (let r = 0; r < 6; r++) {
    b.push([0, 0, 0, 0, 0, 0, 0]);
  }
  return b;
}

function lowestOpenRow(b, col) {
  for (let r = 5; r >= 0; r--) {
    if (b[r][col] === 0) return r;
  }
  return -1;
}

function isValidMove(b, col) {
  return b[0][col] === 0;
}

function checkWin(b, row, col) {
  let who = b[row][col];
  let dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (let d = 0; d < dirs.length; d++) {
    let dr = dirs[d][0];
    let dc = dirs[d][1];
    let count = 1;

    for (let sign = 1; sign >= -1; sign -= 2) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (r >= 0 && r < 6 && c >= 0 && c < 7 && b[r][c] === who) {
        count++;
        r += dr * sign;
        c += dc * sign;
      }
    }

    if (count >= 4) return true;
  }
  return false;
}

function isFull(b) {
  for (let c = 0; c < 7; c++) {
    if (b[0][c] === 0) return false;
  }
  return true;
}

function buildBoardUI() {
  boardEl.innerHTML = "";
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7; c++) {
      let cell = document.createElement("div");
      cell.className = "cell";

      let disc = document.createElement("div");
      disc.className = "disc empty";
      cell.appendChild(disc);

      cell.addEventListener("click", () => onColumnClick(c));
      boardEl.appendChild(cell);
    }
  }
}

function renderBoard() {
  let cells = boardEl.children;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7; c++) {
      let disc = cells[r * 7 + c].firstChild;
      let v = board[r][c];
      if (v === 1) disc.className = "disc yellow";
      else if (v === -1) disc.className = "disc red";
      else disc.className = "disc empty";
    }
  }
}

function setStatus(text) {
  statusEl.textContent = text;
}

function setEndStatus(text) {
  statusEl.textContent = text;
  statusEl.classList.remove("pop");
  void statusEl.offsetWidth; // restart the animation
  statusEl.classList.add("pop");
}

function startGame(selectedMode) {
  mode = selectedMode;
  board = newBoard();
  turn = 1;
  gameOver = false;
  botThinking = false;

  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  buildBoardUI();
  renderBoard();

  setStatus(mode === "2p" ? "Yellow's turn" : "Your turn");
}

function backToStart() {
  gameScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
}

async function onColumnClick(col) {
  if (gameOver || botThinking) return;
  if (mode !== "2p" && turn !== 1) return;
  if (!isValidMove(board, col)) return;

  playMove(col, turn);
  if (gameOver) return;

  if (mode !== "2p" && turn === -1) {
    botThinking = true;
    setStatus("thinking...");

    await new Promise((resolve) => setTimeout(resolve, 350));

    let botCol = await pickBotMove(board, mode);
    console.log("bot picked col", botCol);
    botThinking = false;
    if (!gameOver) playMove(botCol, -1);
  }
}

function playMove(col, player) {
  let row = lowestOpenRow(board, col);
  if (row === -1) return;

  board[row][col] = player;
  renderBoard();

  if (checkWin(board, row, col)) {
    gameOver = true;
    if (mode === "2p") {
      setEndStatus((player === 1 ? "Yellow" : "Red") + " wins!");
    } else {
      setEndStatus(player === 1 ? "You win!" : "Bot wins.");
    }
    spawnConfetti();
    return;
  }

  if (isFull(board)) {
    gameOver = true;
    setEndStatus("Draw.");
    return;
  }

  turn = -turn;
  if (mode === "2p") {
    setStatus((turn === 1 ? "Yellow" : "Red") + "'s turn");
  } else {
    setStatus(turn === 1 ? "Your turn" : "thinking...");
  }
}

document.getElementById("btn-2p").addEventListener("click", () => startGame("2p"));
document.getElementById("btn-easy").addEventListener("click", () => startGame("EASY"));
document.getElementById("btn-medium").addEventListener("click", () => startGame("MEDIUM"));
document.getElementById("btn-hard").addEventListener("click", () => startGame("HARD"));
document.getElementById("btn-impossible").addEventListener("click", () => startGame("IMPOSSIBLE"));
document.getElementById("btn-restart").addEventListener("click", backToStart);


