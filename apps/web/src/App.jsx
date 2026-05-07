const modules = [
  'Voice / Text Command',
  '3D Preview',
  'Scene Controls',
  'Action Plan',
  'Scene Modules',
  'Client Response'
];

export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          AI Product Scene Platform
        </p>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Build and control 3D product scenes with AI.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A modular AI-orchestrated pipeline for voice and text commands,
              scene understanding, action planning, scene execution, and result
              visualization.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
                React Client
              </span>
              <span className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-slate-200">
                Node Server
              </span>
              <span className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-slate-200">
                Tailwind UI
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/40">
            <h2 className="text-xl font-semibold text-cyan-200">Pipeline Blocks</h2>
            <div className="mt-6 space-y-3">
              {modules.map((module, index) => (
                <div
                  key={module}
                  className="flex items-center gap-3 rounded-2xl bg-slate-900/80 p-4"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-slate-950">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-100">{module}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
