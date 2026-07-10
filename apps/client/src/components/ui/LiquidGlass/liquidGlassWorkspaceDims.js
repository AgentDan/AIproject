/** Reference checkbox side (px); scale factor r = checkSizePx / this. */
export const REF_CHECK_PX = 30;

/**
 * Workspace row tune: column width, checkbox, label type.
 * Highlights, shadows, gaps, radii scale from checkSizePx (and optionally font).
 */
export const DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE = {
  /** Max row width (rem), independent of checkbox size */
  maxWidthRem: 28,
  /** Square indicator side (px) — main proportion anchor */
  checkSizePx: 30,
  /** Label font size (rem) at reference 30px checkbox */
  labelFontRem: 1,
  /**
   * true — font + tracking scale with checkSizePx;
   * false — fixed labelFontRem; checkbox scales alone
   */
  scaleFontWithCheck: true,
};

/**
 * Pure: derive pixel sizes and shadow strings for the glass row.
 * @param {typeof DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE} tune
 */
export function liquidGlassWorkspaceDims(tune) {
  const r = tune.checkSizePx / REF_CHECK_PX;
  const fontR = tune.scaleFontWithCheck ? r : 1;
  const fontRem = tune.labelFontRem * fontR;
  const check = tune.checkSizePx;
  const glyph = Math.max(5, Math.round(check * (14 / REF_CHECK_PX)));
  const gap = Math.max(2, Math.round(10 * r));
  const padL = Math.max(4, Math.round(16 * r));
  const padR = Math.max(6, Math.round(24 * r));
  const padY = Math.max(2, Math.round((16 * (2 / 3) * 0.85 * r * 100) / 100));
  const radius = Math.max(4, Math.round(12 * r));
  const borderW = Math.max(1, Math.round(3 * r));
  const activeNudge = Math.max(1, Math.round(4 * r));
  const shadowOff = Math.max(6, Math.round(18 * r));
  const shadowOffActive = Math.max(4, Math.round(14 * r));
  const blurGlass = Math.max(1, Number((3 * r).toFixed(2)));
  const blurLow = Math.max(0.5, Number((3 * r).toFixed(2)));
  const blurSil = Math.max(1, Math.round(2 * r));
  const specBeforeW = Math.max(4, Math.round(13 * r));
  const specBeforeH = Math.max(2, Math.round(6 * r));
  const specAfterW = Math.max(6, Math.round(20 * r));
  const specAfterH = Math.max(4, Math.round(39 * r));
  const glareW = Math.max(8, Math.round(24 * r));
  const glareRight = Math.max(4, Math.round(12 * r));
  const belowLift = Math.max(2, Math.round(6 * r));
  const belowLiftActive = Math.max(2, Math.round(7 * r));
  const belowHRem = Number((12.45 * r).toFixed(3));
  const tracking = Number((0.02 * fontR).toFixed(4));

  const boxShadow = [
    `0 0 0 ${Math.max(0.5, 1 * r)}px rgba(255,255,255,0.1)`,
    `0 0 ${Math.max(2, 8 * r)}px ${Math.max(1, 2 * r)}px rgba(255,255,255,0.1)`,
    `0 ${Math.max(4, 14 * r)}px ${Math.max(12, 36 * r)}px rgba(0,0,0,0.22)`,
    `0 ${Math.max(2, 6 * r)}px ${Math.max(4, 16 * r)}px rgba(0,0,0,0.12)`,
    `0 ${Math.max(1, 2 * r)}px ${Math.max(2, 4 * r)}px rgba(0,0,0,0.08)`,
  ].join(', ');

  const checkShadow = [
    `0 ${Math.max(1, 3 * r)}px ${Math.max(2, 4 * r)}px rgba(0,0,0,0.22)`,
    `0 ${Math.max(4, 10 * r)}px ${Math.max(8, 28 * r)}px rgba(0,0,0,0.34)`,
    `0 ${Math.max(2, 5 * r)}px ${Math.max(4, 14 * r)}px rgba(147,51,234,0.36)`,
    `0 ${Math.max(1, 2 * r)}px ${Math.max(2, 6 * r)}px rgba(0,0,0,0.18)`,
  ].join(', ');

  /** Unchecked ring shadow (no purple halo), scales with r */
  const checkOffShadow = [
    `0 ${Math.max(1, 3 * r)}px ${Math.max(2, 4 * r)}px rgba(0,0,0,0.2)`,
    `0 ${Math.max(4, 10 * r)}px ${Math.max(8, 28 * r)}px rgba(0,0,0,0.32)`,
    `0 ${Math.max(2, 4 * r)}px ${Math.max(4, 12 * r)}px rgba(0,0,0,0.2)`,
    `0 ${Math.max(1, 1 * r)}px ${Math.max(2, 3 * r)}px rgba(0,0,0,0.12)`,
  ].join(', ');

  const checkRingBorderPx = Math.max(1, Math.round(2 * r));

  return {
    r,
    fontRem,
    tracking,
    check,
    glyph,
    gap,
    padL,
    padR,
    padY,
    radius,
    borderW,
    activeNudge,
    shadowOff,
    shadowOffActive,
    blurGlass,
    blurLow,
    blurSil,
    specBeforeW,
    specBeforeH,
    specAfterW,
    specAfterH,
    glareW,
    glareRight,
    belowLift,
    belowLiftActive,
    belowHRem,
    boxShadow,
    checkShadow,
    checkOffShadow,
    checkRingBorderPx,
    strokeW: Number((2.2 * r).toFixed(2)),
  };
}
