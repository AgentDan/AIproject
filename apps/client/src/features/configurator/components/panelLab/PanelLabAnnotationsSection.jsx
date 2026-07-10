import { DEFAULT_PANEL_LAB, ANNOTATIONS_MAX_ITEMS } from '@repo/panelLabSchema';
import { PanelLabNumberInput } from './PanelLabNumberInput.jsx';

const DEF = DEFAULT_PANEL_LAB.annotations;
const DEF_ITEM = DEF.items[0];

function newItemId() {
  return `ann-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function PanelLabAnnotationsSection({ annotations, patchAnnotations }) {
  const ann = annotations && typeof annotations === 'object' ? annotations : DEF;
  const items = Array.isArray(ann.items) ? ann.items : DEF.items.slice();

  const patchItems = (next) => {
    patchAnnotations({ items: next.slice(0, ANNOTATIONS_MAX_ITEMS) });
  };

  const addItem = () => {
    if (items.length >= ANNOTATIONS_MAX_ITEMS) return;
    patchItems([
      ...items,
      {
        id: newItemId(),
        label: '',
        text: '',
        position: [0, 0, 0],
        visible: true,
      },
    ]);
  };

  const removeItem = (idx) => {
    if (items.length <= 1) return;
    patchItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, patch) => {
    patchItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer items-center gap-2 text-[11px] text-gray-800">
        <input
          type="checkbox"
          className="rounded border-gray-400"
          checked={ann.enabled === true}
          onChange={(e) => patchAnnotations({ enabled: e.target.checked })}
        />
        <span>
          Annotations enabled (<span className="font-mono">annotations.enabled</span>)
        </span>
      </label>
      <p className="m-0 text-[10px] leading-snug text-gray-600">
        Markers use a billboard “i” at X/Y/Z. Body is <span className="font-mono">Markdown</span>. Max{' '}
        {ANNOTATIONS_MAX_ITEMS} items.
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={items.length >= ANNOTATIONS_MAX_ITEMS}
          onClick={addItem}
          className="flex h-7 min-w-[1.75rem] items-center justify-center rounded border border-gray-500/60 bg-white/90 px-2 text-base font-medium leading-none text-gray-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Add annotation"
          title={items.length >= ANNOTATIONS_MAX_ITEMS ? `Max ${ANNOTATIONS_MAX_ITEMS}` : 'Add annotation'}
        >
          +
        </button>
        <span className="text-[10px] text-gray-600">
          {items.length} / {ANNOTATIONS_MAX_ITEMS}
        </span>
      </div>
      {items.map((item, idx) => (
        <div
          key={item.id ?? `idx-${idx}`}
          className="space-y-1.5 overflow-hidden rounded border border-gray-500/35 bg-white/35 px-2 py-2"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] font-medium uppercase tracking-wide text-gray-600">
              Annotation {idx + 1}
            </span>
            <button
              type="button"
              disabled={items.length <= 1}
              onClick={() => removeItem(idx)}
              className="rounded border border-rose-500/50 bg-white/90 px-1.5 py-0.5 text-[10px] text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Remove
            </button>
          </div>
          <label className="flex cursor-pointer items-center gap-1 text-[10px] text-gray-800">
            <input
              type="checkbox"
              className="rounded border-gray-400"
              checked={item.visible !== false}
              onChange={(e) => updateItem(idx, { visible: e.target.checked })}
            />
            Visible
          </label>
          <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
            <span>Label (optional)</span>
            <input
              type="text"
              value={typeof item.label === 'string' ? item.label : ''}
              onChange={(e) => updateItem(idx, { label: e.target.value })}
              className="rounded border border-gray-500/60 bg-white/90 px-2 py-1 text-[11px] text-gray-950"
            />
          </label>
          <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
            <span>Markdown</span>
            <textarea
              value={typeof item.text === 'string' ? item.text : ''}
              onChange={(e) => updateItem(idx, { text: e.target.value })}
              rows={4}
              className="resize-y rounded border border-gray-500/60 bg-white/90 px-2 py-1 font-mono text-[11px] text-gray-950"
            />
          </label>
          <div className="grid grid-cols-3 gap-1">
            {['X', 'Y', 'Z'].map((axis, i) => (
              <PanelLabNumberInput
                key={axis}
                label={axis}
                value={Array.isArray(item.position) ? item.position[i] ?? 0 : DEF_ITEM.position[i]}
                min={-500}
                max={500}
                step={0.01}
                onChange={(v) => {
                  const base = Array.isArray(item.position) ? [...item.position] : [...DEF_ITEM.position];
                  base[i] = v;
                  updateItem(idx, { position: base });
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
