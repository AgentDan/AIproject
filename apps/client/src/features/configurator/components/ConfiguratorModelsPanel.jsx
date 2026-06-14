import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { publicFetch } from '../../../api/authFetch.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import {
  DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE,
  LiquidGlassWorkspaceButton,
} from '../../../components/ui/LiquidGlass';
import { buildProjectCatalog, modelListKey } from '../domain/modelCatalog.js';
import { useConfiguratorStore } from '../store/configuratorStore.js';

/** Button row width (rem); unchanged when the gray panel grows wider. */
const BUTTON_ROW_MAX_REM = 17;

const MODEL_CHOICE_GLASS_TUNE = {
  ...DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE,
  maxWidthRem: BUTTON_ROW_MAX_REM,
  checkSizePx: 22,
  labelFontRem: 0.8125,
  scaleFontWithCheck: true,
};

/** Panel width cap 21.6rem; buttons stay centered with equal side padding. */
const PANEL_W = 'min(21.6rem,calc(100% - 2rem))';

function useIsAdminModeFromLocation() {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    const labKey = params.get('labKey');
    return Boolean(labKey && labKey.trim());
  }, [location.search]);
}

export function ConfiguratorModelsPanel() {
  const user = useAuthStore((s) => s.user);
  const isAdminMode = useIsAdminModeFromLocation();
  const navigate = useNavigate();
  const location = useLocation();

  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [panelExpanded, setPanelExpanded] = useState(true);

  const ownerUserId = user?.id;

  const load = useCallback(async () => {
    if (!ownerUserId) return;
    setIsLoading(true);
    setStatus(null);
    try {
      const res = await publicFetch(
        `/api/models?ownerUserId=${encodeURIComponent(ownerUserId)}`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to load models');
      const nextModels = Array.isArray(data.models) ? data.models : [];
      setModels(nextModels);
      useConfiguratorStore.getState().setProjects(buildProjectCatalog(nextModels));
    } catch (err) {
      setModels([]);
      useConfiguratorStore.getState().setProjects([]);
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [ownerUserId]);

  useEffect(() => {
    if (!ownerUserId || isAdminMode) return;
    load();
  }, [ownerUserId, isAdminMode, load]);

  /** First visit without modelKey: set URL to the first model so the scene matches the panel. */
  useEffect(() => {
    if (isAdminMode || !ownerUserId) return;
    if (isLoading || models.length === 0) return;

    const keys = models.map((m) => modelListKey(m)).filter(Boolean);
    const mk = new URLSearchParams(location.search).get('modelKey')?.trim() || '';
    if (mk && keys.includes(mk)) return;

    const first = keys[0];
    if (!first) return;

    const next = new URLSearchParams(location.search);
    next.delete('labKey');
    next.set('modelKey', first);
    navigate({ pathname: location.pathname, search: `?${next.toString()}` }, { replace: true });
  }, [
    isAdminMode,
    isLoading,
    models,
    location.pathname,
    location.search,
    navigate,
  ]);

  if (isAdminMode) return null;

  const params = new URLSearchParams(location.search);
  const currentModelKey = (params.get('modelKey') || '').trim();
  const modelKeys = models.map((m) => modelListKey(m)).filter(Boolean);
  const selectValue = modelKeys.includes(currentModelKey)
    ? currentModelKey
    : modelKeys[0] || '';

  const openModel = (modelKey) => {
    setPanelExpanded(false);
    const next = new URLSearchParams(location.search);
    next.delete('labKey');
    next.set('modelKey', modelKey);
    navigate({ pathname: location.pathname, search: `?${next.toString()}` }, { replace: false });
  };

  const panelChromeExpanded =
    'rounded-lg border border-gray-500 bg-gray-400/95 text-gray-950 shadow-lg shadow-black/25 pointer-events-auto transition-[width,max-width] duration-200 ease-out';
  /** Collapsed: same glass treatment as MainHeader (blur / saturation / opacity). */
  const panelChromeCollapsed =
    'rounded-lg border border-white/15 bg-gray-400/25 backdrop-blur-md backdrop-saturate-150 ' +
    'supports-[backdrop-filter]:bg-gray-400/20 shadow-none pointer-events-auto transition-[width,max-width] duration-200 ease-out';

  return (
    <aside
      className={`
        absolute z-20 left-4 top-24 bottom-auto
        flex flex-col items-stretch
        ${panelExpanded ? 'gap-3 max-h-[min(72vh,calc(100%-7rem))] overflow-y-auto overflow-x-hidden' : 'overflow-hidden p-0'}
        ${panelExpanded ? 'px-3 pt-3 pb-3' : ''}
        ${panelExpanded ? panelChromeExpanded : panelChromeCollapsed}
      `}
      style={
        panelExpanded
          ? { width: PANEL_W, maxWidth: PANEL_W }
          : { width: '2.75rem', minWidth: '2.75rem', maxWidth: '2.75rem', height: '2.75rem', minHeight: '2.75rem' }
      }
    >
      <button
        type="button"
        onClick={() => setPanelExpanded((v) => !v)}
        aria-expanded={panelExpanded}
        aria-controls="configurator-models-panel-body"
        aria-label={panelExpanded ? 'Collapse model picker' : 'Expand model picker'}
        className={`
          flex shrink-0 items-center justify-center focus:outline-none focus-visible:ring-2
          ${panelExpanded
            ? 'rounded-md text-gray-800 hover:bg-gray-500/35 focus-visible:ring-gray-600 mx-auto mb-0 h-8 w-8'
            : 'h-full w-full min-h-0 rounded-lg text-slate-100 hover:bg-white/15 focus-visible:ring-white/40'}
        `}
      >
        {panelExpanded ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {panelExpanded ? (
        <div id="configurator-models-panel-body" className="flex min-w-0 flex-col items-center gap-3">
          {status ? (
            <div
              className={`w-full shrink-0 text-center text-xs leading-snug px-0.5 ${status.type === 'error' ? 'text-red-800' : 'text-green-800'}`}
            >
              {status.message}
            </div>
          ) : null}

          <div className="flex w-full min-w-0 flex-col items-center justify-center gap-2">
            {isLoading ? (
              <div className="text-xs text-gray-800 text-center px-0.5">Loading…</div>
            ) : !ownerUserId ? (
              <div className="text-xs text-gray-800 text-center px-0.5 leading-snug">
                <Link to="/login" className="text-blue-800 underline hover:text-blue-950">
                  Sign in
                </Link>{' '}
                to load your 3D models.
              </div>
            ) : models.length === 0 ? (
              <div className="text-xs text-gray-800 text-center px-0.5 leading-snug">
                No models found. If you are an admin, assign an owner when uploading in <b>3D Library</b>.
              </div>
            ) : (
              <div
                role="radiogroup"
                aria-label="Model selection"
                className="flex w-full min-w-0 flex-col items-center gap-2"
              >
                {models.map((m) => {
                  const key = modelListKey(m);
                  const title = (m?.title || '').toString().trim();
                  const label = title || key;
                  const selected = key === selectValue;
                  return (
                    <div
                      key={m.id || key}
                      className="mx-auto w-full min-w-0 shrink-0"
                      style={{ maxWidth: `${BUTTON_ROW_MAX_REM}rem` }}
                    >
                      <LiquidGlassWorkspaceButton
                        className="min-w-0 w-full"
                        tune={MODEL_CHOICE_GLASS_TUNE}
                        label={label}
                        checked={selected}
                        onCheckedChange={(next) => {
                          if (next) openModel(key);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
