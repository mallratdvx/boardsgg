export async function celebrate(big = false) {
  if (typeof window === "undefined") return;
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#e8c46a", "#c0392b", "#f5efe0", "#1e7a46"];
  confetti({ particleCount: big ? 220 : 110, spread: big ? 120 : 75, origin: { y: 0.65 }, colors });
  if (big) {
    setTimeout(() => confetti({ particleCount: 120, angle: 60, spread: 70, origin: { x: 0 }, colors }), 250);
    setTimeout(() => confetti({ particleCount: 120, angle: 120, spread: 70, origin: { x: 1 }, colors }), 400);
  }
}
