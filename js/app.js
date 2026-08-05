const CATEGORY_META = {
  animals: { title: "Animals", subtitle: "Con vật" },
  fruits: { title: "Fruits", subtitle: "Trái cây" },
  home: { title: "Home", subtitle: "Đồ vật trong nhà" },
  vehicles: { title: "Vehicles", subtitle: "Các loại xe" },
  colors: { title: "Colors", subtitle: "Màu sắc" },
};

const VOICE_KEY = "tiny-ears-voice";
const ORDER_KEY = "tiny-ears-order";
const SCORE_FACTOR = 10;
const LEARN_REPEAT_GAP_MS = 2000;
const LEARN_NEXT_DELAY_MS = 3000;
const GAME_SFX_NAMES = ["correct", "try-again", "what-is-this", "your-turn"];

const homeScreen = document.getElementById("home");
const practiceScreen = document.getElementById("practice");
const exercisesScreen = document.getElementById("exercises");
const lessonScreen = document.getElementById("lesson");
const gameLearnScreen = document.getElementById("game-learn");
const gameQuizScreen = document.getElementById("game-quiz");
const gameResultScreen = document.getElementById("game-result");
const gamesHubScreen = document.getElementById("games-hub");
const igMemoryScreen = document.getElementById("ig-memory");
const igQuizScreen = document.getElementById("ig-quiz");
const igWheelScreen = document.getElementById("ig-wheel");
const countModal = document.getElementById("count-modal");

const categoryTitle = document.getElementById("category-title");
const progressEl = document.getElementById("progress");
const wordImage = document.getElementById("word-image");
const wordText = document.getElementById("word-text");
const wordHint = document.getElementById("word-hint");
const tapHint = document.getElementById("tap-hint");
const card = document.getElementById("card");
const player = document.getElementById("player");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const speakBtn = document.getElementById("speak-btn");
const backBtn = document.getElementById("back-btn");
const shuffleBtn = document.getElementById("shuffle-btn");

const modePracticeBtn = document.getElementById("mode-practice-btn");
const modeExerciseBtn = document.getElementById("mode-exercise-btn");
const practiceBack = document.getElementById("practice-back");
const exercisesBack = document.getElementById("exercises-back");
const level1Btn = document.getElementById("level1-btn");
const gameLearnBack = document.getElementById("game-learn-back");
const gameLearnProgress = document.getElementById("game-learn-progress");
const gameLearnHint = document.getElementById("game-learn-hint");
const gameLearnCard = document.getElementById("game-learn-card");
const gameLearnImage = document.getElementById("game-learn-image");
const gameLearnWord = document.getElementById("game-learn-word");
const gameLearnHintVi = document.getElementById("game-learn-hint-vi");
const gameLearnPrev = document.getElementById("game-learn-prev");
const gameLearnSpeak = document.getElementById("game-learn-speak");
const gameLearnNext = document.getElementById("game-learn-next");
const gameStartQuiz = document.getElementById("game-start-quiz");

const gameQuizBack = document.getElementById("game-quiz-back");
const gameQuizProgress = document.getElementById("game-quiz-progress");
const gameQuizPrompt = document.getElementById("game-quiz-prompt");
const gameQuizCard = document.getElementById("game-quiz-card");
const gameQuizImage = document.getElementById("game-quiz-image");
const gameQuizAnswer = document.getElementById("game-quiz-answer");
const gameCorrectBtn = document.getElementById("game-correct-btn");
const gameWrongBtn = document.getElementById("game-wrong-btn");
const gameQuizNext = document.getElementById("game-quiz-next");

const resultSummary = document.getElementById("result-summary");
const resultScore = document.getElementById("result-score");
const resultReplay = document.getElementById("result-replay");
const resultHome = document.getElementById("result-home");

let lessons = {};
let currentCategory = null;
let queue = [];
let index = 0;
let heard = new Set();
let currentVoice = localStorage.getItem(VOICE_KEY) || "woman";
let orderMode = localStorage.getItem(ORDER_KEY) || "normal";

let gameDeck = [];
let gameIndex = 0;
let gameCorrect = 0;
let gameCount = 10;
let quizWaitingNext = false;
let quizGraded = false;

let learnSeqToken = 0;
let quizPromptToken = 0;
let activeSfx = null;
const sfxBlobUrls = new Map();
let sfxPreloadPromise = null;

const allScreens = [
  homeScreen,
  practiceScreen,
  exercisesScreen,
  lessonScreen,
  gameLearnScreen,
  gameQuizScreen,
  gameResultScreen,
  gamesHubScreen,
  igMemoryScreen,
  igQuizScreen,
  igWheelScreen,
].filter(Boolean);

function speakerIcon() {
  return `<svg class="speaker" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm11.5 3a3.5 3.5 0 0 0-1.5-2.9v5.8A3.5 3.5 0 0 0 15.5 12zm0-7.2v2.06A6.5 6.5 0 0 1 19 12a6.5 6.5 0 0 1-3.5 5.14v2.06A8.5 8.5 0 0 0 21 12a8.5 8.5 0 0 0-5.5-7.2z"/></svg>`;
}

speakBtn.innerHTML = `${speakerIcon()} Nghe lại`;
gameLearnSpeak.innerHTML = `${speakerIcon()} Nghe lại`;

function syncOptionButtons() {
  document.querySelectorAll("[data-voice]").forEach((btn) => {
    const active = btn.dataset.voice === currentVoice;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll("[data-order]").forEach((btn) => {
    const active = btn.dataset.order === orderMode;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  shuffleBtn.classList.toggle("is-random", orderMode === "random");
  shuffleBtn.title = orderMode === "random" ? "Xáo trộn lại (đang random)" : "Xáo trộn lại";
}

async function loadLessons() {
  const res = await fetch("js/lessons.json");
  if (!res.ok) throw new Error("Không tải được dữ liệu bài học");
  lessons = await res.json();
}

function showScreen(screen) {
  allScreens.forEach((el) => {
    el.classList.remove("active");
    el.hidden = true;
  });
  screen.hidden = false;
  screen.classList.add("active");
}

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function allWords() {
  return Object.values(lessons).flat();
}

function buildQueue(category) {
  const base = [...(lessons[category] || [])];
  return orderMode === "random" ? shuffle(base) : base;
}

function audioFor(item) {
  if (!item?.audio) return "";
  if (typeof item.audio === "string") return item.audio;
  return item.audio[currentVoice] || item.audio.woman || item.audio.man || "";
}

function gameAudio(name) {
  return `assets/audio/game/${currentVoice}/${name}.mp3`;
}

function stopWordPlayer() {
  try {
    player.pause();
  } catch {
    /* ignore */
  }
}

function stopSfx() {
  if (!activeSfx) return;
  try {
    activeSfx.pause();
  } catch {
    /* ignore */
  }
  activeSfx = null;
}

function stopAllAudio() {
  stopWordPlayer();
  stopSfx();
}

function cancelLearnSequence() {
  learnSeqToken += 1;
}

function cancelQuizPrompt() {
  quizPromptToken += 1;
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function waitAudioEnd(audio, timeoutMs = 5000) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    if (!audio) {
      finish();
      return;
    }
    if (audio.ended) {
      finish();
      return;
    }
    audio.addEventListener("ended", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    window.setTimeout(finish, timeoutMs);
  });
}

function bounce(el) {
  if (!el) return;
  el.classList.remove("playing");
  void el.offsetWidth;
  el.classList.add("playing");
}

function playSrc(src, { bounceEl } = {}) {
  if (!src) return null;
  bounce(bounceEl);
  stopWordPlayer();
  player.src = src;
  player.currentTime = 0;
  const playPromise = player.play();
  if (playPromise) {
    playPromise.catch(() => {});
  }
  return player;
}

/** Instant feedback sounds via dedicated Audio + preloaded blobs. */
function playSfx(name, { bounceEl } = {}) {
  const path = gameAudio(name);
  const url = sfxBlobUrls.get(path) || path;
  bounce(bounceEl);
  stopSfx();
  const audio = new Audio(url);
  audio.preload = "auto";
  activeSfx = audio;
  const playPromise = audio.play();
  if (playPromise) {
    playPromise.catch(() => {
      // Fallback: try original path once if blob failed
      if (url !== path) {
        const retry = new Audio(path);
        activeSfx = retry;
        retry.play().catch(() => {});
      }
    });
  }
  return audio;
}

async function preloadGameSfx() {
  if (sfxPreloadPromise) return sfxPreloadPromise;
  sfxPreloadPromise = (async () => {
    const voices = ["woman", "man"];
    await Promise.all(
      voices.flatMap((voice) =>
        GAME_SFX_NAMES.map(async (name) => {
          const src = `assets/audio/game/${voice}/${name}.mp3`;
          if (sfxBlobUrls.has(src)) return;
          try {
            const res = await fetch(src);
            if (!res.ok) return;
            const blob = await res.blob();
            sfxBlobUrls.set(src, URL.createObjectURL(blob));
          } catch {
            /* keep remote path as fallback */
          }
        })
      )
    );
  })();
  return sfxPreloadPromise;
}

function openCategory(category) {
  if (!lessons[category]?.length) {
    wordHint.textContent = "Đang tải bài học, thử lại nhé!";
    return;
  }
  cancelLearnSequence();
  cancelQuizPrompt();
  stopAllAudio();
  currentCategory = category;
  queue = buildQueue(category);
  index = 0;
  heard = new Set();
  categoryTitle.textContent = CATEGORY_META[category]?.title || category;
  showScreen(lessonScreen);
  renderCard();
  playWord();
}

function currentItem() {
  return queue[index];
}

function renderCard() {
  const item = currentItem();
  if (!item) return;

  wordImage.src = item.image;
  wordImage.alt = item.word;
  wordText.textContent = item.word;
  wordHint.textContent = item.hint;
  progressEl.textContent = `${index + 1} / ${queue.length}`;
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === queue.length - 1;
  card.setAttribute("aria-label", `Phát âm: ${item.word}`);

  wordText.classList.remove("reveal");
  void wordText.offsetWidth;
  wordText.classList.add("reveal");

  tapHint.textContent = heard.has(item.id)
    ? "Chạm để nghe lại"
    : "Chạm vào hình để nghe";
}

function burstConfetti(origin) {
  const colors = ["#FF6B4A", "#FFC857", "#3ECF8E", "#42A5F5", "#AB47BC", "#FF8A65"];
  const rect = origin.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 12; i += 1) {
    const bit = document.createElement("span");
    bit.className = "confetti";
    bit.style.left = `${cx + (Math.random() - 0.5) * 80}px`;
    bit.style.top = `${cy + (Math.random() - 0.5) * 40}px`;
    bit.style.background = colors[i % colors.length];
    bit.style.width = `${8 + Math.random() * 8}px`;
    bit.style.height = `${8 + Math.random() * 8}px`;
    document.body.appendChild(bit);
    window.setTimeout(() => bit.remove(), 950);
  }
}

function playWord() {
  const item = currentItem();
  if (!item) return;

  playSrc(audioFor(item), { bounceEl: card });

  if (!heard.has(item.id)) {
    heard.add(item.id);
    burstConfetti(card);
    tapHint.textContent = "Chạm để nghe lại";
  }
}

function go(delta) {
  const next = index + delta;
  if (next < 0 || next >= queue.length) return;
  index = next;
  renderCard();
}

function setVoice(voice) {
  if (voice !== "man" && voice !== "woman") return;
  currentVoice = voice;
  localStorage.setItem(VOICE_KEY, voice);
  syncOptionButtons();
  if (lessonScreen.classList.contains("active") && currentItem()) {
    playWord();
  }
}

function setOrderMode(mode) {
  if (mode !== "normal" && mode !== "random") return;
  orderMode = mode;
  localStorage.setItem(ORDER_KEY, mode);
  syncOptionButtons();
}

function openCountModal() {
  countModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeCountModal() {
  countModal.hidden = true;
  document.body.classList.remove("modal-open");
}

async function startLevel1(count) {
  const pool = allWords();
  if (pool.length < count) {
    alert(`Chưa đủ từ trong kho (hiện có ${pool.length}).`);
    return;
  }
  await preloadGameSfx();
  gameCount = count;
  gameDeck = shuffle(pool).slice(0, count);
  gameIndex = 0;
  gameCorrect = 0;
  quizWaitingNext = false;
  quizGraded = false;
  closeCountModal();
  showScreen(gameLearnScreen);
  renderGameLearn();
  runLearnAutoPlay();
}

function currentGameItem() {
  return gameDeck[gameIndex];
}

function renderGameLearn() {
  const item = currentGameItem();
  if (!item) return;
  gameLearnImage.src = item.image;
  gameLearnImage.alt = item.word;
  gameLearnWord.textContent = item.word;
  gameLearnHintVi.textContent = item.hint;
  gameLearnProgress.textContent = `${gameIndex + 1} / ${gameDeck.length}`;
  gameLearnPrev.disabled = gameIndex === 0;
  const isLast = gameIndex === gameDeck.length - 1;
  gameLearnNext.textContent = isLast ? "Xong ›" : "Sau ›";
  gameStartQuiz.hidden = !isLast;
  gameLearnHint.textContent = "Đang nghe từ… (đọc 2 lần)";
  gameLearnWord.classList.remove("reveal");
  void gameLearnWord.offsetWidth;
  gameLearnWord.classList.add("reveal");
}

function playGameLearnWordOnce() {
  const item = currentGameItem();
  if (!item) return null;
  return playSrc(audioFor(item), { bounceEl: gameLearnCard });
}

function playGameLearnWordManual() {
  cancelLearnSequence();
  gameLearnHint.textContent = "Chạm vào hình để nghe lại";
  playGameLearnWordOnce();
}

async function runLearnAutoPlay() {
  const token = ++learnSeqToken;
  const item = currentGameItem();
  if (!item) return;

  gameLearnHint.textContent = "Đang nghe từ… (lần 1/2)";
  const first = playGameLearnWordOnce();
  await waitAudioEnd(first);
  if (token !== learnSeqToken) return;

  await wait(LEARN_REPEAT_GAP_MS);
  if (token !== learnSeqToken) return;

  gameLearnHint.textContent = "Đang nghe từ… (lần 2/2)";
  const second = playGameLearnWordOnce();
  await waitAudioEnd(second);
  if (token !== learnSeqToken) return;

  gameLearnHint.textContent = "Chờ chút rồi sang từ tiếp theo…";
  await wait(LEARN_NEXT_DELAY_MS);
  if (token !== learnSeqToken) return;

  if (gameIndex >= gameDeck.length - 1) {
    gameLearnHint.textContent = "Xong! Bắt đầu hỏi đáp nhé";
    gameStartQuiz.hidden = false;
    return;
  }

  gameIndex += 1;
  renderGameLearn();
  runLearnAutoPlay();
}

function goGameLearn(delta) {
  const next = gameIndex + delta;
  if (next < 0 || next >= gameDeck.length) return;
  gameIndex = next;
  renderGameLearn();
  runLearnAutoPlay();
}

async function startQuiz() {
  cancelLearnSequence();
  stopAllAudio();
  await preloadGameSfx();
  gameIndex = 0;
  gameCorrect = 0;
  quizWaitingNext = false;
  quizGraded = false;
  showScreen(gameQuizScreen);
  renderGameQuiz();
  runQuizPrompt();
}

function renderGameQuiz() {
  const item = currentGameItem();
  if (!item) return;
  gameQuizImage.src = item.image;
  gameQuizImage.alt = "What is this?";
  gameQuizProgress.textContent = `${gameIndex + 1} / ${gameDeck.length}`;
  gameQuizAnswer.textContent = `Đáp án (phụ huynh): ${item.word}`;
  gameQuizPrompt.textContent = "Your turn!";
  gameQuizNext.hidden = true;
  quizWaitingNext = false;
  quizGraded = false;
  gameCorrectBtn.disabled = false;
  gameWrongBtn.disabled = false;
  gameCorrectBtn.classList.remove("is-used");
  gameWrongBtn.classList.remove("is-used");
}

async function runQuizPrompt() {
  const token = ++quizPromptToken;
  gameQuizPrompt.textContent = "Your turn!";
  const turnAudio = playSfx("your-turn", { bounceEl: gameQuizCard });
  await waitAudioEnd(turnAudio);
  if (token !== quizPromptToken) return;

  await wait(350);
  if (token !== quizPromptToken) return;

  gameQuizPrompt.textContent = "What is this?";
  playSfx("what-is-this", { bounceEl: gameQuizCard });
}

function playWhatIsThis() {
  cancelQuizPrompt();
  gameQuizPrompt.textContent = "What is this?";
  playSfx("what-is-this", { bounceEl: gameQuizCard });
}

function finishGame() {
  cancelQuizPrompt();
  stopAllAudio();
  const score = gameCorrect * SCORE_FACTOR;
  resultSummary.textContent = `Đúng ${gameCorrect} / ${gameDeck.length}`;
  resultScore.textContent = `${score} điểm`;
  showScreen(gameResultScreen);
  burstConfetti(resultScore);
}

function advanceQuiz() {
  if (gameIndex >= gameDeck.length - 1) {
    finishGame();
    return;
  }
  gameIndex += 1;
  renderGameQuiz();
  runQuizPrompt();
}

function markCorrect() {
  if (quizGraded) return;
  quizGraded = true;
  gameCorrect += 1;
  gameCorrectBtn.classList.add("is-used");
  gameWrongBtn.disabled = true;
  gameCorrectBtn.disabled = true;
  gameQuizNext.hidden = true;
  // Play feedback immediately on a separate channel (does not wait for word player).
  playSfx("correct", { bounceEl: gameQuizCard });
  burstConfetti(gameQuizCard);
  window.setTimeout(() => advanceQuiz(), 900);
}

function markWrong() {
  if (quizGraded && !quizWaitingNext) return;
  if (!quizGraded) {
    quizGraded = true;
    quizWaitingNext = true;
    gameWrongBtn.classList.add("is-used");
    gameCorrectBtn.disabled = true;
    gameQuizNext.hidden = false;
  }
  playSfx("try-again", { bounceEl: gameQuizCard });
  gameQuizPrompt.textContent = "Please try again";
}

document.querySelectorAll(".cat-btn").forEach((btn) => {
  btn.addEventListener("click", () => openCategory(btn.dataset.category));
});

document.querySelectorAll("[data-voice]").forEach((btn) => {
  btn.addEventListener("click", () => setVoice(btn.dataset.voice));
});

document.querySelectorAll("[data-order]").forEach((btn) => {
  btn.addEventListener("click", () => setOrderMode(btn.dataset.order));
});

card.addEventListener("click", playWord);
speakBtn.addEventListener("click", playWord);
prevBtn.addEventListener("click", () => go(-1));
nextBtn.addEventListener("click", () => go(1));
backBtn.addEventListener("click", () => {
  stopAllAudio();
  showScreen(practiceScreen);
});
shuffleBtn.addEventListener("click", () => {
  if (!currentCategory) return;
  queue = shuffle(queue);
  index = 0;
  heard = new Set();
  renderCard();
  playWord();
});

modePracticeBtn.addEventListener("click", () => showScreen(practiceScreen));
modeExerciseBtn.addEventListener("click", () => showScreen(exercisesScreen));
practiceBack.addEventListener("click", () => showScreen(homeScreen));
exercisesBack.addEventListener("click", () => showScreen(homeScreen));

level1Btn.addEventListener("click", () => {
  preloadGameSfx();
  openCountModal();
});
countModal.querySelectorAll("[data-close-modal]").forEach((el) => {
  el.addEventListener("click", closeCountModal);
});
countModal.querySelectorAll("[data-count]").forEach((btn) => {
  btn.addEventListener("click", () => startLevel1(Number(btn.dataset.count)));
});

gameLearnBack.addEventListener("click", () => {
  cancelLearnSequence();
  stopAllAudio();
  showScreen(exercisesScreen);
});
gameLearnCard.addEventListener("click", playGameLearnWordManual);
gameLearnSpeak.addEventListener("click", playGameLearnWordManual);
gameLearnPrev.addEventListener("click", () => goGameLearn(-1));
gameLearnNext.addEventListener("click", () => {
  if (gameIndex >= gameDeck.length - 1) {
    startQuiz();
    return;
  }
  goGameLearn(1);
});
gameStartQuiz.addEventListener("click", startQuiz);

gameQuizBack.addEventListener("click", () => {
  cancelQuizPrompt();
  stopAllAudio();
  showScreen(exercisesScreen);
});
gameQuizCard.addEventListener("click", () => {
  playWhatIsThis();
});
gameCorrectBtn.addEventListener("click", markCorrect);
gameWrongBtn.addEventListener("click", markWrong);
gameQuizNext.addEventListener("click", advanceQuiz);

resultReplay.addEventListener("click", openCountModal);
resultHome.addEventListener("click", () => {
  stopAllAudio();
  showScreen(homeScreen);
});

document.addEventListener("keydown", (event) => {
  if (!countModal.hidden && event.key === "Escape") {
    closeCountModal();
    return;
  }
  if (lessonScreen.classList.contains("active")) {
    if (event.key === "ArrowRight") go(1);
    if (event.key === "ArrowLeft") go(-1);
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      playWord();
    }
    if (event.key === "Escape") {
      stopAllAudio();
      showScreen(homeScreen);
    }
  }
});

syncOptionButtons();
preloadGameSfx();

loadLessons()
  .then(async () => {
    const { initGamesHub } = await import("./games/hub.js");
    const { audioManager } = await import("./audio-manager.js");
    initGamesHub({
      getWords: allWords,
      showScreen,
      screens: {
        home: homeScreen,
        gamesHub: gamesHubScreen,
        memory: igMemoryScreen,
        quiz: igQuizScreen,
        wheel: igWheelScreen,
      },
    });
    // Soft lobby BGM after first user gesture anywhere
    const unlockOnce = async () => {
      await audioManager.unlock();
      if (homeScreen.classList.contains("active")) {
        audioManager.playBgm("lobby");
      }
      document.removeEventListener("pointerdown", unlockOnce);
    };
    document.addEventListener("pointerdown", unlockOnce, { once: true });
  })
  .catch((err) => {
    wordText.textContent = "Oops!";
    wordHint.textContent = err.message;
    console.error(err);
  });
