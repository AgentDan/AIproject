import { PanelLabNumberInput } from './PanelLabNumberInput.jsx';

const TONE_OPTIONS = [
  'NoToneMapping',
  'LinearToneMapping',
  'ReinhardToneMapping',
  'CineonToneMapping',
  'ACESFilmicToneMapping',
  'AgXToneMapping',
  'NeutralToneMapping',
];

const OUTPUT_CS = ['SRGBColorSpace', 'LinearSRGBColorSpace', 'NoColorSpace'];

const SHADOW_TYPES = ['BasicShadowMap', 'PCFShadowMap', 'PCFSoftShadowMap', 'VSMShadowMap'];

export function PanelLabRendererSection({ renderer, patchRenderer }) {
  const sm = renderer.shadowMap;

  return (
    <div className="space-y-2">
      <PanelLabNumberInput
        label="Tone mapping exposure"
        value={renderer.toneMappingExposure}
        min={0}
        max={5}
        step={0.05}
        onChange={(v) => patchRenderer({ toneMappingExposure: v })}
      />
      <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
        <span>Tone mapping</span>
        <select
          value={renderer.toneMapping}
          onChange={(e) => patchRenderer({ toneMapping: e.target.value })}
          className="rounded border border-gray-500/60 bg-white/90 px-2 py-1 text-[11px] text-gray-950"
        >
          {TONE_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
        <span>Output color space</span>
        <select
          value={renderer.outputColorSpace}
          onChange={(e) => patchRenderer({ outputColorSpace: e.target.value })}
          className="rounded border border-gray-500/60 bg-white/90 px-2 py-1 text-[11px] text-gray-950"
        >
          {OUTPUT_CS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-[11px] text-gray-700">
        <input
          type="checkbox"
          checked={sm.enabled}
          onChange={(e) => patchRenderer({ shadowMap: { ...sm, enabled: e.target.checked } })}
        />
        Shadow map
      </label>
      <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
        <span>Shadow type</span>
        <select
          value={sm.type}
          onChange={(e) => patchRenderer({ shadowMap: { ...sm, type: e.target.value } })}
          className="rounded border border-gray-500/60 bg-white/90 px-2 py-1 text-[11px] text-gray-950"
        >
          {SHADOW_TYPES.map((o) => (
            <option key={o} value={o}>
              {o === 'PCFSoftShadowMap' ? `${o} (no extra blur in r182)` : o}
            </option>
          ))}
        </select>
        <span className="text-[10px] leading-snug text-amber-900/90">
          Soft shadow borders: use <strong>VSMShadowMap</strong>, then tune directional <strong>radius</strong> and{' '}
          <strong>blur samples</strong> in Lighting.
        </span>
      </label>
      <label className="flex items-center gap-2 text-[11px] text-gray-700">
        <input
          type="checkbox"
          checked={renderer.antialias}
          onChange={(e) => patchRenderer({ antialias: e.target.checked })}
        />
        Antialias (reload page to apply)
      </label>
      <label className="flex items-center gap-2 text-[11px] text-gray-700">
        <input
          type="checkbox"
          checked={renderer.physicallyCorrectLights}
          onChange={(e) => patchRenderer({ physicallyCorrectLights: e.target.checked })}
        />
        physicallyCorrectLights (stored in JSON)
      </label>
    </div>
  );
}
