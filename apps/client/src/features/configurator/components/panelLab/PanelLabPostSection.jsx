import { PanelLabNumberInput } from './PanelLabNumberInput.jsx';

export function PanelLabPostSection({ postprocessing, patchPostprocessing }) {
  const b = postprocessing.bloom;
  const v = postprocessing.vignette;

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-[11px] text-gray-700">
        <input
          type="checkbox"
          checked={postprocessing.enabled}
          onChange={(e) => patchPostprocessing({ enabled: e.target.checked })}
        />
        Post-processing (composer)
      </label>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">Bloom</div>
      <label className="flex items-center gap-2 text-[11px] text-gray-700">
        <input
          type="checkbox"
          checked={b.enabled}
          onChange={(e) => patchPostprocessing({ bloom: { ...b, enabled: e.target.checked } })}
        />
        Bloom
      </label>
      <PanelLabNumberInput
        label="Strength"
        value={b.strength}
        min={0}
        max={3}
        step={0.05}
        onChange={(val) => patchPostprocessing({ bloom: { ...b, strength: val } })}
      />
      <PanelLabNumberInput
        label="Radius"
        value={b.radius}
        min={0}
        max={1}
        step={0.01}
        onChange={(val) => patchPostprocessing({ bloom: { ...b, radius: val } })}
      />
      <PanelLabNumberInput
        label="Threshold"
        value={b.threshold}
        min={0}
        max={1}
        step={0.01}
        onChange={(val) => patchPostprocessing({ bloom: { ...b, threshold: val } })}
      />

      <div className="pt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">Vignette</div>
      <label className="flex items-center gap-2 text-[11px] text-gray-700">
        <input
          type="checkbox"
          checked={v.enabled}
          onChange={(e) => patchPostprocessing({ vignette: { ...v, enabled: e.target.checked } })}
        />
        Vignette
      </label>
      <PanelLabNumberInput
        label="Offset"
        value={v.offset}
        min={0}
        max={1}
        step={0.01}
        onChange={(val) => patchPostprocessing({ vignette: { ...v, offset: val } })}
      />
      <PanelLabNumberInput
        label="Darkness"
        value={v.darkness}
        min={0}
        max={1}
        step={0.01}
        onChange={(val) => patchPostprocessing({ vignette: { ...v, darkness: val } })}
      />
    </div>
  );
}
