// Curated avatar palette (gradient SVG data URIs — no external deps, instant load)
const palettes = [
  ["#f59e0b", "#7c2d12"],
  ["#ef4444", "#7f1d1d"],
  ["#10b981", "#064e3b"],
  ["#3b82f6", "#1e3a8a"],
  ["#8b5cf6", "#4c1d95"],
  ["#ec4899", "#831843"],
  ["#06b6d4", "#164e63"],
  ["#eab308", "#713f12"],
  ["#f97316", "#7c2d12"],
  ["#14b8a6", "#134e4a"],
  ["#a855f7", "#581c87"],
  ["#22c55e", "#14532d"],
];

const icons = ["🎬", "🍿", "🎭", "🎞️", "⭐", "🦸", "🚀", "👑", "🎨", "🌌", "🐉", "🤖"];

export const AVATAR_OPTIONS = palettes.map(([from, to], i) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
    <defs><linearGradient id='g${i}' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='${from}'/><stop offset='100%' stop-color='${to}'/>
    </linearGradient></defs>
    <rect width='200' height='200' rx='28' fill='url(#g${i})'/>
    <text x='50%' y='54%' text-anchor='middle' font-size='110' dominant-baseline='middle'>${icons[i]}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
});

export const getAvatar = (url: string | null | undefined, fallbackIndex = 0) =>
  url && url.length > 0 ? url : AVATAR_OPTIONS[fallbackIndex % AVATAR_OPTIONS.length];
