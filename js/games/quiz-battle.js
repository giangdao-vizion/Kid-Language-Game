import { audioManager } from "../audio-manager.js";
import { QUIZ_CONFIG, quizMultiplier, addPoints } from "./config.js";

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickDistractors(all, answer, n) {
  const others = shuffle(all.filter((w) => w.id !== answer.id));
  return others.slice(0, n);
}

export function createQuizBattle({ root, getWords, onExit }) {
  let questions = [];
  let index = 0;
  let score = 0;
  let streak = 0;
  let correctCount = 0;
  let answered = false;
  let timeLeft = 0;
  let timerId = null;
  let questionStartedAt = 0;
  let durations = [];
  let lifelines = { ...QUIZ_CONFIG.lifelines };
  let mode = "mcq"; // mcq | tf
  let playing = false;

  const els = {
    setup: root.querySelector("[data-quiz-setup]"),
    play: root.querySelector("[data-quiz-play]"),
    result: root.querySelector("[data-quiz-result]"),
    progress: root.querySelector("[data-quiz-progress]"),
    prompt: root.querySelector("[data-quiz-prompt]"),
    image: root.querySelector("[data-quiz-image]"),
    choices: root.querySelector("[data-quiz-choices]"),
    timerFill: root.querySelector("[data-quiz-timer-fill]"),
    timerText: root.querySelector("[data-quiz-timer-text]"),
    streak: root.querySelector("[data-quiz-streak]"),
    score: root.querySelector("[data-quiz-score]"),
    resultBody: root.querySelector("[data-quiz-result-body]"),
    ffBtn: root.querySelector("[data-quiz-ff]"),
    timeBtn: root.querySelector("[data-quiz-time]"),
    skipBtn: root.querySelector("[data-quiz-skip]"),
  };

  function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  function updateLifelineButtons() {
    els.ffBtn.disabled = lifelines.fiftyFifty <= 0 || answered || mode === "tf";
    els.timeBtn.disabled = lifelines.extraTime <= 0 || answered;
    els.skipBtn.disabled = lifelines.skip <= 0 || answered;
    els.ffBtn.textContent = `50/50 (${lifelines.fiftyFifty})`;
    els.timeBtn.textContent = `+${QUIZ_CONFIG.extraTimeSec}s (${lifelines.extraTime})`;
    els.skipBtn.textContent = `Đổi câu (${lifelines.skip})`;
  }

  function setTimerVisual() {
    const ratio = clamp(timeLeft / Math.max(QUIZ_CONFIG.timePerQuestion, 1), 0, 1);
    els.timerFill.style.transform = `scaleX(${Math.min(1, timeLeft / QUIZ_CONFIG.timePerQuestion)})`;
    els.timerText.textContent = `${Math.ceil(timeLeft)}s`;
    els.timerFill.classList.remove("is-warn", "is-danger");
    if (ratio <= 0.25) els.timerFill.classList.add("is-danger");
    else if (ratio <= 0.5) els.timerFill.classList.add("is-warn");
  }

  function clamp(n, a, b) {
    return Math.min(b, Math.max(a, n));
  }

  function buildQuestions(count) {
    const pool = shuffle(getWords());
    const picked = pool.slice(0, count);
    return picked.map((word, i) => {
      const useTf = i % 3 === 2;
      if (useTf) {
        const truth = Math.random() > 0.4;
        const shown = truth ? word : pickDistractors(pool, word, 1)[0] || word;
        return {
          type: "tf",
          word,
          prompt: `Is this a "${shown.word}"?`,
          image: word.image,
          answer: truth ? "true" : "false",
          options: [
            { id: "true", label: "True · Đúng" },
            { id: "false", label: "False · Sai" },
          ],
        };
      }
      const distractors = pickDistractors(pool, word, 3);
      const options = shuffle([
        { id: word.id, label: word.word, correct: true },
        ...distractors.map((d) => ({ id: d.id, label: d.word, correct: false })),
      ]);
      return {
        type: "mcq",
        word,
        prompt: "What is this?",
        image: word.image,
        answer: word.id,
        options,
      };
    });
  }

  function showSetup() {
    playing = false;
    stopTimer();
    els.setup.hidden = false;
    els.play.hidden = true;
    els.result.hidden = true;
  }

  function finish() {
    playing = false;
    stopTimer();
    const accuracy = questions.length ? correctCount / questions.length : 0;
    const avg =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;
    addPoints(score);
    els.play.hidden = true;
    els.result.hidden = false;
    els.resultBody.innerHTML = `
      <p class="quiz-stat"><span>Điểm</span><strong>${score}</strong></p>
      <p class="quiz-stat"><span>Đúng</span><strong>${correctCount}/${questions.length}</strong></p>
      <p class="quiz-stat"><span>Độ chính xác</span><strong>${Math.round(accuracy * 100)}%</strong></p>
      <p class="quiz-stat"><span>TB / câu</span><strong>${avg.toFixed(1)}s</strong></p>
    `;
    if (accuracy >= QUIZ_CONFIG.excellentAccuracy) {
      burstConfetti(root);
      audioManager.victory();
    } else {
      audioManager.defeat();
    }
  }

  function burstConfetti(origin) {
    const colors = ["#FF6B4A", "#FFC857", "#3ECF8E", "#42A5F5", "#AB47BC"];
    const rect = origin.getBoundingClientRect();
    for (let i = 0; i < 18; i += 1) {
      const bit = document.createElement("span");
      bit.className = "confetti";
      bit.style.left = `${rect.left + Math.random() * rect.width}px`;
      bit.style.top = `${rect.top + 40 + Math.random() * 60}px`;
      bit.style.background = colors[i % colors.length];
      document.body.appendChild(bit);
      window.setTimeout(() => bit.remove(), 1000);
    }
  }

  function renderQuestion() {
    if (index >= questions.length) {
      finish();
      return;
    }
    const q = questions[index];
    mode = q.type;
    answered = false;
    timeLeft = QUIZ_CONFIG.timePerQuestion;
    questionStartedAt = performance.now();
    els.progress.textContent = `${index + 1} / ${questions.length}`;
    els.prompt.textContent = q.prompt;
    els.image.src = q.image;
    els.image.alt = q.word.word;
    els.streak.textContent = streak > 1 ? `Combo ×${quizMultiplier(streak)}` : "Combo ×1";
    els.score.textContent = String(score);
    els.choices.innerHTML = "";
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-choice";
      btn.dataset.id = opt.id;
      btn.textContent = opt.label;
      btn.addEventListener("click", () => selectAnswer(opt.id));
      els.choices.appendChild(btn);
    });
    updateLifelineButtons();
    setTimerVisual();
    stopTimer();
    // countdown blips for last 3 seconds handled in tick
    timerId = setInterval(tick, 250);
    audioManager.playSfx("countdown", { duckMs: 80 });
  }

  let lastSecond = -1;
  function tick() {
    if (!playing || answered) return;
    timeLeft -= 0.25;
    setTimerVisual();
    const sec = Math.ceil(timeLeft);
    if (sec <= 3 && sec > 0 && sec !== lastSecond) {
      lastSecond = sec;
      audioManager.playSfx("countdown", { duckMs: 60 });
    }
    if (timeLeft <= 0) {
      timeLeft = 0;
      setTimerVisual();
      resolveAnswer(null);
    }
  }

  function resolveAnswer(choiceId) {
    if (answered) return;
    answered = true;
    stopTimer();
    const q = questions[index];
    const elapsed = (performance.now() - questionStartedAt) / 1000;
    durations.push(Math.min(elapsed, QUIZ_CONFIG.timePerQuestion + QUIZ_CONFIG.extraTimeSec));
    const correct = choiceId != null && String(choiceId) === String(q.answer);
    [...els.choices.children].forEach((btn) => {
      btn.disabled = true;
      if (btn.dataset.id === q.answer) btn.classList.add("is-correct");
      if (choiceId != null && btn.dataset.id === choiceId && !correct) btn.classList.add("is-wrong");
    });
    if (correct) {
      streak += 1;
      const mult = quizMultiplier(streak);
      score += QUIZ_CONFIG.basePoints * mult;
      correctCount += 1;
      audioManager.playSfx("answer-correct");
    } else {
      streak = 0;
      audioManager.playSfx("answer-wrong");
    }
    els.streak.textContent = streak > 1 ? `Combo ×${quizMultiplier(streak)}` : "Combo ×1";
    els.score.textContent = String(score);
    updateLifelineButtons();
    window.setTimeout(() => {
      index += 1;
      lastSecond = -1;
      renderQuestion();
    }, 900);
  }

  function selectAnswer(id) {
    if (!playing || answered) return;
    audioManager.playSfx("answer-select", { duckMs: 100 });
    resolveAnswer(id);
  }

  function start() {
    const words = getWords();
    if (words.length < 4) {
      alert("Cần ít nhất 4 từ để chơi Quiz Battle.");
      return;
    }
    questions = buildQuestions(Math.min(QUIZ_CONFIG.questionCount, words.length));
    index = 0;
    score = 0;
    streak = 0;
    correctCount = 0;
    durations = [];
    lifelines = { ...QUIZ_CONFIG.lifelines };
    playing = true;
    els.setup.hidden = true;
    els.result.hidden = true;
    els.play.hidden = false;
    audioManager.playBgm("quiz");
    renderQuestion();
  }

  els.ffBtn?.addEventListener("click", () => {
    if (lifelines.fiftyFifty <= 0 || answered || mode === "tf") return;
    audioManager.click();
    lifelines.fiftyFifty -= 1;
    const q = questions[index];
    const wrongBtns = [...els.choices.children].filter((b) => b.dataset.id !== q.answer);
    shuffle(wrongBtns)
      .slice(0, 2)
      .forEach((b) => {
        b.disabled = true;
        b.classList.add("is-dimmed");
      });
    updateLifelineButtons();
  });

  els.timeBtn?.addEventListener("click", () => {
    if (lifelines.extraTime <= 0 || answered) return;
    audioManager.click();
    lifelines.extraTime -= 1;
    timeLeft += QUIZ_CONFIG.extraTimeSec;
    setTimerVisual();
    updateLifelineButtons();
  });

  els.skipBtn?.addEventListener("click", () => {
    if (lifelines.skip <= 0 || answered) return;
    audioManager.click();
    lifelines.skip -= 1;
    stopTimer();
    // replace current with a fresh unused question if possible
    const usedIds = new Set(questions.map((q) => q.word.id));
    const pool = shuffle(getWords().filter((w) => !usedIds.has(w.id)));
    if (pool.length) {
      const word = pool[0];
      const distractors = pickDistractors(getWords(), word, 3);
      questions[index] = {
        type: "mcq",
        word,
        prompt: "What is this?",
        image: word.image,
        answer: word.id,
        options: shuffle([
          { id: word.id, label: word.word },
          ...distractors.map((d) => ({ id: d.id, label: d.word })),
        ]),
      };
    }
    updateLifelineButtons();
    renderQuestion();
  });

  root.querySelector("[data-quiz-start]")?.addEventListener("click", () => {
    audioManager.click();
    start();
  });
  root.querySelector("[data-quiz-again]")?.addEventListener("click", () => {
    audioManager.click();
    showSetup();
    audioManager.playBgm("lobby");
  });
  root.querySelectorAll("[data-quiz-exit]").forEach((btn) => {
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
      audioManager.playBgm("quiz");
    },
    close() {
      stopTimer();
      playing = false;
    },
  };
}
