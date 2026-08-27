let confettiColors = ["red", "yellow", "limegreen", "dodgerblue", "orange"];

function spawnConfetti() {
  let container = document.getElementById("confetti");

  for (let i = 0; i < 30; i++) {
    let piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    piece.style.animationDuration = 1.2 + Math.random() * 0.8 + "s";
    piece.style.animationDelay = Math.random() * 0.3 + "s";
    container.appendChild(piece);
  }

  setTimeout(function () {
    container.innerHTML = "";
  }, 2500);
}
