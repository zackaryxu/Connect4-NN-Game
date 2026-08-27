let MODEL_FOR_DIFF = { HARD: "v1", EASY: "v2", MEDIUM: "v3" };

function canWinAt(b, col, player) {
  let row = lowestOpenRow(b, col);
  if (row === -1) return false;
  b[row][col] = player;
  let wins = checkWin(b, row, col);
  b[row][col] = 0;
  return wins;
}

async function pickBotMove(b, diff) {
  for (let c = 0; c < 7; c++) {
    if (isValidMove(b, c) && canWinAt(b, c, -1)) return c;
  }

  if (diff === "IMPOSSIBLE") {
    return bestMinimaxMove(b);
  }

  let blockCol = -1;
  for (let c = 0; c < 7; c++) {
    if (isValidMove(b, c) && canWinAt(b, c, 1)) blockCol = c;
  }
  if (blockCol !== -1) return blockCol;

  let avoid = [false, false, false, false, false, false, false];
  for (let c = 0; c < 7; c++) {
    if (!isValidMove(b, c)) continue;
    let row = lowestOpenRow(b, c);
    if (row - 1 >= 0) {
      b[row][c] = -1;
      b[row - 1][c] = 1;
      if (checkWin(b, row - 1, c)) avoid[c] = true;
      b[row - 1][c] = 0;
      b[row][c] = 0;
    }
  }

  let layers = await loadModel(MODEL_FOR_DIFF[diff]);
  let input = encodeBoard(b, -1);
  let out = modelForward(layers, input);

  let best = -1;
  let bestScore = -Infinity;
  for (let c = 0; c < 7; c++) {
    if (isValidMove(b, c) && !avoid[c] && out[c] > bestScore) {
      bestScore = out[c];
      best = c;
    }
  }
  if (best === -1) {
    for (let c = 0; c < 7; c++) {
      if (isValidMove(b, c) && out[c] > bestScore) {
        bestScore = out[c];
        best = c;
      }
    }
  }
  return best;
}

let CENTER_ORDER = [3, 2, 4, 1, 5, 0, 6];
let SEARCH_DEPTH = 8;

function scoreWindow(cells, player) {
  let opp = -player;
  let mine = 0;
  let empty = 0;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === player) mine++;
    else if (cells[i] === opp) return 0;
    else empty++;
  }
  if (mine === 4) return 100000;
  if (mine === 3 && empty === 1) return 50;
  if (mine === 2 && empty === 2) return 10;
  return 1;
}

function evaluateBoard(b, player) {
  let score = 0;

  for (let r = 0; r < 6; r++) {
    if (b[r][3] === player) score += 3;
  }

  let lines = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      lines.push([b[r][c], b[r][c + 1], b[r][c + 2], b[r][c + 3]]);
    }
  }
  for (let c = 0; c < 7; c++) {
    for (let r = 0; r < 3; r++) {
      lines.push([b[r][c], b[r + 1][c], b[r + 2][c], b[r + 3][c]]);
    }
  }
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      lines.push([b[r][c], b[r + 1][c + 1], b[r + 2][c + 2], b[r + 3][c + 3]]);
    }
  }
  for (let r = 3; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      lines.push([b[r][c], b[r - 1][c + 1], b[r - 2][c + 2], b[r - 3][c + 3]]);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    score += scoreWindow(lines[i], player);
    score -= scoreWindow(lines[i], -player);
  }
  return score;
}

function minimax(b, depth, alpha, beta, player, lastRow, lastCol) {
  if (lastRow !== undefined && checkWin(b, lastRow, lastCol)) {
    return -1000000 - depth;
  }
  if (isFull(b) || depth === 0) {
    return evaluateBoard(b, player);
  }

  let best = -Infinity;
  for (let i = 0; i < CENTER_ORDER.length; i++) {
    let col = CENTER_ORDER[i];
    if (!isValidMove(b, col)) continue;

    let row = lowestOpenRow(b, col);
    b[row][col] = player;
    let val = -minimax(b, depth - 1, -beta, -alpha, -player, row, col);
    b[row][col] = 0;

    if (val > best) best = val;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

function bestMinimaxMove(b) {
  let best = -1;
  let bestScore = -Infinity;
  for (let i = 0; i < CENTER_ORDER.length; i++) {
    let col = CENTER_ORDER[i];
    if (!isValidMove(b, col)) continue;

    let row = lowestOpenRow(b, col);
    b[row][col] = -1;
    let val = -minimax(b, SEARCH_DEPTH, -Infinity, Infinity, 1, row, col);
    b[row][col] = 0;

    if (val > bestScore) {
      bestScore = val;
      best = col;
    }
  }
  return best;
}
