const pipelineSteps = [
  'Client Request',
  'Scene Context',
  'AI Action Plan',
  'Scene Execution',
  'Client Response'
];

const sceneObjects = [
  { name: 'Product Chair', status: 'selected', markerClass: 'bg-cyan-300' },
  { name: 'Display Table', status: 'ready', markerClass: 'bg-violet-300' },
  { name: 'Floor Plane', status: 'locked', markerClass: 'bg-emerald-300' }
];

const resultItems = [
  'Detected intent: move_object',
  'Action plan validated',
  'Scene diff ready for review'
];

export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/30 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              AI Product Scene Platform
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              MVP client shell for AI-controlled 3D product scenes.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              One page for loading a GLB or GLTF scene, sending voice or text
              commands, previewing scene updates, reviewing results, and
              downloading the updated scene.
            </p>
          </div>

          <div className="grid min-w-64 gap-3 rounded-2xl bg-slate-900/80 p-4">
            <p className="text-sm font-medium text-slate-400">MVP Pipeline</p>
            {pipelineSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400 font-bold text-slate-950">
                  {index + 1}
                </span>
                <span className="font-medium text-slate-100">{step}</span>
              </div>
            ))}
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr_360px]">
          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Scene Input
              </p>
              <div className="mt-5 rounded-2xl border border-dashed border-cyan-300/40 bg-slate-900/70 p-5 text-center">
                <p className="text-lg font-semibold text-white">Upload GLB / GLTF</p>
                <p className="mt-2 text-sm text-slate-400">
                  Drop a product scene here or choose a file from your device.
                </p>
                <button className="mt-5 rounded-full bg-cyan-400 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">
                  Choose Scene File
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Command Input
              </p>
              <label className="mt-5 block text-sm font-medium text-slate-300" htmlFor="command">
                Voice or text command
              </label>
              <textarea
                id="command"
                className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-slate-900 p-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
                placeholder="Move the selected chair 50 cm to the left..."
              />
              <div className="mt-4 flex gap-3">
                <button className="flex-1 rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">
                  Send Command
                </button>
                <button className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300">
                  Voice
                </button>
              </div>
            </section>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  3D Preview
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">Product Scene Workspace</h2>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
                <span className="rounded-full bg-white/10 px-3 py-1">Orbit</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Pan</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Zoom</span>
              </div>
            </div>

            <div className="mt-6 grid min-h-[520px] place-items-center rounded-3xl border border-cyan-300/20 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.18),_rgba(15,23,42,0.2)_35%,_rgba(2,6,23,1)_75%)] p-6">
              <div className="relative h-72 w-72">
                <div className="absolute inset-x-4 bottom-8 h-16 rounded-[50%] bg-cyan-400/10 blur-xl" />
                <div className="absolute left-12 top-16 h-40 w-40 rotate-12 rounded-3xl border border-cyan-200/40 bg-cyan-300/15 shadow-2xl shadow-cyan-500/20" />
                <div className="absolute right-10 top-24 h-32 w-32 -rotate-6 rounded-2xl border border-violet-200/40 bg-violet-300/15 shadow-2xl shadow-violet-500/20" />
                <div className="absolute bottom-14 left-1/2 h-24 w-56 -translate-x-1/2 rounded-2xl border border-emerald-200/30 bg-emerald-300/10" />
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Scene Controls
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {['Move', 'Color', 'Bounds', 'Measure'].map((action) => (
                  <button
                    key={action}
                    className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-white"
                  >
                    {action}
                  </button>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                {sceneObjects.map((object) => (
                  <div key={object.name} className="flex items-center justify-between rounded-2xl bg-slate-900/80 p-3">
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${object.markerClass}`} />
                      <span className="text-sm font-medium text-white">{object.name}</span>
                    </div>
                    <span className="text-xs uppercase tracking-wide text-slate-500">{object.status}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Result Viewer
              </p>
              <div className="mt-5 space-y-3">
                {resultItems.map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
              <button className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-100">
                Download Updated Scene
              </button>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
