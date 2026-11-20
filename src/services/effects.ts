/** Visual effects shared by the whole app (DOM-level, like the original). */
export function launchConfetti() {
  if (typeof document === "undefined") return;
  const colors = ["#10b981", "#f59e0b", "#38bdf8", "#f43f5e", "#a855f7", "#fde047"];
  for (let i = 0; i < 36; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.backgroundColor = colors[i % colors.length]!;
    piece.style.animationDelay = Math.random() * 0.45 + "s";
    piece.style.width = 7 + Math.random() * 7 + "px";
    piece.style.height = 7 + Math.random() * 7 + "px";
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2900);
  }
}
