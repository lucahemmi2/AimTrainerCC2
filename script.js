const gameDuration = 25;
let score = 0;
let timeLeft = gameDuration;
let spawnInterval;
let timerInterval;
let sessionHighscore = 0;
let reactionTimes = [];

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

  // Löst einen Klick aus, wenn per Touch bestätigt wird (nur wenn ein Menüelement im Fokus ist)
  window.addEventListener("touchstart", () => {
    if (currentMenuTarget) {
      console.log("Touchstart -> emit Click:", currentMenuTarget.id || currentMenuTarget.className);
      currentMenuTarget.emit("click");
    }
  });

  // Alle Menü-Buttons bekommen ihren Click-Handler
  menuButtons.forEach(el => {
    el.addEventListener("click", () => {
      console.log("Direkter Click auf:", el.id || el.className);
      handleMenuClick(el);
    });
  });

  // Start- und Restart-Buttons initialisieren das Spiel bzw. setzen zurück
  document.querySelector("#btn-easy").addEventListener("click", () => startGame("easy"));
  document.querySelector("#btn-medium").addEventListener("click", () => startGame("medium"));
  document.querySelector("#btn-hard").addEventListener("click", () => startGame("hard"));
  document.querySelector("#btn-restart").addEventListener("click", restartGame);

  targetCursor.addEventListener("click", (evt) => {
    console.log("Target-Cursor Click:", evt.target);
  });

  // Prüft, welches Portal angeklickt wurde und wechselt die Umgebung
  function handleMenuClick(el) {
    if (el.classList.contains("portalStarry")) {
      switchEnvironment("starry");
    }
    if (el.classList.contains("portalForrest")) {
      switchEnvironment("forest");
    }
  }

  // Vordefinierte Schwierigkeitsgrade: Spawnrate, Größe, Beweglichkeit etc.
  const difficultySettings = {
    easy: {
      spawnRate: 400,
      targetRadius: 0.5,
      spawnRange: 3,
      move: false,
    },
    medium: {
      spawnRate: 800,
      targetRadius: 0.4,
      spawnRange: 8,
      move: false,
    },
    hard: {
      spawnRate: 600,
      targetRadius: 0.3,
      spawnRange: 15,
      move: true,
    }
  };

  // Schaltet zwischen Wald- und Sternenhimmel-Umgebung inkl. Portalen und Objekten um
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

      // Zeigt nur Starry-Objekte an
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

      // Zeigt nur Forest-Objekte an
      forestObjects.setAttribute("visible", "true");
      starryObjects.setAttribute("visible", "false");
    }
  }

  // Startet das Spiel: setzt alles zurück, blendet Menü aus, blendet Score ein
  function startGame(difficulty) {
    reactionTimes = [];
    currentDifficulty = difficulty; // Hinweis: wird dynamisch gesetzt
    score = 0;
    timeLeft = gameDuration;
    updateScoreUI();
    updateTimeUI();
    hideElement("#menu");
    hideElement("#endScreen");
    showElement("#scoreboard");

    const spawnRate = difficultySettings[difficulty].spawnRate;

    spawnInterval = setInterval(spawnTarget, spawnRate);
    timerInterval = setInterval(updateTimer, 1000);
  }

  // Zählt Spielzeit runter und beendet Spiel bei Null Sekunden
  function updateTimer() {
    timeLeft--;
    updateTimeUI();
    if (timeLeft <= 0) {
      clearInterval(spawnInterval);
      clearInterval(timerInterval);
      endGame();
    }
  }

  // Aktualisiert Highscore und Ø Reaktionszeit auf der Tafel
  function updateHighscoreUI() {
    document.querySelector("#highscoreText").setAttribute(
      "value",
      `Highscore: ${sessionHighscore}`
    );

    const avg = getAverageReactionTime().toFixed(0);
    document.querySelector("#reactionText").setAttribute(
      "value",
      `Ø Reaktion: ${avg} ms`
    );
  }

  // Zeigt Endscreen, speichert Highscore, räumt alle Ziele weg
  function endGame() {
    showElement("#scoreboard");
    showElement("#endScreen");

    document.querySelector("#endText").setAttribute(
      "value",
      `Zeit abgelaufen!\nTreffer: ${score}\nØ Reaktionszeit: ${getAverageReactionTime().toFixed(0)} ms`
    );

    if (score > sessionHighscore) sessionHighscore = score;

    updateHighscoreUI();
    document.getElementById("targetContainer").innerHTML = "";
    document.getElementById("reactionTimes").innerHTML = "";

    // Blendet Scoreboard nach kurzer Zeit aus
    setTimeout(() => {
      hideElement("#scoreboard");
    }, 3000);
  }

  // Berechnet Durchschnitt aller Reaktionszeiten in ms
  function getAverageReactionTime() {
    if (reactionTimes.length === 0) return 0;
    const sum = reactionTimes.reduce((a, b) => a + b, 0);
    return sum / reactionTimes.length;
  }

  // Beendet Runde, blendet Endscreen aus und zeigt Startmenü wieder an
  function restartGame() {
    hideElement("#endScreen");
    showElement("#menu");
  }

  // Spawnt ein Ziel mit Zufallsposition, optionaler Animation, Auto-Remove nach 3 Sekunden
  function spawnTarget() {
    const settings = difficultySettings[currentDifficulty];
    const target = document.createElement("a-sphere");
    target.setAttribute("radius", settings.targetRadius);
    target.setAttribute("color", "#FF0000");

    const posX = (Math.random() - 0.5) * settings.spawnRange;
    const posY = Math.random() * 2 + 3;
    const posZ = -3 - Math.random() * 2;
    target.setAttribute("position", `${posX} ${posY} ${posZ}`);
    target.setAttribute("class", "target-clickable");
    target.setAttribute("event-set__enter", "_event: mouseenter; color: #00FF00");
    target.setAttribute("event-set__leave", "_event: mouseleave; color: #FF0000");

    // Speichert Spawn-Zeitpunkt für Reaktionsmessung
    target.spawnTime = performance.now();

    // Bewegt das Target, wenn Schwierigkeitsgrad Bewegung erlaubt
    if (settings.move) {
      const moveAxis = Math.random() < 0.2 ? 'x' : 'y';
      const moveAmount = (Math.random() * 2 + 0.5) * (Math.random() < 0.5 ? -1 : 1);
      const dur = 1000 + Math.random() * 1500;

      let toPos;
      if (moveAxis === 'x') {
        toPos = `${posX + moveAmount} ${posY} ${posZ}`;
      } else {
        toPos = `${posX} ${posY + moveAmount} ${posZ}`;
      }

      target.setAttribute("animation", `
        property: position;
        dir: alternate;
        dur: ${dur};
        loop: true;
        to: ${toPos};
        easing: easeInOutSine
      `);
    }

    // Bei Treffer wird Target entfernt
    target.addEventListener("click", () => hitTarget(target));
    document.getElementById("targetContainer").appendChild(target);

    // Nach 3 Sekunden automatisch entfernen
    setTimeout(() => {
      if (target.parentNode) target.remove();
    }, 3000);
  }

  // Zählt Treffer, misst Reaktionszeit, spielt Ton, vibriert bei Treffer
  function hitTarget(el) {
    const hitTime = performance.now();
    const reactionTime = hitTime - el.spawnTime;
    reactionTimes.push(reactionTime);
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

  // Schreibt aktuellen Score ins UI
  function updateScoreUI() {
    document.querySelector("#scoreText").setAttribute("value", `Treffer: ${score}`);
  }

  // Schreibt aktuelle Restzeit ins UI
  function updateTimeUI() {
    document.querySelector("#timeText").setAttribute("value", `Zeit: ${timeLeft}s`);
  }

  // Blendet ein Element ein
  function showElement(selector) {
    const el = document.querySelector(selector);
    el.setAttribute("visible", "true");
  }

  // Blendet ein Element aus
  function hideElement(selector) {
    const el = document.querySelector(selector);
    el.setAttribute("visible", "false");
  }
});
