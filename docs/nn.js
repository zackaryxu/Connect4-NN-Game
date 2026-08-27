let modelCache = {};

async function loadModel(name) {
  if (modelCache[name]) return modelCache[name];
  let res = await fetch("models/" + name + ".json");
  let layers = await res.json();
  modelCache[name] = layers;
  return layers;
}

function relu(arr) {
  let out = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(arr[i] > 0 ? arr[i] : 0);
  }
  return out;
}

function softmax(arr) {
  let out = [];
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    out.push(Math.exp(arr[i]));
    total += out[i];
  }
  for (let i = 0; i < out.length; i++) {
    out[i] = out[i] / total;
  }
  return out;
}

function layerForward(layer, input) {
  let out = [];
  for (let i = 0; i < layer.w.length; i++) {
    let sum = layer.b[i];
    let row = layer.w[i];
    for (let j = 0; j < row.length; j++) {
      sum += row[j] * input[j];
    }
    out.push(sum);
  }
  return out;
}

function modelForward(layers, input) {
  let x = input;
  for (let i = 0; i < layers.length; i++) {
    x = layerForward(layers[i], x);
    if (i === layers.length - 1) {
      x = softmax(x);
    } else {
      x = relu(x);
    }
  }
  return x;
}

// same encoding Main.java used - 1 for me, -1 for opponent, 0 empty
function encodeBoard(board, me) {
  let opp = -me;
  let out = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7; c++) {
      let v = board[r][c];
      if (v === me) out.push(1);
      else if (v === opp) out.push(-1);
      else out.push(0);
    }
  }
  return out;
}
