const gameDuration = 25;
let score = 0;
let timeLeft = gameDuration;
let spawnInterval;
let timerInterval;

window.addEventListener("DOMContentLoaded", () => {
  // Schwierigkeits-Buttons
  document.querySelector("#btn-easy").addEventListener("click", () => startGame("easy"));
  document.querySelector("#btn-medium").addEventListener("click", () => startGame("medium"));
  document.querySelector("#btn-hard").addEventListener("click", () => startGame("hard"));

  // Restart-Button
  document.querySelector("#btn-restart").addEventListener("click", () => restartGame());
});

function startGame(difficulty) {
  score = 0;
  timeLeft = gameDuration;
  updateScoreUI();
  updateTimeUI();

  hideElement("#menu");
  hideElement("#endScreen");
  showElement("#scoreboard");

  const spawnRate = {
    easy: 1500,
    medium: 1000,
    hard: 600,
  }[difficulty];

  spawnInterval = setInterval(spawnTarget, spawnRate);
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  timeLeft--;
  updateTimeUI();

  if (timeLeft <= 0) {
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    endGame();
  }
}

function endGame() {
  hideElement("#scoreboard");

  showElement("#endScreen");
  document.querySelector("#endText").setAttribute("value", `Zeit abgelaufen!\nTreffer: ${score}`);
  document.getElementById("targetContainer").innerHTML = "";
}

function restartGame() {
  hideElement("#endScreen");
  showElement("#menu");
}

function spawnTarget() {
  const target = document.createElement("a-sphere");
  target.setAttribute("radius", 0.3);
  target.setAttribute("color", "#FF0000");

  const posX = (Math.random() - 0.5) * 4;
  const posY = Math.random() * 2 + 1;
  const posZ = -3 - Math.random() * 2;
  target.setAttribute("position", `${posX} ${posY} ${posZ}`);

  target.setAttribute("class", "clickable");
  target.setAttribute("event-set__enter", "_event: mouseenter; color: #00FF00");
  target.setAttribute("event-set__leave", "_event: mouseleave; color: #FF0000");

  target.addEventListener("click", () => hitTarget(target));
  document.getElementById("targetContainer").appendChild(target);

  setTimeout(() => {
    if (target.parentNode) target.remove();
  }, 3000);
}

function hitTarget(el) {
  score++;
  updateScoreUI();
  el.remove();

  const popSound = document.getElementById("pop-sound");
  if (popSound) {
    popSound.currentTime = 0;
    popSound.play();
    if (navigator.vibrate) navigator.vibrate(100);
  }
}

function updateScoreUI() {
  document.querySelector("#scoreText").setAttribute("value", `Treffer: ${score}`);
}

function updateTimeUI() {
  document.querySelector("#timeText").setAttribute("value", `Zeit: ${timeLeft}s`);
}

// Sichtbarkeit
function showElement(selector) {
  const el = document.querySelector(selector);
  el.setAttribute("visible", "true");
  el.querySelectorAll(".clickable").forEach(c => c.classList.add("clickable"));
}

function hideElement(selector) {
  const el = document.querySelector(selector);
  el.setAttribute("visible", "false");
  el.querySelectorAll(".clickable").forEach(c => c.classList.remove("clickable"));
}
