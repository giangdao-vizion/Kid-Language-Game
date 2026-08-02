const CATEGORY_META = {
  animals: { title: "Animals", subtitle: "Con vật" },
  fruits: { title: "Fruits", subtitle: "Trái cây" },
  home: { title: "Home", subtitle: "Đồ vật trong nhà" },
  vehicles: { title: "Vehicles", subtitle: "Các loại xe" },
  colors: { title: "Colors", subtitle: "Màu sắc" },
};

const homeScreen = document.getElementById("home");
const lessonScreen = document.getElementById("lesson");
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

let lessons = {};
let currentCategory = null;
let queue = [];
let index = 0;
let heard = new Set();

function speakerIcon() {
  return `<svg class="speaker" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm11.5 3a3.5 3.5 0 0 0-1.5-2.9v5.8A3.5 3.5 0 0 0 15.5 12zm0-7.2v2.06A6.5 6.5 0 0 1 19 12a6.5 6.5 0 0 1-3.5 5.14v2.06A8.5 8.5 0 0 0 21 12a8.5 8.5 0 0 0-5.5-7.2z"/></svg>`;
}

speakBtn.innerHTML = `${speakerIcon()} Nghe lại`;

async function loadLessons() {
  const res = await fetch("js/lessons.json");
  if (!res.ok) throw new Error("Không tải được dữ liệu bài học");
  lessons = await res.json();
}

function showScreen(screen) {
  [homeScreen, lessonScreen].forEach((el) => {
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

function openCategory(category) {
  if (!lessons[category]?.length) {
    wordHint.textContent = "Đang tải bài học, thử lại nhé!";
    return;
  }
  currentCategory = category;
  queue = [...lessons[category]];
  index = 0;
  heard = new Set();
  categoryTitle.textContent = CATEGORY_META[category]?.title || category;
  showScreen(lessonScreen);
  renderCard();
  // Play in the same user-gesture turn so browsers allow audio.
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

  card.classList.remove("playing");
  void card.offsetWidth;
  card.classList.add("playing");

  player.pause();
  player.src = item.audio;
  player.currentTime = 0;
  const playPromise = player.play();
  if (playPromise) {
    playPromise.catch(() => {
      // Autoplay may be blocked until a gesture; ignore quietly.
    });
  }

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

document.querySelectorAll(".cat-btn").forEach((btn) => {
  btn.addEventListener("click", () => openCategory(btn.dataset.category));
});

card.addEventListener("click", playWord);
speakBtn.addEventListener("click", playWord);
prevBtn.addEventListener("click", () => go(-1));
nextBtn.addEventListener("click", () => go(1));
backBtn.addEventListener("click", () => {
  player.pause();
  showScreen(homeScreen);
});
shuffleBtn.addEventListener("click", () => {
  if (!currentCategory) return;
  const currentId = currentItem()?.id;
  queue = shuffle(queue);
  index = Math.max(0, queue.findIndex((item) => item.id === currentId));
  renderCard();
});

document.addEventListener("keydown", (event) => {
  if (!lessonScreen.classList.contains("active")) return;
  if (event.key === "ArrowRight") go(1);
  if (event.key === "ArrowLeft") go(-1);
  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    playWord();
  }
  if (event.key === "Escape") {
    player.pause();
    showScreen(homeScreen);
  }
});

loadLessons().catch((err) => {
  wordText.textContent = "Oops!";
  wordHint.textContent = err.message;
  console.error(err);
});
