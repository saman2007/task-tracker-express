/**
 * ambient-bg.js — "The Living Blueprint"
 * Responsive dot-and-crosshair grid that reacts to the cursor with
 * spring physics, gossamer lattice threads, and silky theme cross-fading.
 *
 * PALETTES:
 * - Light: Subtle slate & warm charcoal on cream (crisp, clearly visible,
 *   aesthetic, zero double-alpha multiplication, soft warm lamp spotlight).
 * - Dark: Soft gold & moonlight on charcoal.
 * - Smooth lerp: Seamless 300ms color & opacity transition when toggling themes.
 *
 * SUBTLE PLAYFUL TOUCHES:
 * - Crosshair pinwheel micro-spin when cursor breeze passes.
 * - "Curious Firefly": nearest node gently peeks toward a quiet cursor.
 * - Concentric water-droplet ripples on click.
 * - Gentle embers trailing fast cursor sweeps.
 * - Idle data-pulse domino wave after ~12s of stillness.
 */
(function () {
  "use strict";

  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let dpr = 1;

  // Grid configuration
  const SPACING = 52;
  const INFLUENCE_RAD = 160;
  const SPRING = 0.065;
  const FRICTION = 0.81;
  const PUSH_FORCE = 24;

  // Cursor state
  const mouse = {
    x: -2000,
    y: -2000,
    targetX: -2000,
    targetY: -2000,
    vx: 0,
    vy: 0,
    prevX: -2000,
    prevY: -2000,
    speed: 0,
    active: false,
    lastMoved: Date.now(),
  };

  const ripples = [];
  const embers = [];

  // Idle data-pulse
  const pulses = [];
  let lastPulseTime = Date.now();

  // ── Palette Definitions ──────────────────────────────────────────────────
  // Light: Subtle slate-charcoal + slate-indigo + amber accent
  const PALETTE_LIGHT = {
    dotR: 82, dotG: 94, dotB: 112, dotA: 0.28,           // distinct slate dots
    crossR: 64, crossG: 84, crossB: 112, crossA: 0.40,     // crisp slate registration marks
    activeR: 217, activeG: 145, activeB: 0, activeA: 0.92, // warm amber energy
    latticeR: 74, latticeG: 94, latticeB: 120, latticeA: 0.32,
    tetherR: 74, tetherG: 94, tetherB: 120, tetherA: 0.38,
    spotlightR: 255, spotlightG: 252, spotlightB: 240, spotlightA: 0.48,
    spotMidA: 0.14,
    rippleR: 68, rippleG: 88, rippleB: 116, rippleA: 0.42,
    emberR: 225, emberG: 160, emberB: 20, emberA: 0.70,
  };

  // Dark: Gold on deep charcoal
  const PALETTE_DARK = {
    dotR: 240, dotG: 240, dotB: 245, dotA: 0.13,
    crossR: 255, crossG: 207, crossB: 63, crossA: 0.22,
    activeR: 255, activeG: 221, activeB: 102, activeA: 0.85,
    latticeR: 255, latticeG: 207, latticeB: 63, latticeA: 0.22,
    tetherR: 255, tetherG: 207, tetherB: 63, tetherA: 0.25,
    spotlightR: 255, spotlightG: 207, spotlightB: 63, spotlightA: 0.045,
    spotMidA: 0.01,
    rippleR: 255, rippleG: 207, rippleB: 63, rippleA: 0.32,
    emberR: 255, emberG: 221, emberB: 102, emberA: 0.60,
  };

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Active interpolated colors
  let isDark = document.documentElement.getAttribute("data-theme") === "dark";
  let themeFactor = isDark ? 1 : 0; // 0 = Light, 1 = Dark
  let targetThemeFactor = themeFactor;

  const colors = {
    nodeBase: "",
    nodeCross: "",
    nodeActive: "",
    lattice: "",
    latticeA: 0,
    tether: "",
    tetherA: 0,
    spotlight: "",
    spotMid: "",
    ripple: "",
    rippleA: 0,
    ember: "",
    emberA: 0,
  };

  function updateInterpolatedColors(t) {
    const L = PALETTE_LIGHT;
    const D = PALETTE_DARK;

    const rDot = Math.round(lerp(L.dotR, D.dotR, t));
    const gDot = Math.round(lerp(L.dotG, D.dotG, t));
    const bDot = Math.round(lerp(L.dotB, D.dotB, t));
    const aDot = lerp(L.dotA, D.dotA, t);
    colors.nodeBase = `rgba(${rDot}, ${gDot}, ${bDot}, ${aDot})`;

    const rCross = Math.round(lerp(L.crossR, D.crossR, t));
    const gCross = Math.round(lerp(L.crossG, D.crossG, t));
    const bCross = Math.round(lerp(L.crossB, D.crossB, t));
    const aCross = lerp(L.crossA, D.crossA, t);
    colors.nodeCross = `rgba(${rCross}, ${gCross}, ${bCross}, ${aCross})`;

    const rAct = Math.round(lerp(L.activeR, D.activeR, t));
    const gAct = Math.round(lerp(L.activeG, D.activeG, t));
    const bAct = Math.round(lerp(L.activeB, D.activeB, t));
    const aAct = lerp(L.activeA, D.activeA, t);
    colors.nodeActive = `rgba(${rAct}, ${gAct}, ${bAct}, ${aAct})`;

    const rLat = Math.round(lerp(L.latticeR, D.latticeR, t));
    const gLat = Math.round(lerp(L.latticeG, D.latticeG, t));
    const bLat = Math.round(lerp(L.latticeB, D.latticeB, t));
    colors.latticeA = lerp(L.latticeA, D.latticeA, t);
    colors.lattice = `rgba(${rLat}, ${gLat}, ${bLat}, 1)`;

    const rTeth = Math.round(lerp(L.tetherR, D.tetherR, t));
    const gTeth = Math.round(lerp(L.tetherG, D.tetherG, t));
    const bTeth = Math.round(lerp(L.tetherB, D.tetherB, t));
    colors.tetherA = lerp(L.tetherA, D.tetherA, t);
    colors.tether = `rgba(${rTeth}, ${gTeth}, ${bTeth}, 1)`;

    const rSpot = Math.round(lerp(L.spotlightR, D.spotlightR, t));
    const gSpot = Math.round(lerp(L.spotlightG, D.spotlightG, t));
    const bSpot = Math.round(lerp(L.spotlightB, D.spotlightB, t));
    const aSpot = lerp(L.spotlightA, D.spotlightA, t);
    const aSpotMid = lerp(L.spotMidA, D.spotMidA, t);
    colors.spotlight = `rgba(${rSpot}, ${gSpot}, ${bSpot}, ${aSpot})`;
    colors.spotMid = `rgba(${rSpot}, ${gSpot}, ${bSpot}, ${aSpotMid})`;

    const rRip = Math.round(lerp(L.rippleR, D.rippleR, t));
    const gRip = Math.round(lerp(L.rippleG, D.rippleG, t));
    const bRip = Math.round(lerp(L.rippleB, D.rippleB, t));
    colors.rippleA = lerp(L.rippleA, D.rippleA, t);
    colors.ripple = `rgba(${rRip}, ${gRip}, ${bRip}, 1)`;

    const rEmb = Math.round(lerp(L.emberR, D.emberR, t));
    const gEmb = Math.round(lerp(L.emberG, D.emberG, t));
    const bEmb = Math.round(lerp(L.emberB, D.emberB, t));
    colors.emberA = lerp(L.emberA, D.emberA, t);
    colors.ember = `rgba(${rEmb}, ${gEmb}, ${bEmb}, 1)`;
  }

  updateInterpolatedColors(themeFactor);

  // Watch theme switches and smoothly glide to new palette
  const themeObserver = new MutationObserver(() => {
    isDark = document.documentElement.getAttribute("data-theme") === "dark";
    targetThemeFactor = isDark ? 1 : 0;
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // ── Node (physics + rotational micro-reaction) ───────────────────────────
  class Node {
    constructor(bx, by, isCross) {
      this.bx = bx;
      this.by = by;
      this.x = bx;
      this.y = by;
      this.vx = 0;
      this.vy = 0;
      this.isCross = isCross;
      this.angle = 0;
      this.vAngle = 0;
      this.displacement = 0;
      this.waveOffset = bx * 0.014 + by * 0.014;
    }

    update(time, isNearest) {
      // 1. Natural undulating breathing wave
      let targetX = this.bx;
      let targetY = this.by;

      if (!prefersReducedMotion) {
        targetY += Math.sin(time * 0.7 + this.waveOffset) * 1.8;
      }

      // 2. Hooke's spring return
      this.vx += (targetX - this.x) * SPRING;
      this.vy += (targetY - this.y) * SPRING;

      // 3. Playful cursor interaction
      if (mouse.active) {
        const mdx = this.x - mouse.x;
        const mdy = this.y - mouse.y;
        const distSq = mdx * mdx + mdy * mdy;

        if (distSq < INFLUENCE_RAD * INFLUENCE_RAD && distSq > 0) {
          const dist = Math.sqrt(distSq);

          // "Curious Firefly": nearest node peeks toward a quiet cursor
          if (isNearest && mouse.speed < 2.5 && dist > 20) {
            const pull = (1 - dist / INFLUENCE_RAD) * 6;
            this.vx -= (mdx / dist) * pull * 0.15;
            this.vy -= (mdy / dist) * pull * 0.15;
          } else {
            // Gentle magnetic repulsion
            const force = 1 - dist / INFLUENCE_RAD;
            const angle = Math.atan2(mdy, mdx);
            const strength = force * PUSH_FORCE;
            this.vx += Math.cos(angle) * strength * 0.28;
            this.vy += Math.sin(angle) * strength * 0.28;

            // Pinwheel micro-spin on crosshairs
            if (this.isCross) {
              this.vAngle += (this.vx - this.vy) * 0.018;
            }
          }
        }
      }

      // 4. Ripple impulse
      for (let s = 0; s < ripples.length; s++) {
        const r = ripples[s];
        const rdx = this.x - r.x;
        const rdy = this.y - r.y;
        const rDist = Math.hypot(rdx, rdy);
        const diff = Math.abs(rDist - r.radius);

        if (diff < r.thickness) {
          const waveForce = (1 - diff / r.thickness) * r.strength;
          const rAngle = Math.atan2(rdy, rdx);
          this.vx += Math.cos(rAngle) * waveForce;
          this.vy += Math.sin(rAngle) * waveForce;
          if (this.isCross) this.vAngle += 0.08 * (1 - rDist / r.maxRadius);
        }
      }

      // 5. Apply damping
      this.vx *= FRICTION;
      this.vy *= FRICTION;
      this.x += this.vx;
      this.y += this.vy;

      if (this.isCross) {
        this.vAngle += (0 - this.angle) * 0.08;
        this.vAngle *= 0.82;
        this.angle += this.vAngle;
      }

      this.displacement = Math.hypot(this.x - this.bx, this.y - this.by);
    }
  }

  // ── Grid Initialization ──────────────────────────────────────────────────
  let cols = 0;
  let rows = 0;
  let grid = [];

  function initGrid() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.ceil(width / SPACING) + 2;
    rows = Math.ceil(height / SPACING) + 2;

    const offsetX = (width - (cols - 1) * SPACING) / 2;
    const offsetY = (height - (rows - 1) * SPACING) / 2;

    grid = [];
    for (let c = 0; c < cols; c++) {
      grid[c] = [];
      for (let r = 0; r < rows; r++) {
        const bx = offsetX + c * SPACING;
        const by = offsetY + r * SPACING;
        const isCross = c % 2 === 0 && r % 2 === 0;
        grid[c][r] = new Node(bx, by, isCross);
      }
    }
  }

  // ── Pointer Tracking ─────────────────────────────────────────────────────
  function onPointerMove(clientX, clientY) {
    mouse.targetX = clientX;
    mouse.targetY = clientY;
    mouse.active = true;
    mouse.lastMoved = Date.now();

    // Spawn tiny embers on brisk sweeps
    if (embers.length < 18 && Math.random() < 0.35) {
      embers.push({
        x: clientX,
        y: clientY,
        vx: (Math.random() - 0.5) * 1.2 - mouse.vx * 0.08,
        vy: (Math.random() - 0.5) * 1.2 - mouse.vy * 0.08 - 0.3,
        life: 1.0,
        decay: 0.03 + Math.random() * 0.02,
        size: 1.2 + Math.random() * 1.2,
      });
    }
  }

  window.addEventListener(
    "pointermove",
    (e) => onPointerMove(e.clientX, e.clientY),
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "pointerleave",
    () => {
      mouse.active = false;
    },
    { passive: true }
  );

  // Concentric water-droplet ripples on click
  window.addEventListener(
    "pointerdown",
    (e) => {
      if (ripples.length < 4) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 0,
          maxRadius: Math.min(width, height) * 0.45,
          speed: 6.8,
          thickness: 34,
          strength: 4.2,
          life: 1.0,
        });
        setTimeout(() => {
          if (ripples.length < 5) {
            ripples.push({
              x: e.clientX,
              y: e.clientY,
              radius: 0,
              maxRadius: Math.min(width, height) * 0.36,
              speed: 5.8,
              thickness: 28,
              strength: 2.5,
              life: 1.0,
            });
          }
        }, 90);
      }
    },
    { passive: true }
  );

  // ── Idle Data-Pulse ──────────────────────────────────────────────────────
  function checkIdlePulse() {
    const now = Date.now();
    if (!prefersReducedMotion && now - lastPulseTime > 12000) {
      lastPulseTime = now;
      if (pulses.length < 2 && rows > 2) {
        const targetRow = 1 + Math.floor(Math.random() * (rows - 2));
        pulses.push({
          row: targetRow,
          x: -40,
          y: grid[0] && grid[0][targetRow] ? grid[0][targetRow].by : 100,
          vx: 9.5,
          life: 1.0,
        });
      }
    }
  }

  // ── Animation Loop ───────────────────────────────────────────────────────
  let time = 0;

  function loop() {
    time += 0.016;
    ctx.clearRect(0, 0, width, height);

    // 0. Smooth theme interpolation (~300ms silky glide)
    if (Math.abs(targetThemeFactor - themeFactor) > 0.005) {
      themeFactor += (targetThemeFactor - themeFactor) * 0.14;
      updateInterpolatedColors(themeFactor);
    } else if (themeFactor !== targetThemeFactor) {
      themeFactor = targetThemeFactor;
      updateInterpolatedColors(themeFactor);
    }

    // 1. Silky cursor interpolation
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x += (mouse.targetX - mouse.x) * 0.12;
    mouse.y += (mouse.targetY - mouse.y) * 0.12;
    mouse.vx = mouse.x - mouse.prevX;
    mouse.vy = mouse.y - mouse.prevY;
    mouse.speed = Math.hypot(mouse.vx, mouse.vy);

    // 2. Ambient Spotlight Glow
    if (mouse.active && mouse.x > -200 && mouse.x < width + 200) {
      const gradRadius = lerp(260, 280, themeFactor);
      const glow = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        gradRadius
      );
      glow.addColorStop(0, colors.spotlight);
      glow.addColorStop(0.5, colors.spotMid);
      glow.addColorStop(1, "transparent");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, gradRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Concentric Droplet Ripples
    for (let s = ripples.length - 1; s >= 0; s--) {
      const r = ripples[s];
      r.radius += r.speed;
      r.life = 1 - r.radius / r.maxRadius;
      r.strength *= 0.94;

      if (r.life <= 0) {
        ripples.splice(s, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = colors.ripple;
      ctx.lineWidth = 1;
      ctx.globalAlpha = r.life * colors.rippleA;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // 3.5 Idle Data-Pulse & Domino Micro-Reaction
    checkIdlePulse();

    for (let pIdx = pulses.length - 1; pIdx >= 0; pIdx--) {
      const pulse = pulses[pIdx];
      pulse.x += pulse.vx;

      if (pulse.x > width + 60) {
        pulses.splice(pIdx, 1);
        continue;
      }

      const colIdx = Math.floor(pulse.x / SPACING);
      if (colIdx >= 0 && colIdx < cols && grid[colIdx] && grid[colIdx][pulse.row]) {
        const node = grid[colIdx][pulse.row];
        node.vx += 1.6;
        if (node.isCross) node.vAngle += 0.22;
      }

      ctx.beginPath();
      ctx.moveTo(pulse.x - 22, pulse.y);
      ctx.lineTo(pulse.x, pulse.y);
      ctx.strokeStyle = colors.nodeActive;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // 4. Update nodes & identify nearest for firefly tether
    let nearestNode = null;
    let minMouseDist = Infinity;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const node = grid[c][r];
        if (mouse.active) {
          const d = Math.hypot(node.x - mouse.x, node.y - mouse.y);
          if (d < minMouseDist) {
            minMouseDist = d;
            nearestNode = node;
          }
        }
      }
    }

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        grid[c][r].update(time, grid[c][r] === nearestNode);
      }
    }

    // 5. Dynamic Gossamer Lattice Threads
    ctx.lineWidth = 1;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const n1 = grid[c][r];

        if (c + 1 < cols) {
          const n2 = grid[c + 1][r];
          const dist = Math.min(
            Math.hypot(n1.x - mouse.x, n1.y - mouse.y),
            Math.hypot(n2.x - mouse.x, n2.y - mouse.y)
          );

          if (dist < INFLUENCE_RAD * 0.9) {
            const alpha = (1 - dist / (INFLUENCE_RAD * 0.9)) * colors.latticeA;
            ctx.strokeStyle = colors.lattice;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }

        if (r + 1 < rows) {
          const n2 = grid[c][r + 1];
          const dist = Math.min(
            Math.hypot(n1.x - mouse.x, n1.y - mouse.y),
            Math.hypot(n2.x - mouse.x, n2.y - mouse.y)
          );

          if (dist < INFLUENCE_RAD * 0.9) {
            const alpha = (1 - dist / (INFLUENCE_RAD * 0.9)) * colors.latticeA;
            ctx.strokeStyle = colors.lattice;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }
    }
    ctx.globalAlpha = 1.0;

    // 6. Curious Firefly Tether
    if (mouse.active && nearestNode && minMouseDist < INFLUENCE_RAD * 0.75) {
      const tetherAlpha =
        (1 - minMouseDist / (INFLUENCE_RAD * 0.75)) * colors.tetherA;
      ctx.beginPath();
      ctx.moveTo(nearestNode.x, nearestNode.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.strokeStyle = colors.tether;
      ctx.globalAlpha = tetherAlpha;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // 7. Render Blueprint Nodes & Playful Crosshairs
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const node = grid[c][r];
        const isDisplaced = node.displacement > 1.0;

        if (node.isCross) {
          const arm = isDisplaced ? 4.2 : 3.4;
          ctx.strokeStyle = isDisplaced ? colors.nodeActive : colors.nodeCross;
          ctx.globalAlpha = isDisplaced
            ? Math.min(0.92, 0.45 + node.displacement * 0.06)
            : 1.0; // Resting alpha is calibrated directly in nodeCross!
          ctx.lineWidth = 1.1;

          ctx.save();
          ctx.translate(node.x, node.y);
          if (node.angle !== 0) ctx.rotate(node.angle);

          ctx.beginPath();
          ctx.moveTo(-arm, 0);
          ctx.lineTo(arm, 0);
          ctx.moveTo(0, -arm);
          ctx.lineTo(0, arm);
          ctx.stroke();
          ctx.restore();
        } else {
          const rad = isDisplaced ? 2.1 : 1.5;
          ctx.fillStyle = isDisplaced ? colors.nodeActive : colors.nodeBase;
          ctx.globalAlpha = isDisplaced
            ? Math.min(0.92, 0.45 + node.displacement * 0.06)
            : 1.0; // Resting alpha is calibrated directly in nodeBase!

          ctx.beginPath();
          ctx.arc(node.x, node.y, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1.0;

    // 8. Charming Floating Embers
    for (let i = embers.length - 1; i >= 0; i--) {
      const p = embers[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        embers.splice(i, 1);
        continue;
      }

      ctx.fillStyle = colors.ember;
      ctx.globalAlpha = p.life * colors.emberA;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    requestAnimationFrame(loop);
  }

  // Lifecycle
  window.addEventListener("resize", initGrid);
  initGrid();
  requestAnimationFrame(loop);
})();
