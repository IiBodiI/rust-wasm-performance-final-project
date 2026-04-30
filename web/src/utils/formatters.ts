export function formatMs(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  if (value < 1) return `${value.toFixed(3)} ms`;
  if (value < 100) return `${value.toFixed(2)} ms`;
  return `${value.toFixed(1)} ms`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function formatRatio(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio <= 0) return "n/a";
  return `${ratio.toFixed(ratio >= 10 ? 1 : 2)}x`;
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  return `${value.toFixed(1)}%`;
}

export function browserLabel(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Microsoft Edge";
  if (ua.includes("Chrome/")) return "Chrome / Chromium";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Safari/")) return "Safari";
  return "Unknown browser";
}

