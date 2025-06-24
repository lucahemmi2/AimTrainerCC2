const gameDuration = 25;
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

  // Entferne Ziel nach 3 Sekunden, wenn nicht getroffen
  setTimeout(() => {
    if (target.parentNode) target.remove();
  }, 3000);
}

function hitTarget(el) {
  score++;
  document.getElementById("score").innerText = score;
  el.remove();

  const popSound = document.getElementById("pop-sound");
  if (popSound) {
    popSound.currentTime = 0;
    popSound.play();
  }

  if (navigator.vibrate) navigator.vibrate(100);
}
