/**
 * Tiny Ears Audio Manager
 * - BGM with seamless loop + ducking
 * - Preloaded SFX pool for low latency
 * - Independent BGM/SFX volume + mute
 * - Pause on tab blur / resume on focus
 * - Persist settings in localStorage
 */

const STORAGE_KEY = "tiny-ears-audio";

const DEFAULTS = {
  bgmEnabled: true,
  sfxEnabled: true,
  bgmVolume: 0.35,
  sfxVolume: 0.7,
};

const BGM = {
  lobby: "assets/audio/bgm/lobby.mp3",
  memory: "assets/audio/bgm/memory.mp3",
  quiz: "assets/audio/bgm/quiz.mp3",
  wheel: "assets/audio/bgm/wheel.mp3",
};

const SFX = {
  "ui-click": "assets/audio/sfx/ui-click.mp3",
  "ui-hover": "assets/audio/sfx/ui-hover.mp3",
  "ui-open": "assets/audio/sfx/ui-open.mp3",
  "ui-close": "assets/audio/sfx/ui-close.mp3",
  "card-flip": "assets/audio/sfx/card-flip.mp3",
  "match-ok": "assets/audio/sfx/match-ok.mp3",
  "match-bad": "assets/audio/sfx/match-bad.mp3",
  countdown: "assets/audio/sfx/countdown.mp3",
  "answer-select": "assets/audio/sfx/answer-select.mp3",
  "answer-correct": "assets/audio/sfx/answer-correct.mp3",
  "answer-wrong": "assets/audio/sfx/answer-wrong.mp3",
  "wheel-tick": "assets/audio/sfx/wheel-tick.mp3",
  "wheel-win": "assets/audio/sfx/wheel-win.mp3",
  victory: "assets/audio/sfx/victory.mp3",
  defeat: "assets/audio/sfx/defeat.mp3",
};

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

class AudioManager {
  constructor() {
    this.settings = loadSettings();
    this.unlocked = false;
    this.bgmEl = new Audio();
    this.bgmEl.loop = true;
    this.bgmEl.preload = "auto";
    this.currentBgmKey = null;
    this.sfxBuffers = new Map(); // key -> blob URL
    this.duckUntil = 0;
    this._duckTimer = null;
    this._visibilityBound = this._onVisibility.bind(this);
    this._applyBgmVolume();
    document.addEventListener("visibilitychange", this._visibilityBound);
  }

  async init() {
    await this.preloadSfx();
    return this;
  }

  async unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    // Warm a silent play to satisfy autoplay policies after user gesture.
    try {
      const warm = new Audio(SFX["ui-click"]);
      warm.volume = 0.001;
      await warm.play();
      warm.pause();
    } catch {
      /* ignore */
    }
    if (this.settings.bgmEnabled && this.currentBgmKey) {
      this.playBgm(this.currentBgmKey, { force: true });
    }
  }

  async preloadSfx() {
    const entries = Object.entries(SFX);
    await Promise.all(
      entries.map(async ([key, src]) => {
        if (this.sfxBuffers.has(key)) return;
        try {
          const res = await fetch(src);
          if (!res.ok) return;
          const blob = await res.blob();
          this.sfxBuffers.set(key, URL.createObjectURL(blob));
        } catch {
          /* keep remote path fallback */
        }
      })
    );
  }

  getSettings() {
    return { ...this.settings };
  }

  setBgmEnabled(on) {
    this.settings.bgmEnabled = Boolean(on);
    saveSettings(this.settings);
    if (!this.settings.bgmEnabled) {
      this.bgmEl.pause();
    } else if (this.currentBgmKey) {
      this.playBgm(this.currentBgmKey, { force: true });
    }
  }

  setSfxEnabled(on) {
    this.settings.sfxEnabled = Boolean(on);
    saveSettings(this.settings);
  }

  setBgmVolume(v) {
    this.settings.bgmVolume = clamp(Number(v) || 0, 0, 1);
    saveSettings(this.settings);
    this._applyBgmVolume();
  }

  setSfxVolume(v) {
    this.settings.sfxVolume = clamp(Number(v) || 0, 0, 1);
    saveSettings(this.settings);
  }

  _applyBgmVolume() {
    const ducked = Date.now() < this.duckUntil;
    const base = this.settings.bgmEnabled ? this.settings.bgmVolume : 0;
    this.bgmEl.volume = ducked ? base * 0.22 : base;
  }

  duck(ms = 700) {
    this.duckUntil = Math.max(this.duckUntil, Date.now() + ms);
    this._applyBgmVolume();
    clearTimeout(this._duckTimer);
    this._duckTimer = setTimeout(() => this._applyBgmVolume(), ms + 30);
  }

  playBgm(key, { force = false } = {}) {
    const src = BGM[key];
    if (!src) return;
    this.currentBgmKey = key;
    if (!this.settings.bgmEnabled || !this.unlocked) return;
    if (!force && this.bgmEl.src.includes(src.split("/").pop()) && !this.bgmEl.paused) {
      return;
    }
    const wasSame = this.bgmEl.dataset.key === key;
    if (!wasSame) {
      this.bgmEl.src = src;
      this.bgmEl.dataset.key = key;
    }
    this._applyBgmVolume();
    const p = this.bgmEl.play();
    if (p) p.catch(() => {});
  }

  stopBgm() {
    this.bgmEl.pause();
    this.bgmEl.currentTime = 0;
    this.currentBgmKey = null;
    this.bgmEl.dataset.key = "";
  }

  pauseAll() {
    this.bgmEl.pause();
  }

  resumeAll() {
    if (!this.settings.bgmEnabled || !this.unlocked || !this.currentBgmKey) return;
    const p = this.bgmEl.play();
    if (p) p.catch(() => {});
  }

  playSfx(key, { duckMs = 450 } = {}) {
    if (!this.settings.sfxEnabled) return null;
    const url = this.sfxBuffers.get(key) || SFX[key];
    if (!url) return null;
    if (duckMs > 0) this.duck(duckMs);
    const audio = new Audio(url);
    audio.volume = this.settings.sfxVolume;
    const p = audio.play();
    if (p) p.catch(() => {});
    return audio;
  }

  click() {
    return this.playSfx("ui-click", { duckMs: 200 });
  }

  open() {
    return this.playSfx("ui-open", { duckMs: 250 });
  }

  close() {
    return this.playSfx("ui-close", { duckMs: 200 });
  }

  victory() {
    return this.playSfx("victory", { duckMs: 1400 });
  }

  defeat() {
    return this.playSfx("defeat", { duckMs: 1000 });
  }

  _onVisibility() {
    if (document.hidden) {
      this.pauseAll();
    } else {
      this.resumeAll();
    }
  }
}

export const audioManager = new AudioManager();
export { BGM, SFX };
