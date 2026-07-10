import { DEFAULT_PANEL_LAB } from '@repo/panelLabSchema';
import { PanelLabNumberInput } from './PanelLabNumberInput.jsx';

const DEF_POS = DEFAULT_PANEL_LAB.camera.position;
const DEF_FOV = DEFAULT_PANEL_LAB.camera.fov;
const DEF_NEAR = DEFAULT_PANEL_LAB.camera.near;
const DEF_FAR = DEFAULT_PANEL_LAB.camera.far;

/** Camera: world location (X, Y, Z) + lens / clipping. Orbit pivot & look-at live under Controls. */
export function PanelLabCameraSection({ camera, patchCamera }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">
          Location — world position
        </div>
        <p className="m-0 text-[10px] leading-snug text-gray-600">
          Separate axes for where the camera sits in scene space. Orbit center and look-at are in{' '}
          <span className="font-medium text-gray-700">Controls (Orbit)</span>.
        </p>
        <p className="m-0 text-[10px] leading-snug text-gray-600">
          <span className="font-medium text-gray-700">On load:</span> viewer resets to schema defaults (location{' '}
          <span className="font-mono text-[10px]">
            [{DEF_POS.join(', ')}]
          </span>
          ), then merges <span className="font-mono text-[10px]">extras.panelLab</span> from the glTF when present —
          those values replace the defaults for that model.
        </p>
        <div className="grid grid-cols-3 gap-1">
          {['X', 'Y', 'Z'].map((axis, i) => (
            <PanelLabNumberInput
              key={axis}
              label={axis}
              value={camera.position[i]}
              min={-50}
              max={50}
              step={0.01}
              onChange={(v) => {
                const next = [...camera.position];
                next[i] = v;
                patchCamera({ position: next });
              }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">
          Lens & clipping{' '}
          <span className="font-normal normal-case text-gray-500">
            (defaults: FOV {DEF_FOV}°, near {DEF_NEAR}, far {DEF_FAR})
          </span>
        </div>
        <PanelLabNumberInput
          label="FOV (°)"
          value={camera.fov}
          min={10}
          max={120}
          step={1}
          integer
          onChange={(v) => patchCamera({ fov: v })}
        />
        <PanelLabNumberInput
          label="Near"
          value={camera.near}
          min={0.01}
          max={10}
          step={0.01}
          onChange={(v) => patchCamera({ near: v })}
        />
        <PanelLabNumberInput
          label="Far"
          value={camera.far}
          min={10}
          max={5000}
          step={10}
          integer
          onChange={(v) => patchCamera({ far: v })}
        />
      </div>
    </div>
  );
}
