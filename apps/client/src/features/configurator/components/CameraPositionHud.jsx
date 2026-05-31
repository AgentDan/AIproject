import { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';

/** Live world-space camera position; DOM updated only when values change (no console, minimal React churn). */
export function CameraPositionHud() {
  const { camera } = useThree();
  const labelRef = useRef(null);
  const last = useRef({ x: NaN, y: NaN, z: NaN });

  useFrame(() => {
    const { x, y, z } = camera.position;
    const l = last.current;
    if (l.x === x && l.y === y && l.z === z) return;
    l.x = x;
    l.y = y;
    l.z = z;
    const el = labelRef.current;
    if (el) {
      el.textContent = `Camera  X ${x.toFixed(2)}  Y ${y.toFixed(2)}  Z ${z.toFixed(2)}`;
    }
  });

  return (
    <Html prepend fullscreen style={{ pointerEvents: 'none' }}>
      <div
        className="rounded border border-slate-500/40 bg-slate-900/90 px-2 py-1 font-mono text-[11px] text-slate-100 shadow-sm"
        style={{ position: 'absolute', top: 8, left: 8 }}
      >
        <span ref={labelRef}>Camera  X —  Y —  Z —</span>
      </div>
    </Html>
  );
}
