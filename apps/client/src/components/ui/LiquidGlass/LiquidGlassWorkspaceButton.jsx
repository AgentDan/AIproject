import React, { useCallback, useMemo, useState } from 'react';
import {
  DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE,
  liquidGlassWorkspaceDims,
} from './liquidGlassWorkspaceDims.js';

function CheckOffRing({ boxPx, borderPx, checkOffShadow, className = '' }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full border-gray-400/70 bg-white/10 ${className}`}
      style={{
        width: boxPx,
        height: boxPx,
        borderWidth: borderPx,
        borderStyle: 'solid',
        boxSizing: 'border-box',
        flexShrink: 0,
        boxShadow: checkOffShadow,
      }}
      aria-hidden
    />
  );
}

function PurpleCheckIcon({ boxPx, glyphPx, checkShadow, strokeW, className = '' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#9333ea] ${className}`}
      style={{
        width: boxPx,
        height: boxPx,
        boxSizing: 'border-box',
        flexShrink: 0,
        boxShadow: checkShadow,
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 12 12"
        style={{ width: glyphPx, height: glyphPx }}
        className="text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 6.2 5.1 8.8 9.8 3.2" />
      </svg>
    </span>
  );
}

const GLASS_STACK_LAYOUT = `
[grid-template-areas:'stack'] justify-items-stretch items-start overflow-visible
`;

const GLASS_BG = `
bg-[linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0.08)),
radial-gradient(circle_at_85%_85%,rgba(255,255,255,0.6)_0%,transparent_60%),
radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.18)_0%,transparent_50%)]
`;

/**
 * Glass row button with a toggle indicator (check / empty ring).
 * Uncontrolled (`defaultChecked`) or controlled (`checked` + `onCheckedChange`).
 *
 * @param {{
 *   tune?: typeof DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE,
 *   label?: string,
 *   checked?: boolean,
 *   defaultChecked?: boolean,
 *   onCheckedChange?: (next: boolean) => void,
 *   className?: string,
 * }} props
 */
export function LiquidGlassWorkspaceButton({
  tune = DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE,
  label = 'Workspace',
  checked: checkedProp,
  defaultChecked = true,
  onCheckedChange,
  className = '',
}) {
  const d = useMemo(() => liquidGlassWorkspaceDims(tune), [tune]);
  const isControlled = checkedProp !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const checked = isControlled ? checkedProp : uncontrolledChecked;

  const setChecked = useCallback(
    (next) => {
      if (!isControlled) setUncontrolledChecked(next);
      onCheckedChange?.(next);
    },
    [isControlled, onCheckedChange],
  );

  const toggle = useCallback(() => {
    setChecked(!checked);
  }, [checked, setChecked]);

  const gridStyle = {
    ['--ws-active']: `${d.activeNudge}px`,
    ['--ws-soff']: `${d.shadowOff}px`,
    ['--ws-soffa']: `${d.shadowOffActive}px`,
    ['--ws-below']: `${d.belowLift}px`,
    ['--ws-below-a']: `${d.belowLiftActive}px`,
  };

  const btnStyle = {
    gap: d.gap,
    paddingLeft: d.padL,
    paddingRight: d.padR,
    paddingTop: d.padY,
    paddingBottom: d.padY,
    borderRadius: d.radius,
    borderWidth: d.borderW,
    borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,0.2)',
    backdropFilter: `blur(${d.blurGlass}px)`,
    WebkitBackdropFilter: `blur(${d.blurGlass}px)`,
    boxShadow: d.boxShadow,
    ['--ws-spec-bw']: `${d.specBeforeW}px`,
    ['--ws-spec-bh']: `${d.specBeforeH}px`,
    ['--ws-spec-aw']: `${d.specAfterW}px`,
    ['--ws-spec-ah']: `${d.specAfterH}px`,
    ['--ws-radius']: `${d.radius}px`,
  };

  const labelStyle = {
    fontSize: `${d.fontRem}rem`,
    letterSpacing: `${d.tracking}em`,
  };

  const shadowLayerStyle = {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgb(75 85 99)',
    backgroundColor: 'rgba(156, 163, 175, 0.4)',
    filter: `blur(${d.blurSil}px)`,
    borderRadius: d.radius,
  };

  /** No filter on the button row: saturate/etc. skewed active vs idle height. */
  const rowMinHeight = d.padY * 2 + d.check + d.borderW * 2;

  return (
    <div
      className={`ws-stack relative grid w-full ${GLASS_STACK_LAYOUT} ${className}`.trim()}
      style={gridStyle}
    >
      <style>{`
        .ws-stack .ws-glass-btn:active {
          transform: translate3d(var(--ws-active), var(--ws-active), 0);
        }
        .ws-stack .ws-shadow-layer {
          transform: translate3d(var(--ws-soff), var(--ws-soff), 0);
        }
        .ws-stack .peer:active ~ .ws-shadow-layer {
          transform: translate3d(var(--ws-soffa), var(--ws-soffa), 0);
        }
        .ws-stack .ws-below-glare {
          transform: translate3d(0, calc(-1 * var(--ws-below)), 0);
        }
        .ws-stack .peer:active ~ .ws-below-glare {
          transform: translate3d(0, calc(-1 * var(--ws-below-a)), 0);
        }
        .ws-glass-btn::before {
          content: '';
          pointer-events: none;
          position: absolute;
          top: 0;
          left: 1px;
          z-index: 1;
          width: min(8.4%, var(--ws-spec-bw));
          height: min(19%, var(--ws-spec-bh));
          overflow: hidden;
          border-top-left-radius: var(--ws-radius);
          filter: blur(0);
          background: radial-gradient(
            ellipse 135% 135% at 0% 0%,
            rgba(255, 255, 255, 0.86) 0%,
            rgba(255, 255, 255, 0.18) 52%,
            transparent 88%
          );
          opacity: 0.7;
        }
        .ws-glass-btn::after {
          content: '';
          pointer-events: none;
          position: absolute;
          bottom: 1px;
          right: 1px;
          z-index: 1;
          width: min(10.1%, var(--ws-spec-aw));
          height: min(22.8%, var(--ws-spec-ah));
          overflow: hidden;
          border-bottom-right-radius: var(--ws-radius);
          filter: blur(0.5px);
          background: radial-gradient(
            ellipse 135% 135% at 100% 100%,
            rgba(255, 255, 255, 0.86) 0%,
            rgba(255, 255, 255, 0.18) 52%,
            transparent 88%
          );
          opacity: 1;
        }
      `}</style>
      <button
        type="button"
        aria-pressed={checked}
        onClick={toggle}
        style={{ ...btnStyle, minHeight: rowMinHeight }}
        className={`
          ws-glass-btn
          peer
          [grid-area:stack]
          relative z-10 isolate
          flex w-full min-w-0 items-center justify-start overflow-visible text-left
          ${GLASS_BG}
          font-medium leading-snug
          transition-[color,opacity,transform,box-shadow] duration-200
          [text-shadow:none]
          text-gray-800
        `}
      >
        <span className="relative z-10 shrink-0 overflow-visible flex items-center justify-center" style={{ width: d.check, height: d.check }}>
          {checked ? (
            <PurpleCheckIcon
              boxPx={d.check}
              glyphPx={d.glyph}
              checkShadow={d.checkShadow}
              strokeW={d.strokeW}
            />
          ) : (
            <CheckOffRing
              boxPx={d.check}
              borderPx={d.checkRingBorderPx}
              checkOffShadow={d.checkOffShadow}
            />
          )}
        </span>
        <span
          style={labelStyle}
          className={`relative z-10 min-w-0 flex-1 truncate [text-shadow:none] drop-shadow-none ${checked ? '' : 'text-gray-800/50'}`}
        >
          {label}
        </span>
      </button>

      <div
        className="ws-shadow-layer pointer-events-none [grid-area:stack] z-0 w-full min-w-0 box-border transition-all duration-200"
        style={shadowLayerStyle}
        aria-hidden
      >
        <div
          className="invisible flex w-full min-w-0 items-center select-none leading-snug font-medium text-gray-800"
          style={{ gap: d.gap, padding: `${d.padY}px ${d.padR}px ${d.padY}px ${d.padL}px` }}
        >
          <span className="shrink-0" style={{ width: d.check, height: d.check }} />
          <span className="min-w-0 flex-1 truncate" style={labelStyle}>
            {label}
          </span>
        </div>
      </div>

      <div
        className="ws-below-glare pointer-events-none [grid-area:stack] absolute top-full left-0 z-[5] w-full transition-all duration-200"
        style={{ height: `min(25%, ${d.belowHRem}rem)` }}
        aria-hidden
      >
        <div
          className="pointer-events-none absolute top-0 h-full overflow-hidden opacity-80"
          style={{
            right: -d.glareRight,
            width: `min(13%, ${d.glareW}px)`,
            borderBottomRightRadius: d.radius,
            filter: `blur(${d.blurLow}px)`,
            background:
              'radial-gradient(ellipse 135% 135% at 100% 100%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.2) 52%, transparent 88%)',
          }}
        />
      </div>
    </div>
  );
}
