import { audioManager } from "../audio-manager.js";
import { getPoints } from "./config.js";
import { createMemoryGame } from "./memory.js";
import { createQuizBattle } from "./quiz-battle.js";
import { createWheelGame } from "./wheel.js";

/**
 * Wire the Game hub + three interactive games.
 * @param {{ getWords: () => any[], showScreen: (el: HTMLElement) => void, screens: Record<string, HTMLElement> }} api
 */
export function initGamesHub(api) {
  const { getWords, showScreen, screens } = api;

  const hubPoints = document.getElementById("games-hub-points");
  const audioPanel = document.getElementById("audio-settings");

  function refreshPoints() {
    if (hubPoints) hubPoints.textContent = String(getPoints());
  }

  function goHub() {
    memory.close();
    quiz.close();
    wheel.close();
    showScreen(screens.gamesHub);
    audioManager.playBgm("lobby");
    refreshPoints();
  }

  const memory = createMemoryGame({
    root: screens.memory,
    getWords,
    onExit: goHub,
  });
  const quiz = createQuizBattle({
    root: screens.quiz,
    getWords,
    onExit: goHub,
  });
  const wheel = createWheelGame({
    root: screens.wheel,
    onExit: goHub,
  });

  document.getElementById("mode-games-btn")?.addEventListener("click", async () => {
    await audioManager.unlock();
    audioManager.click();
    goHub();
  });

  document.getElementById("games-hub-back")?.addEventListener("click", () => {
    audioManager.click();
    memory.close();
    quiz.close();
    wheel.close();
    audioManager.playBgm("lobby");
    showScreen(screens.home);
  });

  document.querySelectorAll("[data-open-game]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await audioManager.unlock();
      audioManager.open();
      const id = btn.dataset.openGame;
      if (id === "memory") {
        showScreen(screens.memory);
        memory.open();
      } else if (id === "quiz") {
        showScreen(screens.quiz);
        quiz.open();
      } else if (id === "wheel") {
        showScreen(screens.wheel);
        wheel.open();
      }
    });
  });

  // Audio settings panel
  const bgmToggle = document.getElementById("audio-bgm-toggle");
  const sfxToggle = document.getElementById("audio-sfx-toggle");
  const bgmSlider = document.getElementById("audio-bgm-volume");
  const sfxSlider = document.getElementById("audio-sfx-volume");

  function syncAudioUi() {
    const s = audioManager.getSettings();
    if (bgmToggle) bgmToggle.checked = s.bgmEnabled;
    if (sfxToggle) sfxToggle.checked = s.sfxEnabled;
    if (bgmSlider) bgmSlider.value = String(Math.round(s.bgmVolume * 100));
    if (sfxSlider) sfxSlider.value = String(Math.round(s.sfxVolume * 100));
  }

  document.getElementById("audio-settings-btn")?.addEventListener("click", async () => {
    await audioManager.unlock();
    audioManager.open();
    syncAudioUi();
    if (audioPanel) audioPanel.hidden = false;
  });
  document.querySelectorAll("[data-close-audio]").forEach((el) => {
    el.addEventListener("click", () => {
      audioManager.close();
      if (audioPanel) audioPanel.hidden = true;
    });
  });
  bgmToggle?.addEventListener("change", () => {
    audioManager.setBgmEnabled(bgmToggle.checked);
    audioManager.click();
  });
  sfxToggle?.addEventListener("change", () => {
    audioManager.setSfxEnabled(sfxToggle.checked);
    if (sfxToggle.checked) audioManager.click();
  });
  bgmSlider?.addEventListener("input", () => {
    audioManager.setBgmVolume(Number(bgmSlider.value) / 100);
  });
  sfxSlider?.addEventListener("input", () => {
    audioManager.setSfxVolume(Number(sfxSlider.value) / 100);
  });

  // Global UI click SFX for main buttons (light touch)
  document.addEventListener(
    "click",
    (e) => {
      const t = e.target.closest("button");
      if (!t) return;
      if (t.closest("#memory-board") || t.closest("[data-quiz-choices]") || t.closest("[data-wheel]")) {
        return;
      }
      // Avoid double-fire for buttons that already play explicit SFX in handlers
      if (t.dataset.openGame || t.id === "mode-games-btn" || t.id === "audio-settings-btn") return;
    },
    true
  );

  syncAudioUi();
  refreshPoints();
  audioManager.init();

  return { goHub, refreshPoints };
}
