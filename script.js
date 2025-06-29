const gameDuration = 25;
let score = 0;
let timeLeft = gameDuration;
let spawnInterval;
let timerInterval;
let sessionHighscore = 0;

window.addEventListener("DOMContentLoaded", () => {
  const menuCursor = document.querySelector("#menuCursor");
  const targetCursor = document.querySelector("#targetCursor");

  let currentMenuTarget = null;

  const menuButtons = document.querySelectorAll(".menu-clickable");

  menuCursor.addEventListener("mouseenter", (evt) => {
    currentMenuTarget = evt.target;
    console.log("Gaze ENTER:", currentMenuTarget.id || currentMenuTarget.className);
  });
  menuCursor.addEventListener("mouseleave", () => {
    console.log("Gaze LEAVE");
    currentMenuTarget = null;
  });

  window.addEventListener("touchstart", () => {
    if (currentMenuTarget) {
      console.log("Touchstart -> emit Click:", currentMenuTarget.id || currentMenuTarget.className);
      currentMenuTarget.emit("click");
    }
  });

  menuButtons.forEach(el => {
    el.addEventListener("click", () => {
      console.log("Direkter Click auf:", el.id || el.className);
      handleMenuClick(el);
    });
  });

  document.querySelector("#btn-easy").addEventListener("click", () => startGame("easy"));
  document.querySelector("#btn-medium").addEventListener("click", () => startGame("medium"));
  document.querySelector("#btn-hard").addEventListener("click", () => startGame("hard"));
  document.querySelector("#btn-restart").addEventListener("click", restartGame);

  targetCursor.addEventListener("click", (evt) => {
    console.log("Target-Cursor Click:", evt.target);
  });

  function handleMenuClick(el) {
    if (el.classList.contains("portalStarry")) {
      switchEnvironment("starry");
    }
    if (el.classList.contains("portalForrest")) {
      switchEnvironment("forest");
    }
  }

function switchEnvironment(target) {
  const env = document.getElementById("environment");
  const portalsStarry = document.querySelectorAll(".portalStarry");
  const portalsForrest = document.querySelectorAll(".portalForrest");
  const forestObjects = document.getElementById("forestObjects");
  const starryObjects = document.getElementById("starryObjects");

  if (target === "starry") {
    env.setAttribute("environment", "preset: starry; ground: noise; groundColor: #444; dressingAmount: 750;");
    portalsStarry.forEach(p => {
      p.setAttribute("visible", "false");
      p.classList.remove("menu-clickable");
    });
    portalsForrest.forEach(p => {
      p.setAttribute("visible", "true");
      p.classList.add("menu-clickable");
    });

    // Starry Objekte AN, Forest AUS
    forestObjects.setAttribute("visible", "false");
    starryObjects.setAttribute("visible", "true");

  } else if (target === "forest") {
    env.setAttribute("environment", "preset: forest; ground: noise; groundColor: #444; dressingAmount: 750;");
    portalsStarry.forEach(p => {
      p.setAttribute("visible", "true");
      p.classList.add("menu-clickable");
    });
    portalsForrest.forEach(p => {
      p.setAttribute("visible", "false");
      p.classList.remove("menu-clickable");
    });

    // Starry Objekte AUS, Forest AN
    forestObjects.setAttribute("visible", "true");
    starryObjects.setAttribute("visible", "false");
  }
}



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

  function updateHighscoreUI() {
    document.querySelector("#highscoreText").setAttribute(
      "value",
      `Highscore: ${sessionHighscore}`
    );
  }

  function endGame() {
    hideElement("#scoreboard");
    showElement("#endScreen");
    document.querySelector("#endText").setAttribute("value", `Zeit abgelaufen!\nTreffer: ${score}`);
    if (score > sessionHighscore) sessionHighscore = score;
    updateHighscoreUI();
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
    target.setAttribute("class", "target-clickable");
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
      if (navigator.vibrate) navigator.vibrate(30);
    }
  }

  function updateScoreUI() {
    document.querySelector("#scoreText").setAttribute("value", `Treffer: ${score}`);
  }
  function updateTimeUI() {
    document.querySelector("#timeText").setAttribute("value", `Zeit: ${timeLeft}s`);
  }
  function showElement(selector) {
    const el = document.querySelector(selector);
    el.setAttribute("visible", "true");
  }
  function hideElement(selector) {
    const el = document.querySelector(selector);
    el.setAttribute("visible", "false");
  }
});
