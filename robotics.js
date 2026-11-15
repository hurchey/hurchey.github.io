(() => {
  const canvas = document.getElementById("roboticsCanvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const gainInput = document.getElementById("robotGain");
  const noiseInput = document.getElementById("robotNoise");
  const pauseButton = document.getElementById("robotPause");
  const resetButton = document.getElementById("robotReset");
  const confidenceReadout = document.getElementById("robotConfidence");
  const azimuthReadout = document.getElementById("robotAzimuth");
  const elevationReadout = document.getElementById("robotElevation");
  const gainValue = document.getElementById("robotGainValue");
  const noiseValue = document.getElementById("robotNoiseValue");
  const status = document.getElementById("robotStatus");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const state = {
    width: 0,
    height: 0,
    target: { x: 0.72, y: 0.34 },
    tracker: { x: 0.5, y: 0.5 },
    observed: { x: 0.72, y: 0.34 },
    path: [],
    gain: Number(gainInput.value),
    noise: Number(noiseInput.value),
    paused: false,
    lastTime: 0,
    elapsed: 0,
    frame: 0
  };

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.max(1, bounds.width);
    state.height = Math.max(1, bounds.height);
    canvas.width = Math.round(state.width * ratio);
    canvas.height = Math.round(state.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function reset() {
    state.target = { x: 0.72, y: 0.34 };
    state.tracker = { x: 0.5, y: 0.5 };
    state.observed = { ...state.target };
    state.path = [];
    state.elapsed = 0;
    state.paused = false;
    pauseButton.textContent = "PAUSE TRACKING";
    pauseButton.setAttribute("aria-pressed", "false");
    status.textContent = "TARGET ACQUIRED · TRACKING ACTIVE";
    updateReadouts();
    draw();
  }

  function updateReadouts() {
    const dx = (state.observed.x - state.tracker.x) * 2;
    const dy = (state.observed.y - state.tracker.y) * 2;
    const azimuth = Math.atan(dx) * 180 / Math.PI;
    const elevation = Math.atan(-dy) * 180 / Math.PI;
    const error = Math.hypot(dx, dy);
    const confidence = Math.max(55, Math.round(99 - state.noise * 2.2 - error * 5));
    confidenceReadout.textContent = `${confidence}%`;
    azimuthReadout.textContent = `${azimuth >= 0 ? "+" : ""}${azimuth.toFixed(1)}°`;
    elevationReadout.textContent = `${elevation >= 0 ? "+" : ""}${elevation.toFixed(1)}°`;
    gainValue.textContent = state.gain.toFixed(2);
    noiseValue.textContent = state.noise < 4 ? "LOW" : state.noise < 8 ? "MED" : "HIGH";
  }

  function draw() {
    const width = state.width;
    const height = state.height;
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);

    context.strokeStyle = "rgba(0,255,0,0.09)";
    context.lineWidth = 1;
    for (let x = 0; x <= width; x += 32) {
      context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke();
    }
    for (let y = 0; y <= height; y += 32) {
      context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
    }

    const point = (position) => ({ x: position.x * width, y: position.y * height });
    const target = point(state.target);
    const observed = point(state.observed);
    const tracker = point(state.tracker);

    if (state.path.length > 1) {
      context.beginPath();
      state.path.forEach((position, index) => {
        const p = point(position);
        if (index === 0) context.moveTo(p.x, p.y); else context.lineTo(p.x, p.y);
      });
      context.strokeStyle = "rgba(0,255,255,0.55)";
      context.lineWidth = 2;
      context.stroke();
    }

    context.setLineDash([5, 5]);
    context.strokeStyle = "rgba(0,255,0,0.35)";
    context.beginPath(); context.moveTo(tracker.x, tracker.y); context.lineTo(observed.x, observed.y); context.stroke();
    context.setLineDash([]);

    context.strokeStyle = "rgba(255,255,0,0.35)";
    context.beginPath(); context.arc(target.x, target.y, 18, 0, Math.PI * 2); context.stroke();
    context.strokeStyle = "#ffff00";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(target.x - 8, target.y); context.lineTo(target.x + 8, target.y);
    context.moveTo(target.x, target.y - 8); context.lineTo(target.x, target.y + 8);
    context.stroke();
    context.fillStyle = "#ffff00";
    context.font = "11px 'Fira Code', monospace";
    context.fillText("TARGET", Math.min(target.x + 12, width - 58), Math.max(14, target.y - 12));

    context.fillStyle = "rgba(0,255,255,0.18)";
    context.beginPath(); context.arc(observed.x, observed.y, 7, 0, Math.PI * 2); context.fill();
    context.strokeStyle = "#00ffff";
    context.lineWidth = 2;
    context.beginPath(); context.arc(tracker.x, tracker.y, 11, 0, Math.PI * 2); context.stroke();
    context.fillStyle = "#00ffff";
    context.beginPath(); context.arc(tracker.x, tracker.y, 3, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#00ffff";
    context.fillText("TRACKER", Math.min(tracker.x + 14, width - 68), Math.min(height - 8, tracker.y + 22));
  }

  function animate(time) {
    if (!state.lastTime) state.lastTime = time;
    const delta = Math.min((time - state.lastTime) / 1000, 0.05);
    state.lastTime = time;

    if (!state.paused) {
      state.elapsed += delta;
      state.target.x = 0.5 + Math.sin(state.elapsed * 0.62) * 0.31;
      state.target.y = 0.5 + Math.sin(state.elapsed * 0.91 + 1.2) * 0.29;
      const noiseScale = state.noise / 1000;
      state.observed.x = state.target.x + (Math.random() - 0.5) * noiseScale;
      state.observed.y = state.target.y + (Math.random() - 0.5) * noiseScale;
      const response = 1 - Math.pow(1 - state.gain, delta * 60);
      state.tracker.x += (state.observed.x - state.tracker.x) * response;
      state.tracker.y += (state.observed.y - state.tracker.y) * response;
      state.path.push({ ...state.tracker });
      if (state.path.length > 90) state.path.shift();
      state.frame += 1;
      if (state.frame % 8 === 0) updateReadouts();
      draw();
    }

    if (!reducedMotion.matches) requestAnimationFrame(animate);
  }

  gainInput.addEventListener("input", () => {
    state.gain = Number(gainInput.value);
    updateReadouts();
  });
  noiseInput.addEventListener("input", () => {
    state.noise = Number(noiseInput.value);
    updateReadouts();
  });
  pauseButton.addEventListener("click", () => {
    state.paused = !state.paused;
    pauseButton.textContent = state.paused ? "RESUME TRACKING" : "PAUSE TRACKING";
    pauseButton.setAttribute("aria-pressed", String(state.paused));
    status.textContent = state.paused ? "TRACKING PAUSED · MOTORS HOLD POSITION" : "TARGET ACQUIRED · TRACKING ACTIVE";
    if (state.paused) updateReadouts();
  });
  resetButton.addEventListener("click", reset);
  canvas.addEventListener("pointerdown", (event) => {
    const bounds = canvas.getBoundingClientRect();
    state.target.x = Math.max(0.05, Math.min(0.95, (event.clientX - bounds.left) / bounds.width));
    state.target.y = Math.max(0.05, Math.min(0.95, (event.clientY - bounds.top) / bounds.height));
    state.elapsed = Math.asin((state.target.x - 0.5) / 0.31) / 0.62;
    status.textContent = "MANUAL TARGET SET · TRACKER REACQUIRING";
  });
  window.addEventListener("resize", resize);
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);

  resize();
  updateReadouts();
  if (reducedMotion.matches) {
    status.textContent = "REDUCED MOTION · USE RESET TO RESTART TRACKING";
    pauseButton.disabled = true;
    state.paused = true;
  } else {
    requestAnimationFrame(animate);
  }
})();
