import { PanelLabNumberInput } from './PanelLabNumberInput.jsx';

export function PanelLabGroundSection({ ground, patchGround }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-[11px] text-gray-700">
        <input
          type="checkbox"
          checked={ground.enabled}
          onChange={(e) => patchGround({ enabled: e.target.checked })}
        />
        Ground plane (shadows)
      </label>
      <PanelLabNumberInput
        label="Size"
        value={ground.size}
        min={1}
        max={200}
        step={1}
        onChange={(v) => patchGround({ size: v })}
      />
      <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
        <span>Material color</span>
        <input
          type="color"
          value={ground.material.color}
          onChange={(e) =>
            patchGround({ material: { ...ground.material, color: e.target.value } })
          }
          className="h-6 w-16 rounded border border-gray-500/60 bg-white/90"
        />
      </label>
      <PanelLabNumberInput
        label="Opacity"
        value={ground.material.opacity}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => patchGround({ material: { ...ground.material, opacity: v } })}
      />
    </div>
  );
}
