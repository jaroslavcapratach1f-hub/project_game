/** Read the browser's notch/camera inset; callers keep a fallback for non-reporting devices. */
let probe;
/** @returns {number} largest physical left/right CSS safe-area inset in pixels */
export function screenSafeAreaSide() {
  if (typeof document === 'undefined' || !document.body) return 0;
  if (!probe) {
    probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px);';
    document.body.appendChild(probe);
  }
  const css = window.getComputedStyle(probe);
  return Math.max(parseFloat(css.paddingLeft) || 0, parseFloat(css.paddingRight) || 0);
}
