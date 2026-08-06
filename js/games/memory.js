import { resolveAsset } from "../asset-url.js";
import { audioManager } from "../audio-manager.js";
import { MEMORY_CONFIG, addPoints } from "./config.js";

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createMemoryGame({ root, getWords, onExit }) {
  let difficulty = "easy";
  let cards = [];
  let flipped = [];
  let lock = false;
  let matched = 0;
  let moves = 0;
  let wrongMoves = 0;
  let pairsTotal = 0;
  let timeLeft = 0;
  let timerId = null;
  let playing = false;

  const els = {
    setup: root.querySelector("[data-memory-setup]"),
    boardWrap: root.querySelector("[data-memory-board-wrap]"),
    board: root.querySelector("[data-memory-board]"),
    hud: root.querySelector("[data-memory-hud]"),
    time: root.querySelector("[data-memory-time]"),
    moves: root.querySelector("[data-memory-moves]"),
    score: root.querySelector("[data-memory-score]"),
    result: root.querySelector("[data-memory-result]"),
    resultTitle: root.querySelector("[data-memory-result-title]"),
    resultBody: root.querySelector("[data-memory-result-body]"),
  };

  function calcScore() {
    return Math.max(
      0,
      matched * MEMORY_CONFIG.pairPoints -
        wrongMoves * MEMORY_CONFIG.wrongPenalty +
        timeLeft * MEMORY_CONFIG.timeBonus
    );
  }

  function updateHud() {
    els.time.textContent = `${timeLeft}s`;
    els.moves.textContent = String(moves);
    els.score.textContent = String(calcScore());
  }

  let deadlineAt = 0;

  function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  function startTimer(seconds) {
    stopTimer();
    deadlineAt = Date.now() + seconds * 1000;
    timeLeft = seconds;
    updateHud();
    timerId = setInterval(() => {
      if (!playing) return;
      timeLeft = Math.max(0, Math.ceil((deadlineAt - Date.now()) / 1000));
      updateHud();
      if (timeLeft <= 0) {
        timeLeft = 0;
        updateHud();
        finish(false);
      }
    }, 200);
  }

  function showSetup() {
    playing = false;
    stopTimer();
    els.setup.hidden = false;
    els.boardWrap.hidden = true;
    els.hud.hidden = true;
    els.result.hidden = true;
    els.board.innerHTML = "";
  }

  function finish(won) {
    playing = false;
    stopTimer();
    lock = true;
    const score = calcScore();
    if (won) {
      addPoints(score);
      audioManager.victory();
      els.resultTitle.textContent = "Thắng rồi!";
    } else {
      audioManager.defeat();
      els.resultTitle.textContent = "Hết giờ!";
    }
    els.resultBody.innerHTML = `
      <p>Điểm: <strong>${score}</strong></p>
      <p>Ghép đúng: ${matched}/${pairsTotal} · Lượt: ${moves} · Sai: ${wrongMoves}</p>
      <p>Thời gian còn: ${timeLeft}s</p>
    `;
    els.result.hidden = false;
  }

  function onMatch(a, b) {
    matched += 1;
    a.classList.add("is-matched", "is-glow");
    b.classList.add("is-matched", "is-glow");
    audioManager.playSfx("match-ok");
    updateHud();
    if (matched >= pairsTotal) {
      window.setTimeout(() => finish(true), 450);
    }
  }

  function onMismatch(a, b) {
    wrongMoves += 1;
    a.classList.add("is-shake");
    b.classList.add("is-shake");
    audioManager.playSfx("match-bad");
    updateHud();
    window.setTimeout(() => {
      a.classList.remove("is-flipped", "is-shake");
      b.classList.remove("is-flipped", "is-shake");
      a.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-pressed", "false");
      lock = false;
    }, MEMORY_CONFIG.flipBackMs);
  }

  function flipCard(btn) {
    if (!playing || lock) return;
    if (btn.classList.contains("is-flipped") || btn.classList.contains("is-matched")) return;
    audioManager.playSfx("card-flip", { duckMs: 120 });
    btn.classList.add("is-flipped");
    btn.setAttribute("aria-pressed", "true");
    flipped.push(btn);
    if (flipped.length < 2) return;

    moves += 1;
    updateHud();
    lock = true;
    const [a, b] = flipped;
    flipped = [];
    if (a.dataset.pair === b.dataset.pair) {
      onMatch(a, b);
      lock = false;
    } else {
      onMismatch(a, b);
    }
  }

  function buildDeck(diffKey) {
    const cfg = MEMORY_CONFIG.difficulties[diffKey];
    const totalCards = cfg.cols * cfg.rows;
    const pairCount = totalCards / 2;
    const pool = shuffle(getWords());
    const chosen = pool.slice(0, pairCount);
    while (chosen.length < pairCount && pool.length) {
      chosen.push(pool[chosen.length % pool.length]);
    }
    const deck = [];
    chosen.forEach((word, i) => {
      deck.push({ pair: String(i), word: word.word, image: word.image });
      deck.push({ pair: String(i), word: word.word, image: word.image });
    });
    return { cfg, deck: shuffle(deck), pairCount };
  }

  function start(diffKey) {
    difficulty = diffKey;
    const words = getWords();
    if (!words.length) {
      alert("Chưa tải được từ vựng. Thử lại sau nhé!");
      return;
    }
    const { cfg, deck, pairCount } = buildDeck(diffKey);
    if (pairCount < 2 || deck.length < 4) {
      alert("Cần thêm từ vựng để chơi mức này.");
      return;
    }
    pairsTotal = pairCount;
    matched = 0;
    moves = 0;
    wrongMoves = 0;
    flipped = [];
    lock = false;
    playing = true;

    els.setup.hidden = true;
    els.result.hidden = true;
    els.boardWrap.hidden = false;
    els.hud.hidden = false;
    els.board.style.setProperty("--cols", cfg.cols);
    els.board.innerHTML = "";

    deck.forEach((item, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "memory-card";
      btn.dataset.pair = item.pair;
      btn.dataset.index = String(idx);
      btn.setAttribute("aria-label", "Thẻ úp");
      btn.setAttribute("aria-pressed", "false");

      const inner = document.createElement("span");
      inner.className = "memory-card-inner";

      const back = document.createElement("span");
      back.className = "memory-face memory-back";
      back.setAttribute("aria-hidden", "true");
      back.textContent = "?";

      const front = document.createElement("span");
      front.className = "memory-face memory-front";

      const img = document.createElement("img");
      img.src = resolveAsset(item.image);
      img.alt = item.word;
      img.loading = "eager";
      img.decoding = "async";
      img.draggable = false;
      img.onerror = () => {
        img.remove();
        front.textContent = item.word;
        front.classList.add("memory-front-fallback");
      };
      front.appendChild(img);

      inner.appendChild(back);
      inner.appendChild(front);
      btn.appendChild(inner);
      btn.addEventListener("click", () => flipCard(btn));
      els.board.appendChild(btn);
    });

    startTimer(cfg.timeSec);
    audioManager.playBgm("memory");
  }

  root.querySelectorAll("[data-memory-diff]").forEach((btn) => {
    btn.addEventListener("click", () => {
      audioManager.click();
      start(btn.dataset.memoryDiff);
    });
  });

  root.querySelector("[data-memory-again]")?.addEventListener("click", () => {
    audioManager.click();
    showSetup();
    audioManager.playBgm("lobby");
  });

  root.querySelectorAll("[data-memory-exit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      audioManager.click();
      stopTimer();
      playing = false;
      onExit?.();
    });
  });

  return {
    open() {
      showSetup();
      audioManager.playBgm("memory");
    },
    close() {
      stopTimer();
      playing = false;
    },
  };
}
