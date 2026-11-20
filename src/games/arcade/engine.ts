/**
 * Caza-Monedas FINOVA — HTML5 Canvas arcade engine.
 * Faithful port of the original game loop: same physics, spawn rates, power-ups,
 * hazards (gastos hormiga / compras impulsivas), drawing and sounds.
 */
import type { DifficultyConfig } from "@/data/arcade";
import { formatCOP } from "@/lib/format";
import { SoundFX } from "@/services/sound";

type ItemKind = "coin" | "diamond" | "shield" | "magnet" | "ant" | "impulse";
interface FallingItem { x: number; y: number; vy: number; radius: number; kind: ItemKind; wobble: number; rot: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }
interface Popup { x: number; y: number; text: string; color: string; life: number }

export interface ArcadeHud { scoreCoins: number; timeLeft: number; lives: number; combo: number }
export interface ArcadeResult { scoreCoins: number; xpEarned: number }

export interface ArcadeOptions {
  canvas: HTMLCanvasElement;
  leftBtn: HTMLElement | null;
  rightBtn: HTMLElement | null;
  diff: DifficultyConfig;
  onHud: (hud: ArcadeHud) => void;
  onFinish: (result: ArcadeResult) => void;
}

// Clouds keep drifting between games, like the original module-level state.
const clouds = [
  { x: 0.15, y: 0.14, s: 1.0, v: 0.012 },
  { x: 0.55, y: 0.09, s: 0.8, v: 0.008 },
  { x: 0.85, y: 0.18, s: 1.15, v: 0.015 },
];

/** Starts a game; returns a stop() function. */
export function startArcade({ canvas, leftBtn, rightBtn, diff, onHud, onFinish }: ArcadeOptions): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const st = {
    running: true,
    scoreCoins: 0,
    xpEarned: 0,
    timeLeft: 40,
    lives: 3,
    combo: 0,
    shieldTimer: 0,
    magnetTimer: 0,
    playerX: 0.5,
    items: [] as FallingItem[],
    particles: [] as Particle[],
    popups: [] as Popup[],
  };
  let loopId: number | null = null;
  const hud = () => onHud({ scoreCoins: st.scoreCoins, timeLeft: st.timeLeft, lives: st.lives, combo: st.combo });

  SoundFX.powerup();

  let spawnTimer = 0;
  let secondTimer = 0;
  let lastTime = performance.now();
  const keys = { left: false, right: false };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = true;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = true;
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
  };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  let isDragging = false;
  const updatePointerX = (clientX: number) => {
    const rect = canvas.getBoundingClientRect();
    const norm = (clientX - rect.left) / rect.width;
    st.playerX = Math.max(0.08, Math.min(0.92, norm));
  };
  canvas.onpointerdown = (e) => {
    isDragging = true;
    updatePointerX(e.clientX);
  };
  canvas.onpointermove = (e) => {
    if (isDragging || e.pointerType === "mouse") updatePointerX(e.clientX);
  };
  canvas.onpointerup = () => {
    isDragging = false;
  };

  if (leftBtn) {
    leftBtn.onpointerdown = () => (keys.left = true);
    leftBtn.onpointerup = () => (keys.left = false);
    leftBtn.onpointerleave = () => (keys.left = false);
  }
  if (rightBtn) {
    rightBtn.onpointerdown = () => (keys.right = true);
    rightBtn.onpointerup = () => (keys.right = false);
    rightBtn.onpointerleave = () => (keys.right = false);
  }

  function removeListeners() {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  }

  function spawnFallingItem() {
    const r = Math.random();
    let kind: ItemKind = "coin";
    if (r < diff.hazardChance) kind = Math.random() < 0.55 ? "ant" : "impulse";
    else if (r < diff.hazardChance + 0.14) kind = "diamond";
    else if (r < diff.hazardChance + 0.21) kind = "shield";
    else if (r < diff.hazardChance + 0.27) kind = "magnet";
    st.items.push({
      x: 0.08 + Math.random() * 0.84,
      y: -0.06,
      vy: (0.26 + Math.random() * 0.16) * diff.speedScale,
      radius: kind === "diamond" ? 22 : 21,
      kind,
      wobble: Math.random() * Math.PI * 2,
      rot: 0,
    });
  }

  function createBurst(nx: number, ny: number, color: string, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 60 + Math.random() * 140;
      st.particles.push({
        x: nx,
        y: ny,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: 0.55 + Math.random() * 0.25,
        maxLife: 0.8,
        color,
        size: 4 + Math.random() * 4,
      });
    }
  }

  function addPopup(nx: number, ny: number, text: string, color: string) {
    st.popups.push({ x: nx, y: ny, text, color, life: 0.95 });
  }

  function finishGame() {
    st.running = false;
    removeListeners();
    onFinish({ scoreCoins: st.scoreCoins, xpEarned: st.xpEarned });
  }

  function drawCharacter(c: CanvasRenderingContext2D, px: number, py: number, timeSec: number) {
    const bounce = Math.sin(timeSec * 8) * 3;
    c.save();
    c.translate(px, py + bounce);

    if (st.shieldTimer > 0) {
      c.beginPath();
      c.arc(0, -6, 54, 0, Math.PI * 2);
      c.fillStyle = "rgba(16, 185, 129, 0.20)";
      c.fill();
      c.lineWidth = 3;
      c.strokeStyle = "#10b981";
      c.setLineDash([8, 6]);
      c.stroke();
      c.setLineDash([]);
    }
    if (st.magnetTimer > 0) {
      c.beginPath();
      c.arc(0, -6, 62, 0, Math.PI * 2);
      c.strokeStyle = "rgba(245, 158, 11, 0.55)";
      c.lineWidth = 2.5;
      c.stroke();
    }

    c.fillStyle = "rgba(15, 23, 42, 0.18)";
    c.beginPath();
    c.ellipse(0, 32 - bounce, 36, 9, 0, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = "#f472b6";
    c.beginPath();
    c.moveTo(-26, -18); c.lineTo(-34, -38); c.lineTo(-14, -28); c.closePath();
    c.moveTo(26, -18); c.lineTo(34, -38); c.lineTo(14, -28); c.closePath();
    c.fill();

    const bodyGrad = c.createLinearGradient(-34, -30, 34, 28);
    bodyGrad.addColorStop(0, "#fbcfe8");
    bodyGrad.addColorStop(0.5, "#f472b6");
    bodyGrad.addColorStop(1, "#db2777");
    c.fillStyle = bodyGrad;
    c.beginPath();
    c.ellipse(0, 0, 38, 30, 0, 0, Math.PI * 2);
    c.fill();
    c.lineWidth = 3;
    c.strokeStyle = "#ffffff";
    c.stroke();

    c.fillStyle = "#fbbf24";
    c.beginPath();
    c.roundRect(-14, -32, 28, 8, 4);
    c.fill();
    c.fillStyle = "#78350f";
    c.fillRect(-9, -30, 18, 3);

    c.fillStyle = "#fce7f3";
    c.beginPath();
    c.ellipse(0, 6, 15, 10, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#ec4899";
    c.lineWidth = 2;
    c.stroke();

    c.fillStyle = "#be185d";
    c.beginPath();
    c.arc(-5, 6, 2.6, 0, Math.PI * 2);
    c.arc(5, 6, 2.6, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = "#0f172a";
    c.beginPath();
    c.arc(-15, -7, 4.5, 0, Math.PI * 2);
    c.arc(15, -7, 4.5, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(-13.5, -8.5, 1.8, 0, Math.PI * 2);
    c.arc(16.5, -8.5, 1.8, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = "rgba(244, 63, 94, 0.35)";
    c.beginPath();
    c.ellipse(-22, 1, 5, 3, 0, 0, Math.PI * 2);
    c.ellipse(22, 1, 5, 3, 0, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = "#be185d";
    c.beginPath();
    c.roundRect(-22, 24, 12, 9, 4);
    c.roundRect(10, 24, 12, 9, 4);
    c.fill();

    c.restore();
  }

  function drawFallingItem(c: CanvasRenderingContext2D, item: FallingItem, ix: number, iy: number, timeSec: number) {
    c.save();
    c.translate(ix, iy);
    if (item.kind === "coin") {
      const spin = Math.cos(timeSec * 5 + item.wobble);
      const rx = Math.max(8, 20 * Math.abs(spin));
      c.shadowColor = "rgba(245, 158, 11, 0.5)";
      c.shadowBlur = 12;
      const grad = c.createLinearGradient(-20, -20, 20, 20);
      grad.addColorStop(0, "#fef08a");
      grad.addColorStop(0.5, "#f59e0b");
      grad.addColorStop(1, "#d97706");
      c.fillStyle = grad;
      c.beginPath();
      c.ellipse(0, 0, rx, 20, 0, 0, Math.PI * 2);
      c.fill();
      c.lineWidth = 2.5;
      c.strokeStyle = "#ffffff";
      c.stroke();
      c.shadowBlur = 0;
      if (rx > 11) {
        c.fillStyle = "#78350f";
        c.font = "900 16px Nunito, sans-serif";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("$", 0, 1);
      }
    } else if (item.kind === "diamond") {
      c.rotate(Math.sin(timeSec * 3 + item.wobble) * 0.18);
      c.shadowColor = "rgba(56, 189, 248, 0.65)";
      c.shadowBlur = 14;
      c.fillStyle = "#38bdf8";
      c.beginPath();
      c.moveTo(0, -22); c.lineTo(20, -6); c.lineTo(0, 22); c.lineTo(-20, -6);
      c.closePath();
      c.fill();
      c.fillStyle = "#bae6fd";
      c.beginPath();
      c.moveTo(0, -22); c.lineTo(10, -6); c.lineTo(0, 4); c.lineTo(-10, -6);
      c.closePath();
      c.fill();
      c.strokeStyle = "#ffffff";
      c.lineWidth = 2;
      c.stroke();
    } else if (item.kind === "shield") {
      c.fillStyle = "#10b981";
      c.beginPath();
      c.moveTo(0, -21);
      c.lineTo(18, -13);
      c.lineTo(18, 2);
      c.quadraticCurveTo(18, 16, 0, 22);
      c.quadraticCurveTo(-18, 16, -18, 2);
      c.lineTo(-18, -13);
      c.closePath();
      c.fill();
      c.lineWidth = 2.5;
      c.strokeStyle = "#ffffff";
      c.stroke();
      c.fillStyle = "#ffffff";
      c.font = "900 15px Nunito, sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText("🛡️", 0, 1);
    } else if (item.kind === "magnet") {
      c.fillStyle = "#f59e0b";
      c.beginPath();
      c.arc(0, 0, 20, 0, Math.PI * 2);
      c.fill();
      c.lineWidth = 2.5;
      c.strokeStyle = "#ffffff";
      c.stroke();
      c.font = "18px sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText("🧲", 0, 1);
    } else if (item.kind === "ant") {
      c.rotate(Math.sin(timeSec * 7 + item.wobble) * 0.22);
      c.fillStyle = "#e11d48";
      c.beginPath();
      for (let i = 0; i < 12; i++) {
        const ang = (Math.PI * 2 * i) / 12;
        const r = i % 2 === 0 ? 22 : 14;
        if (i === 0) c.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
        else c.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      }
      c.closePath();
      c.fill();
      c.lineWidth = 2;
      c.strokeStyle = "#ffe4e6";
      c.stroke();
      c.font = "17px sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText("🐜", 0, 1);
    } else {
      c.fillStyle = "#7c3aed";
      c.beginPath();
      c.roundRect(-20, -18, 40, 36, 12);
      c.fill();
      c.lineWidth = 2.5;
      c.strokeStyle = "#ddd6fe";
      c.stroke();
      c.font = "18px sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText("💸", 0, 1);
    }
    c.restore();
  }

  function frame(now: number) {
    if (!st.running || !ctx) return;
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    const timeSec = now / 1000;

    const rect = canvas.parentElement!.getBoundingClientRect();
    if (canvas.width !== Math.floor(rect.width) || canvas.height !== Math.floor(rect.height)) {
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
    }
    const W = canvas.width;
    const H = canvas.height;

    secondTimer += dt;
    if (secondTimer >= 1) {
      secondTimer -= 1;
      st.timeLeft = Math.max(0, st.timeLeft - 1);
      hud();
      if (st.timeLeft <= 0) {
        finishGame();
        return;
      }
    }

    if (st.shieldTimer > 0) st.shieldTimer = Math.max(0, st.shieldTimer - dt);
    if (st.magnetTimer > 0) st.magnetTimer = Math.max(0, st.magnetTimer - dt);

    const moveSpeed = 0.85 * dt;
    if (keys.left) st.playerX = Math.max(0.08, st.playerX - moveSpeed);
    if (keys.right) st.playerX = Math.min(0.92, st.playerX + moveSpeed);

    spawnTimer += dt;
    if (spawnTimer >= diff.spawnInterval) {
      spawnTimer = 0;
      spawnFallingItem();
    }

    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, "#bae6fd");
    skyGrad.addColorStop(0.55, "#e0f2fe");
    skyGrad.addColorStop(0.84, "#dcfce7");
    skyGrad.addColorStop(1, "#86efac");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(253, 224, 71, 0.45)";
    ctx.beginPath();
    ctx.arc(W * 0.86, H * 0.16, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(W * 0.86, H * 0.16, 30, 0, Math.PI * 2);
    ctx.fill();

    clouds.forEach((cl) => {
      cl.x += cl.v * dt;
      if (cl.x > 1.15) cl.x = -0.15;
      const cx = cl.x * W;
      const cy = cl.y * H;
      ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
      ctx.beginPath();
      ctx.arc(cx, cy, 22 * cl.s, 0, Math.PI * 2);
      ctx.arc(cx + 18 * cl.s, cy - 6 * cl.s, 26 * cl.s, 0, Math.PI * 2);
      ctx.arc(cx + 38 * cl.s, cy, 20 * cl.s, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#bbf7d0";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.84);
    ctx.quadraticCurveTo(W * 0.25, H * 0.72, W * 0.55, H * 0.83);
    ctx.quadraticCurveTo(W * 0.8, H * 0.9, W, H * 0.78);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.fill();

    ctx.fillStyle = "#10b981";
    ctx.fillRect(0, H - 36, W, 36);
    ctx.fillStyle = "#34d399";
    ctx.fillRect(0, H - 36, W, 7);

    const px = st.playerX * W;
    const py = H - 58;

    for (let i = st.items.length - 1; i >= 0; i--) {
      const it = st.items[i]!;
      it.y += it.vy * dt;
      if (st.magnetTimer > 0 && (it.kind === "coin" || it.kind === "diamond")) {
        it.x += (st.playerX - it.x) * 3.5 * dt;
      }
      const ix = it.x * W;
      const iy = it.y * H;
      drawFallingItem(ctx, it, ix, iy, timeSec);

      const dist = Math.hypot(ix - px, iy - py);
      if (dist < 52) {
        st.items.splice(i, 1);
        if (it.kind === "coin") {
          st.combo++;
          const comboBonus = Math.min(500, Math.floor(st.combo / 3) * 100);
          const gained = Math.round((1000 + comboBonus) * diff.multiplier);
          st.scoreCoins += gained;
          st.xpEarned += 8;
          SoundFX.coin();
          createBurst(ix, iy, "#fbbf24", 10);
          addPopup(ix, iy - 16, `+${formatCOP(gained)}`, "#b45309");
        } else if (it.kind === "diamond") {
          st.combo += 2;
          const gained = Math.round(3000 * diff.multiplier);
          st.scoreCoins += gained;
          st.xpEarned += 20;
          SoundFX.gem();
          createBurst(ix, iy, "#38bdf8", 16);
          addPopup(ix, iy - 18, `💎 +${formatCOP(gained)}`, "#0369a1");
        } else if (it.kind === "shield") {
          st.shieldTimer = 7;
          SoundFX.powerup();
          createBurst(ix, iy, "#10b981", 14);
          addPopup(ix, iy - 18, "🛡️ ¡Escudo 7s!", "#047857");
        } else if (it.kind === "magnet") {
          st.magnetTimer = 7;
          SoundFX.powerup();
          createBurst(ix, iy, "#f59e0b", 14);
          addPopup(ix, iy - 18, "🧲 ¡Imán 7s!", "#b45309");
        } else if (st.shieldTimer > 0) {
          SoundFX.tab();
          createBurst(ix, iy, "#10b981", 12);
          addPopup(ix, iy - 18, "🛡️ ¡Bloqueado!", "#059669");
        } else {
          st.combo = 0;
          st.lives--;
          SoundFX.hit();
          createBurst(ix, iy, "#f43f5e", 16);
          addPopup(ix, iy - 18, it.kind === "ant" ? "🐜 ¡Gasto Hormiga!" : "💸 ¡Impulso!", "#be123c");
          hud();
          if (st.lives <= 0) {
            finishGame();
            return;
          }
        }
        hud();
        continue;
      }
      if (it.y > 1.08) st.items.splice(i, 1);
    }

    drawCharacter(ctx, px, py, timeSec);

    for (let i = st.particles.length - 1; i >= 0; i--) {
      const p = st.particles[i]!;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 260 * dt;
      p.life -= dt;
      if (p.life <= 0) {
        st.particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    for (let i = st.popups.length - 1; i >= 0; i--) {
      const pop = st.popups[i]!;
      pop.y -= 42 * dt;
      pop.life -= dt;
      if (pop.life <= 0) {
        st.popups.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.min(1, pop.life * 1.4);
      ctx.font = "900 16px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(pop.text, pop.x + 1, pop.y + 1);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.globalAlpha = 1;
    }

    loopId = requestAnimationFrame(frame);
  }

  loopId = requestAnimationFrame(frame);

  return () => {
    st.running = false;
    if (loopId) cancelAnimationFrame(loopId);
    loopId = null;
    removeListeners();
  };
}
