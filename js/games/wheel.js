import { audioManager } from "../audio-manager.js";
import {
  WHEEL_CONFIG,
  pickWeighted,
  getPoints,
  addPoints,
} from "./config.js";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadWheelState() {
  try {
    const raw = localStorage.getItem(WHEEL_CONFIG.storageKey);
    const data = raw ? JSON.parse(raw) : {};
    if (data.day !== todayKey()) {
      return { day: todayKey(), spinsLeft: WHEEL_CONFIG.dailySpins, badges: data.badges || [] };
    }
    return {
      day: data.day,
      spinsLeft: Number(data.spinsLeft ?? WHEEL_CONFIG.dailySpins),
      badges: data.badges || [],
    };
  } catch {
    return { day: todayKey(), spinsLeft: WHEEL_CONFIG.dailySpins, badges: [] };
  }
}

function saveWheelState(state) {
  localStorage.setItem(WHEEL_CONFIG.storageKey, JSON.stringify(state));
}

export function createWheelGame({ root, onExit }) {
  const segments = WHEEL_CONFIG.segments;
  let state = loadWheelState();
  let spinning = false;
  let rotation = 0;
  let lastTickSeg = -1;

  const els = {
    wheel: root.querySelector("[data-wheel]"),
    spins: root.querySelector("[data-wheel-spins]"),
    points: root.querySelector("[data-wheel-points]"),
    popup: root.querySelector("[data-wheel-popup]"),
    popupTitle: root.querySelector("[data-wheel-popup-title]"),
    popupBody: root.querySelector("[data-wheel-popup-body]"),
    spinBtn: root.querySelector("[data-wheel-spin]"),
    buyBtn: root.querySelector("[data-wheel-buy]"),
  };

  function refreshMeta() {
    state = loadWheelState();
    els.spins.textContent = String(state.spinsLeft);
    els.points.textContent = String(getPoints());
    els.spinBtn.disabled = spinning || state.spinsLeft <= 0;
    els.buyBtn.disabled = spinning || getPoints() < WHEEL_CONFIG.spinCostPoints;
  }

  function paintWheel() {
    const n = segments.length;
    const step = 360 / n;
    const stops = segments
      .map((seg, i) => `${seg.color} ${i * step}deg ${(i + 1) * step}deg`)
      .join(", ");
    els.wheel.style.background = `conic-gradient(from -90deg, ${stops})`;
    let labelLayer = els.wheel.querySelector(".wheel-labels");
    if (!labelLayer) {
      labelLayer = document.createElement("div");
      labelLayer.className = "wheel-labels";
      els.wheel.appendChild(labelLayer);
    }
    labelLayer.innerHTML = "";
    const radius = Math.max(90, (els.wheel.clientWidth || 280) * 0.36);
    segments.forEach((seg, i) => {
      const lab = document.createElement("span");
      lab.className = "wheel-label";
      const angle = -90 + step * (i + 0.5);
      lab.style.transform = `rotate(${angle}deg) translateY(-${radius}px) rotate(${-angle}deg)`;
      lab.textContent = seg.label;
      labelLayer.appendChild(lab);
    });
  }

  function showReward(seg) {
    els.popup.hidden = false;
    els.popupTitle.textContent = seg.points > 0 || seg.spins || seg.badge ? "Chúc mừng!" : "Tiếc quá!";
    const parts = [];
    if (seg.points) parts.push(`+${seg.points} điểm`);
    if (seg.spins) parts.push(`+${seg.spins} lượt quay`);
    if (seg.badge) parts.push(seg.badge);
    if (!parts.length) parts.push("Chúc bạn may mắn lần sau!");
    els.popupBody.textContent = parts.join(" · ");
    if (seg.points || seg.spins || seg.badge) {
      audioManager.playSfx("wheel-win", { duckMs: 1200 });
    } else {
      audioManager.playSfx("defeat", { duckMs: 800 });
    }
  }

  function applyReward(seg) {
    if (seg.points) addPoints(seg.points);
    if (seg.spins) {
      state.spinsLeft += seg.spins;
      saveWheelState(state);
    }
    if (seg.badge) {
      state.badges = [...new Set([...(state.badges || []), seg.badge])];
      saveWheelState(state);
    }
    refreshMeta();
  }

  function animateSpin(targetIndex) {
    return new Promise((resolve) => {
      spinning = true;
      refreshMeta();
      const n = segments.length;
      const step = 360 / n;
      // Pointer at top (-90deg in conic). Segment i center at -90 + step*(i+0.5)
      // Final rotation so segment center lands under pointer (top).
      const segmentCenter = step * (targetIndex + 0.5);
      const currentMod = ((rotation % 360) + 360) % 360;
      const desired = (360 - segmentCenter + 360) % 360;
      let delta = desired - currentMod;
      if (delta < 0) delta += 360;
      const extraTurns = 4 + Math.floor(Math.random() * 3);
      const targetRot = rotation + extraTurns * 360 + delta;

      const start = rotation;
      const distance = targetRot - start;
      const duration = 4200 + Math.random() * 800;
      const t0 = performance.now();
      lastTickSeg = -1;

      function easeOutCubic(t) {
        return 1 - (1 - t) ** 3;
      }

      function frame(now) {
        const t = Math.min(1, (now - t0) / duration);
        const eased = easeOutCubic(t);
        rotation = start + distance * eased;
        els.wheel.style.transform = `rotate(${rotation}deg)`;

        const mod = ((rotation % 360) + 360) % 360;
        const underPointer = Math.floor(((360 - mod) % 360) / step) % n;
        if (underPointer !== lastTickSeg) {
          lastTickSeg = underPointer;
          audioManager.playSfx("wheel-tick", { duckMs: 0 });
        }

        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          rotation = targetRot;
          els.wheel.style.transform = `rotate(${rotation}deg)`;
          spinning = false;
          resolve(targetIndex);
        }
      }
      requestAnimationFrame(frame);
    });
  }

  async function spin() {
    state = loadWheelState();
    if (spinning || state.spinsLeft <= 0) return;
    state.spinsLeft -= 1;
    saveWheelState(state);
    refreshMeta();
    audioManager.click();
    const idx = pickWeighted(segments);
    await animateSpin(idx);
    const seg = segments[idx];
    applyReward(seg);
    showReward(seg);
    refreshMeta();
  }

  function buySpin() {
    if (spinning) return;
    if (getPoints() < WHEEL_CONFIG.spinCostPoints) return;
    audioManager.click();
    addPoints(-WHEEL_CONFIG.spinCostPoints);
    state = loadWheelState();
    state.spinsLeft += 1;
    saveWheelState(state);
    refreshMeta();
  }

  els.spinBtn?.addEventListener("click", spin);
  els.buyBtn?.addEventListener("click", buySpin);
  root.querySelector("[data-wheel-popup-close]")?.addEventListener("click", () => {
    audioManager.close();
    els.popup.hidden = true;
  });
  root.querySelector("[data-wheel-exit]")?.addEventListener("click", () => {
    audioManager.click();
    onExit?.();
  });

  return {
    open() {
      paintWheel();
      refreshMeta();
      els.popup.hidden = true;
      audioManager.playBgm("wheel");
    },
    close() {
      spinning = false;
    },
  };
}
