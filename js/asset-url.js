/** Resolve app asset paths correctly on GitHub Pages (subpath) and local. */

export function resolveAsset(path) {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  const clean = String(path).replace(/^\.\//, "").replace(/^\//, "");
  const script = document.querySelector('script[type="module"][src*="app.js"]');
  if (script?.src) {
    try {
      return new URL(`../${clean}`, script.src).href;
    } catch {
      /* fall through */
    }
  }

  const base = document.querySelector("base")?.href;
  if (base) {
    try {
      return new URL(clean, base).href;
    } catch {
      /* fall through */
    }
  }

  return clean;
}
