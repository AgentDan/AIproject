import { PanelLabNumberInput } from './PanelLabNumberInput.jsx';

export function PanelLabEnvironmentSection({ environment, patchEnvironment }) {
  const bg = environment.background;
  const hdri = environment.hdri;
  const fog = environment.fog;

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">Background</div>
      <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
        <span>Color (type: color)</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={bg.color}
            onChange={(e) => patchEnvironment({ background: { ...bg, color: e.target.value } })}
            className="h-6 w-8 rounded border border-gray-500/60 bg-white/90"
          />
          <input
            type="text"
            value={bg.color}
            onChange={(e) => patchEnvironment({ background: { ...bg, color: e.target.value } })}
            className="flex-1 rounded border border-gray-500/60 bg-white/90 px-2 py-1 font-mono text-[11px] text-gray-950"
          />
        </div>
      </label>
      <PanelLabNumberInput
        label="Background blur"
        value={bg.blur}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => patchEnvironment({ background: { ...bg, blur: v } })}
      />
      <PanelLabNumberInput
        label="Background intensity"
        value={bg.intensity}
        min={0}
        max={5}
        step={0.1}
        onChange={(v) => patchEnvironment({ background: { ...bg, intensity: v } })}
      />

      <div className="pt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">HDRI</div>
      <label className="flex items-center gap-2 text-[11px] text-gray-700">
        <input
          type="checkbox"
          checked={hdri.enabled}
          onChange={(e) => patchEnvironment({ hdri: { ...hdri, enabled: e.target.checked } })}
        />
        Enable HDRI
      </label>
      <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
        <span>URL (.hdr)</span>
        <input
          type="text"
          value={hdri.url}
          onChange={(e) => patchEnvironment({ hdri: { ...hdri, url: e.target.value } })}
          className="rounded border border-gray-500/60 bg-white/90 px-2 py-1 font-mono text-[11px] text-gray-950"
        />
      </label>
      <PanelLabNumberInput
        label="HDRI intensity"
        value={hdri.intensity}
        min={0}
        max={5}
        step={0.1}
        onChange={(v) => patchEnvironment({ hdri: { ...hdri, intensity: v } })}
      />
      <label className="flex items-center gap-2 text-[11px] text-gray-700">
        <input
          type="checkbox"
          checked={hdri.background}
          onChange={(e) => patchEnvironment({ hdri: { ...hdri, background: e.target.checked } })}
        />
        Use HDRI as visible background (otherwise reflections only)
      </label>

      <div className="pt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">Fog</div>
      <label className="flex items-center gap-2 text-[11px] text-gray-700">
        <input
          type="checkbox"
          checked={fog.enabled}
          onChange={(e) => patchEnvironment({ fog: { ...fog, enabled: e.target.checked } })}
        />
        Fog (linear)
      </label>
      <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
        <span>Fog color</span>
        <input
          type="color"
          value={fog.color}
          onChange={(e) => patchEnvironment({ fog: { ...fog, color: e.target.value } })}
          className="h-6 w-16 rounded border border-gray-500/60 bg-white/90"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <PanelLabNumberInput
          label="Near"
          value={fog.near}
          min={0}
          max={200}
          step={0.1}
          onChange={(v) => patchEnvironment({ fog: { ...fog, near: v } })}
        />
        <PanelLabNumberInput
          label="Far"
          value={fog.far}
          min={0}
          max={500}
          step={0.1}
          onChange={(v) => patchEnvironment({ fog: { ...fog, far: v } })}
        />
      </div>
    </div>
  );
}
