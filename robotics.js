// Autonomy lab demo: a simulated two-axis tracker following a target through
// noisy sensor observations. Mounted into the terminal output by the
// `robotics` command (see main.js) rather than rendered on page load.
(() => {
  const template = document.getElementById("roboticsTemplate");
  if (!template) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Orbit the target follows when no manual target is active.
  const ORBIT = { x: 0.5, y: 0.5, rx: 0.31, ry: 0.29, wx: 0.62, wy: 0.91, phase: 1.2 };
  const MANUAL_HOLD_SECONDS = 4;
  const PATH_LENGTH = 90;

  let root = null;
  let ui = null;
  let onClose = null;
  let rafId = 0;

  const state = {
    width: 0,
    height: 0,
    target: { x: 0.72, y: 0.34 },
    tracker: { x: 0.5, y: 0.5 },
    observed: { x: 0.72, y: 0.34 },
    manual: null,
    manualAge: 0,
    path: [],
    gain: 0.12,
    noise: 2,
    paused: false,
    lastTime: 0,
    elapsed: 0,
    frame: 0
  };

  function orbitPoint(t) {
    return {
      x: ORBIT.x + Math.sin(t * ORBIT.wx) * ORBIT.rx,
      y: ORBIT.y + Math.sin(t * ORBIT.wy + ORBIT.phase) * ORBIT.ry
    };
  }

  function build() {
    const fragment = template.content.cloneNode(true);
    root = fragment.querySelector(".robotics-console");
    ui = {
      canvas: root.querySelector("#roboticsCanvas"),
      gain: root.querySelector("#robotGain"),
      noise: root.querySelector("#robotNoise"),
      pause: root.querySelector("#robotPause"),
      reset: root.querySelector("#robotReset"),
      close: root.querySelector("#robotClose"),
      confidence: root.querySelector("#robotConfidence"),
      azimuth: root.querySelector("#robotAzimuth"),
      elevation: root.querySelector("#robotElevation"),
      gainValue: root.querySelector("#robotGainValue"),
      noiseValue: root.querySelector("#robotNoiseValue"),
      status: root.querySelector("#robotStatus")
    };
    ui.context = ui.canvas.getContext("2d");
    state.gain = Number(ui.gain.value);
    state.noise = Number(ui.noise.value);
    bindEvents();
  }

  function resize() {
    if (!root || !root.isConnected) return;
    const bounds = ui.canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    state.width = bounds.width;
    state.height = bounds.height;
    ui.canvas.width = Math.round(state.width * ratio);
    ui.canvas.height = Math.round(state.height * ratio);
    ui.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function setStatus(text) {
    ui.status.textContent = text;
  }

  function setPaused(paused) {
    state.paused = paused;
    ui.pause.textContent = paused ? "RESUME TRACKING" : "PAUSE TRACKING";
    ui.pause.setAttribute("aria-pressed", String(paused));
  }

  function reset() {
    state.elapsed = 0;
    state.target = orbitPoint(0);
    state.tracker = { x: 0.5, y: 0.5 };
    state.observed = { ...state.target };
    state.manual = null;
    state.manualAge = 0;
    state.path = [];
    setPaused(false);
    setStatus("TARGET ACQUIRED · TRACKING ACTIVE");
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
    ui.confidence.textContent = `${confidence}%`;
    ui.azimuth.textContent = `${azimuth >= 0 ? "+" : ""}${azimuth.toFixed(1)}°`;
    ui.elevation.textContent = `${elevation >= 0 ? "+" : ""}${elevation.toFixed(1)}°`;
    ui.gainValue.textContent = state.gain.toFixed(2);
    ui.noiseValue.textContent = state.noise < 4 ? "LOW" : state.noise < 8 ? "MED" : "HIGH";
  }

  function draw() {
    const { width, height } = state;
    const context = ui.context;
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

    // Tracker -> observed (what the controller is actually steering toward).
    context.setLineDash([5, 5]);
    context.strokeStyle = "rgba(0,255,0,0.35)";
    context.beginPath(); context.moveTo(tracker.x, tracker.y); context.lineTo(observed.x, observed.y); context.stroke();
    context.setLineDash([]);

    // True target.
    context.strokeStyle = state.manual ? "rgba(255,255,0,0.7)" : "rgba(255,255,0,0.35)";
    context.lineWidth = 1;
    context.beginPath(); context.arc(target.x, target.y, 18, 0, Math.PI * 2); context.stroke();
    context.strokeStyle = "#ffff00";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(target.x - 8, target.y); context.lineTo(target.x + 8, target.y);
    context.moveTo(target.x, target.y - 8); context.lineTo(target.x, target.y + 8);
    context.stroke();
    context.fillStyle = "#ffff00";
    context.font = "11px 'Fira Code', monospace";
    context.fillText(state.manual ? "MANUAL" : "TARGET", Math.min(target.x + 12, width - 58), Math.max(14, target.y - 12));

    // Noisy observation of the target.
    context.fillStyle = "rgba(0,255,255,0.18)";
    context.beginPath(); context.arc(observed.x, observed.y, 7, 0, Math.PI * 2); context.fill();

    // Tracker.
    context.strokeStyle = "#00ffff";
    context.lineWidth = 2;
    context.beginPath(); context.arc(tracker.x, tracker.y, 11, 0, Math.PI * 2); context.stroke();
    context.fillStyle = "#00ffff";
    context.beginPath(); context.arc(tracker.x, tracker.y, 3, 0, Math.PI * 2); context.fill();
    context.fillText("TRACKER", Math.min(tracker.x + 14, width - 68), Math.min(height - 8, tracker.y + 22));
  }

  function step(delta) {
    state.elapsed += delta;

    // Decide where the true target wants to be: a manual click holds for a few
    // seconds, then the target eases back onto its orbit.
    let desired;
    if (state.manual) {
      state.manualAge += delta;
      if (state.manualAge >= MANUAL_HOLD_SECONDS) {
        state.manual = null;
        setStatus("ORBIT RESUMED · TRACKING ACTIVE");
        desired = orbitPoint(state.elapsed);
      } else {
        desired = state.manual;
      }
    } else {
      desired = orbitPoint(state.elapsed);
    }
    const ease = Math.min(1, delta * 5);
    state.target.x += (desired.x - state.target.x) * ease;
    state.target.y += (desired.y - state.target.y) * ease;

    // Sensor noise: slider 0-12 maps to up to ±6% of the viewport.
    const noiseScale = state.noise / 100;
    state.observed.x = state.target.x + (Math.random() - 0.5) * noiseScale;
    state.observed.y = state.target.y + (Math.random() - 0.5) * noiseScale;

    // Proportional controller, framerate-independent.
    const response = 1 - Math.pow(1 - state.gain, delta * 60);
    state.tracker.x += (state.observed.x - state.tracker.x) * response;
    state.tracker.y += (state.observed.y - state.tracker.y) * response;
    state.path.push({ ...state.tracker });
    if (state.path.length > PATH_LENGTH) state.path.shift();

    state.frame += 1;
    if (state.frame % 8 === 0) updateReadouts();
  }

  function animate(time) {
    rafId = 0;
    if (!root || !root.isConnected) return;
    if (!state.lastTime) state.lastTime = time;
    const delta = Math.min((time - state.lastTime) / 1000, 0.05);
    state.lastTime = time;

    if (!state.paused) {
      step(delta);
      draw();
    }
    rafId = requestAnimationFrame(animate);
  }

  function startLoop() {
    if (rafId || reducedMotion.matches) return;
    state.lastTime = 0;
    rafId = requestAnimationFrame(animate);
  }

  function stopLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function bindEvents() {
    ui.gain.addEventListener("input", () => {
      state.gain = Number(ui.gain.value);
      updateReadouts();
    });
    ui.noise.addEventListener("input", () => {
      state.noise = Number(ui.noise.value);
      updateReadouts();
    });
    ui.pause.addEventListener("click", () => {
      setPaused(!state.paused);
      setStatus(state.paused ? "TRACKING PAUSED · MOTORS HOLD POSITION" : "TARGET ACQUIRED · TRACKING ACTIVE");
      if (state.paused) updateReadouts();
    });
    ui.reset.addEventListener("click", reset);
    ui.close.addEventListener("click", close);
    ui.canvas.addEventListener("pointerdown", (event) => {
      const bounds = ui.canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      state.manual = {
        x: Math.max(0.05, Math.min(0.95, (event.clientX - bounds.left) / bounds.width)),
        y: Math.max(0.05, Math.min(0.95, (event.clientY - bounds.top) / bounds.height))
      };
      state.manualAge = 0;
      setStatus("MANUAL TARGET SET · TRACKER REACQUIRING");
      if (state.paused || reducedMotion.matches) {
        // No animation loop running: snap so the click is visible.
        state.target = { ...state.manual };
        state.observed = { ...state.manual };
        updateReadouts();
        draw();
      }
    });
    window.addEventListener("resize", resize);
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(ui.canvas);
  }

  function open(host, options = {}) {
    if (!host) return null;
    if (!root) build();
    onClose = typeof options.onClose === "function" ? options.onClose : null;
    if (root.parentNode !== host) host.appendChild(root);
    resize();
    updateReadouts();
    if (reducedMotion.matches) {
      setStatus("REDUCED MOTION · CLICK THE VIEWPORT TO MOVE THE TARGET");
      ui.pause.disabled = true;
      state.paused = true;
      draw();
    } else {
      startLoop();
    }
    return root;
  }

  function close() {
    if (!root || !root.isConnected) return;
    stopLoop();
    root.remove();
    const callback = onClose;
    onClose = null;
    if (callback) callback();
  }

  function isOpen() {
    return Boolean(root && root.isConnected);
  }

  window.RoboticsLab = { open, close, isOpen };
})();
