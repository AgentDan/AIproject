import { useState } from 'react';

function formatDisplayValue(value, integer) {
  if (value === null || value === undefined || (typeof value === 'number' && Number.isNaN(value))) {
    return '';
  }
  return integer ? String(Math.trunc(value)) : String(value);
}

/** Incomplete strings while typing (e.g. "-", "-.") before the number is complete. */
function parseNumber(raw, integer) {
  const t = raw.trim();
  if (t === '' || t === '-' || t === '+' || t === '.' || t === '-.' || t === '+.') return null;
  const v = integer ? parseInt(t, 10) : parseFloat(t);
  return Number.isNaN(v) ? null : v;
}

export function PanelLabNumberInput({ label, value, onChange, min, max, step = 0.1, integer = false }) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(() => formatDisplayValue(value, integer));
  const displayValue = focused ? text : formatDisplayValue(value, integer);

  const clamp = (v) => {
    let x = v;
    if (typeof min === 'number' && Number.isFinite(min)) x = Math.max(min, x);
    if (typeof max === 'number' && Number.isFinite(max)) x = Math.min(max, x);
    return x;
  };

  return (
    <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
      <span>{label}</span>
      <input
        type="number"
        step={step}
        value={displayValue}
        onFocus={() => {
          setText(formatDisplayValue(value, integer));
          setFocused(true);
        }}
        onChange={(e) => {
          const raw = e.target.value;
          setText(raw);
          const v = parseNumber(raw, integer);
          if (v !== null) onChange(clamp(v));
        }}
        onBlur={() => {
          const v = parseNumber(text, integer);
          if (v === null) {
            setText(formatDisplayValue(value, integer));
          } else {
            onChange(clamp(v));
          }
          setFocused(false);
        }}
        className="px-2 py-1 rounded bg-white/90 border border-gray-500/60 text-[11px] text-gray-950"
      />
    </label>
  );
}
