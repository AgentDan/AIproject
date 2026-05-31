export function AdminDashboard() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-xl shadow-inner shadow-black/20">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-300" />
            <span className="text-sm text-white/80 font-medium">Liquid Glass Kit</span>
          </div>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight mt-3">Admin dashboard</h2>
          <p className="text-xs text-white/50 mt-1">
            Glass-style showcase: blur, translucency, and soft shadows.
          </p>
        </div>
      </div>

      {/* Main showcase block */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-inner shadow-black/20 shadow-[0_25px_80px_-55px_rgba(0,0,0,0.95)] p-4 md:p-5">
        <div className="pointer-events-none absolute -top-20 -left-16 w-64 h-64 rounded-full bg-fuchsia-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-28 w-[26rem] h-[26rem] rounded-full bg-cyan-300/12 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />

        <div className="relative grid gap-4 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-inner shadow-black/20 p-4">
              <div className="text-[11px] uppercase tracking-widest text-white/60">Tabs & toggles</div>

              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-center rounded-2xl py-3 bg-gradient-to-r from-fuchsia-500/50 to-cyan-400/30 border border-white/10 hover:from-fuchsia-400/55 hover:to-cyan-300/35 transition-colors"
                >
                  <span className="text-sm font-semibold text-white/90">decotdary</span>
                </button>

                <button
                  type="button"
                  className="w-full flex items-center justify-center rounded-2xl py-3 bg-gradient-to-r from-emerald-300/25 to-cyan-300/15 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <span className="text-sm font-semibold text-emerald-100">Secondary</span>
                </button>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 shadow-inner shadow-black/20 hover:bg-white/10 transition-colors flex items-center justify-center"
                  aria-label="Add"
                >
                  <span className="text-xl leading-none text-white/80">+</span>
                </button>

                <div className="flex-1">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between rounded-2xl px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-inner shadow-black/20"
                  >
                    <span className="text-xs text-white/70">Create workspace</span>
                    <span className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {/* Search icon */}
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M21 21l-4.3-4.3" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-2xl px-4 py-3 bg-white/5 border border-white/10 shadow-inner shadow-black/20">
                <span className="text-xs text-white/70">workspace</span>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-400/15 border border-emerald-400/30">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-200" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="relative flex-1 rounded-2xl px-4 py-2 bg-white/5 border border-white/10 text-xs text-white/70 hover:bg-white/10 transition-colors"
              >
                Toast
                <span className="pointer-events-none absolute left-4 bottom-0 w-10 h-[3px] rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-300 shadow-[0_10px_30px_-15px_rgba(0,255,200,0.35)]" />
              </button>
              <button
                type="button"
                className="flex-1 rounded-2xl px-4 py-2 bg-white/5 border border-white/10 text-xs text-white/70 hover:bg-white/10 transition-colors"
              >
                Tabs
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-inner shadow-black/20 p-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-widest text-white/60">Project search</div>
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-white/60 text-xs">○</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-2xl px-3 py-2 bg-white/5 border border-white/10">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 21l-4.3-4.3" />
                    <circle cx="11" cy="11" r="7" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="w-full bg-transparent outline-none text-xs text-white/80 placeholder:text-white/40"
                  />
                </div>

                <button
                  type="button"
                  className="w-11 h-11 rounded-2xl bg-gradient-to-br from-fuchsia-500/55 to-cyan-400/45 border border-white/15 shadow-[0_20px_60px_-40px_rgba(0,255,200,0.6)] hover:from-fuchsia-400/60 hover:to-emerald-400/35 transition-colors"
                  aria-label="Add"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/90 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl px-3 py-2 bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-emerald-200" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-xs text-white/80">Search projects...</span>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-2xl px-3 py-2 bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-cyan-200" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-xs text-white/70">files</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M16 18l6-6-6-6" />
                      <path d="M4 12h18" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-500/10 to-cyan-400/10 backdrop-blur-xl shadow-inner shadow-black/20 p-4 relative overflow-hidden">
              <div className="pointer-events-none absolute -top-20 -right-24 w-72 h-72 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="relative">
                <div className="text-[11px] uppercase tracking-widest text-white/60">Member invite</div>
                <div className="mt-2 text-lg font-semibold">Invite member</div>
                <p className="text-xs text-white/50 mt-1">Upgrade plan</p>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 hover:bg-white/10 transition-colors shadow-inner shadow-black/20"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                    Update plan
                  </button>
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-xs text-white/60">+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
