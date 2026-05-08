export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/30">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              AI Product Scene Platform
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Voice and text control for 3D product scenes.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              For now, the MVP client contains only two parts: a command input
              for text or voice and a 3D preview area for the product scene.
            </p>
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="flex flex-col">
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
                  Send Text
                </button>
                <button className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300">
                  Speak
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
            </div>

            <div className="mt-6 grid min-h-[560px] place-items-center rounded-3xl border border-cyan-300/20 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.18),_rgba(15,23,42,0.2)_35%,_rgba(2,6,23,1)_75%)] p-6">
              <div className="relative h-72 w-72">
                <div className="absolute inset-x-4 bottom-8 h-16 rounded-[50%] bg-cyan-400/10 blur-xl" />
                <div className="absolute left-12 top-16 h-40 w-40 rotate-12 rounded-3xl border border-cyan-200/40 bg-cyan-300/15 shadow-2xl shadow-cyan-500/20" />
                <div className="absolute right-10 top-24 h-32 w-32 -rotate-6 rounded-2xl border border-violet-200/40 bg-violet-300/15 shadow-2xl shadow-violet-500/20" />
                <div className="absolute bottom-14 left-1/2 h-24 w-56 -translate-x-1/2 rounded-2xl border border-emerald-200/30 bg-emerald-300/10" />
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
