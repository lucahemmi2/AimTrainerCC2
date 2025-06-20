const gameDuration = 25; // Spielzeit in Sekunden
let score = 0;
let timeLeft = gameDuration;
let spawnInterval;
let timerInterval;

function startGame(difficulty) {
  score = 0;
  timeLeft = gameDuration;
  document.getElementById("score").innerText = score;
  document.getElementById("time").innerText = timeLeft;
  document.getElementById("menu").style.display = "none";
  document.getElementById("scoreboard").style.display = "block";

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
  document.getElementById("time").innerText = timeLeft;
  if (timeLeft <= 0) {
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    alert(`Zeit abgelaufen! Du hast ${score} Treffer erzielt.`);
    document.getElementById("menu").style.display = "block";
    document.getElementById("scoreboard").style.display = "none";
    document.getElementById("targetContainer").innerHTML = "";
  }
}

function spawnTarget() {
  const target = document.createElement("a-sphere");
  target.setAttribute("radius", 0.2);
  target.setAttribute("color", "#F00");

  const posX = (Math.random() - 0.5) * 4;
  const posY = Math.random() * 2 + 1;
  const posZ = -3 - Math.random() * 3;
  target.setAttribute("position", `${posX} ${posY} ${posZ}`);

  // Interaktion
  target.setAttribute("class", "clickable");
  target.setAttribute("event-set__enter", "_event: mouseenter; color: #0F0");
  target.setAttribute("event-set__leave", "_event: mouseleave; color: #F00");
  target.setAttribute("onclick", "hitTarget(this)");

  document.getElementById("targetContainer").appendChild(target);

  // Target verschwindet nach 2 Sekunden
  setTimeout(() => {
    if (target.parentNode) target.remove();
  }, 2000);
}

function hitTarget(el) {
  score++;
  document.getElementById("score").innerText = score;
  el.parentNode.removeChild(el);
}
