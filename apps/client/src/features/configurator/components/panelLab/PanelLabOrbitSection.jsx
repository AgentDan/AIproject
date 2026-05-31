import { DEFAULT_PANEL_LAB } from '@repo/panelLabSchema';
import { PanelLabNumberInput } from './PanelLabNumberInput.jsx';

const DEF_CTRL = DEFAULT_PANEL_LAB.controls;
const DEG = 180 / Math.PI;
const RAD = Math.PI / 180;

function rad2deg(r) {
  return Math.round(r * DEG * 100) / 100;
}

/** Panel Lab: orbit pivot (target) + zoom limits + polar/azimuth angle limits (UI in degrees). */
export function PanelLabOrbitSection({ controls, patchControls }) {
  const orbitTarget = Array.isArray(controls.target) ? controls.target : [0, 0, 0];
  const minD = typeof controls.minDistance === 'number' ? controls.minDistance : DEF_CTRL.minDistance;
  const maxD = typeof controls.maxDistance === 'number' ? controls.maxDistance : DEF_CTRL.maxDistance;

  const minPol =
    typeof controls.minPolarAngle === 'number' && Number.isFinite(controls.minPolarAngle)
      ? controls.minPolarAngle
      : DEF_CTRL.minPolarAngle;
  const maxPol =
    typeof controls.maxPolarAngle === 'number' && Number.isFinite(controls.maxPolarAngle)
      ? controls.maxPolarAngle
      : DEF_CTRL.maxPolarAngle;
  const minAz =
    typeof controls.minAzimuthAngle === 'number' && Number.isFinite(controls.minAzimuthAngle)
      ? controls.minAzimuthAngle
      : DEF_CTRL.minAzimuthAngle;
  const maxAz =
    typeof controls.maxAzimuthAngle === 'number' && Number.isFinite(controls.maxAzimuthAngle)
      ? controls.maxAzimuthAngle
      : DEF_CTRL.maxAzimuthAngle;

  const rotateSpeed =
    typeof controls.rotateSpeed === 'number' && Number.isFinite(controls.rotateSpeed)
      ? controls.rotateSpeed
      : DEF_CTRL.rotateSpeed;
  const zoomSpeed =
    typeof controls.zoomSpeed === 'number' && Number.isFinite(controls.zoomSpeed)
      ? controls.zoomSpeed
      : DEF_CTRL.zoomSpeed;
  const panSpeed =
    typeof controls.panSpeed === 'number' && Number.isFinite(controls.panSpeed)
      ? controls.panSpeed
      : DEF_CTRL.panSpeed;
  const dampingFactor =
    typeof controls.dampingFactor === 'number' && Number.isFinite(controls.dampingFactor)
      ? controls.dampingFactor
      : DEF_CTRL.dampingFactor;

  return (
    <div className="space-y-2">
      <div className="space-y-0.5">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">
          Orbit center — <span className="font-mono normal-case">target</span> (X, Y, Z)
        </div>
        <p className="text-[10px] leading-snug text-gray-600">
          World point the camera orbits around (<span className="font-mono">OrbitControls.target</span>).
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {['X', 'Y', 'Z'].map((axis, i) => (
          <PanelLabNumberInput
            key={axis}
            label={axis}
            value={orbitTarget[i] ?? 0}
            min={-50}
            max={50}
            step={0.01}
            onChange={(v) => {
              const next = [...orbitTarget];
              next[i] = v;
              patchControls({ target: next });
            }}
          />
        ))}
      </div>

      <div className="space-y-1 pt-1 border-t border-gray-500/30">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">Interaction</div>
        <p className="m-0 text-[10px] leading-snug text-gray-600">
          Flags and inertia match <span className="font-mono">OrbitControls</span> (drei).
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-800">
          <label className="flex cursor-pointer items-center gap-1">
            <input
              type="checkbox"
              className="rounded border-gray-400"
              checked={controls.enableRotate !== false}
              onChange={(e) => patchControls({ enableRotate: e.target.checked })}
            />
            Rotate
          </label>
          <label className="flex cursor-pointer items-center gap-1">
            <input
              type="checkbox"
              className="rounded border-gray-400"
              checked={controls.enablePan !== false}
              onChange={(e) => patchControls({ enablePan: e.target.checked })}
            />
            Pan
          </label>
          <label className="flex cursor-pointer items-center gap-1">
            <input
              type="checkbox"
              className="rounded border-gray-400"
              checked={controls.enableZoom !== false}
              onChange={(e) => patchControls({ enableZoom: e.target.checked })}
            />
            Zoom
          </label>
          <label className="flex cursor-pointer items-center gap-1">
            <input
              type="checkbox"
              className="rounded border-gray-400"
              checked={controls.enableDamping !== false}
              onChange={(e) => patchControls({ enableDamping: e.target.checked })}
            />
            Damping
          </label>
        </div>
        <PanelLabNumberInput
          label="Damping factor"
          value={dampingFactor}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => patchControls({ dampingFactor: v })}
        />
      </div>

      <div className="space-y-1 pt-1 border-t border-gray-500/30">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">Pointer sensitivity</div>
        <p className="m-0 text-[10px] leading-snug text-gray-600">
          <span className="font-mono">rotateSpeed</span> (drag orbit), <span className="font-mono">zoomSpeed</span>,{' '}
          <span className="font-mono">panSpeed</span> — Three.js default 1 each.
        </p>
        <div className="grid grid-cols-3 gap-1">
          <PanelLabNumberInput
            label="Rotate"
            value={rotateSpeed}
            min={0}
            max={10}
            step={0.05}
            onChange={(v) => patchControls({ rotateSpeed: v })}
          />
          <PanelLabNumberInput
            label="Zoom"
            value={zoomSpeed}
            min={0}
            max={10}
            step={0.05}
            onChange={(v) => patchControls({ zoomSpeed: v })}
          />
          <PanelLabNumberInput
            label="Pan"
            value={panSpeed}
            min={0}
            max={10}
            step={0.05}
            onChange={(v) => patchControls({ panSpeed: v })}
          />
        </div>
      </div>

      <div className="space-y-1 pt-1 border-t border-gray-500/30">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">Zoom limits</div>
        <p className="m-0 text-[10px] leading-snug text-gray-600">
          <span className="font-mono">minDistance</span> / <span className="font-mono">maxDistance</span> — how close /
          far the camera can dolly from <span className="font-mono">target</span> (perspective camera).
        </p>
        <div className="grid grid-cols-2 gap-1">
          <PanelLabNumberInput
            label="Min distance"
            value={minD}
            min={0}
            max={500}
            step={0.1}
            onChange={(v) => patchControls({ minDistance: Math.min(v, maxD) })}
          />
          <PanelLabNumberInput
            label="Max distance"
            value={maxD}
            min={0.1}
            max={5000}
            step={1}
            integer
            onChange={(v) => patchControls({ maxDistance: Math.max(v, minD) })}
          />
        </div>
      </div>

      <div className="space-y-1 pt-1 border-t border-gray-500/30">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">Angle limits (°)</div>
        <p className="m-0 text-[10px] leading-snug text-gray-600">
          Polar: tilt from the +Y pole (0° top → 180° bottom). Azimuth: rotation around vertical through{' '}
          <span className="font-mono">target</span>. Stored as radians; shown in degrees.
        </p>
        <div className="grid grid-cols-2 gap-1">
          <PanelLabNumberInput
            label="Min polar (°)"
            value={rad2deg(minPol)}
            min={-360}
            max={360}
            step={0.5}
            onChange={(deg) =>
              patchControls({ minPolarAngle: Math.min(deg * RAD, maxPol) })
            }
          />
          <PanelLabNumberInput
            label="Max polar (°)"
            value={rad2deg(maxPol)}
            min={-360}
            max={360}
            step={0.5}
            onChange={(deg) =>
              patchControls({ maxPolarAngle: Math.max(deg * RAD, minPol) })
            }
          />
          <PanelLabNumberInput
            label="Min azimuth (°)"
            value={rad2deg(minAz)}
            min={-720}
            max={720}
            step={0.5}
            onChange={(deg) =>
              patchControls({ minAzimuthAngle: Math.min(deg * RAD, maxAz) })
            }
          />
          <PanelLabNumberInput
            label="Max azimuth (°)"
            value={rad2deg(maxAz)}
            min={-720}
            max={720}
            step={0.5}
            onChange={(deg) =>
              patchControls({ maxAzimuthAngle: Math.max(deg * RAD, minAz) })
            }
          />
        </div>
      </div>
    </div>
  );
}
