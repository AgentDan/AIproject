import { Outlet, Link, useLocation } from 'react-router-dom';

function NavIcon({ name }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  if (name === 'dashboard') {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
        <path {...common} d="M4 13h6v7H4z" />
        <path {...common} d="M14 4h6v16h-6z" />
        <path {...common} d="M4 4h6v7H4z" />
      </svg>
    );
  }

  if (name === 'users') {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
        <path {...common} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle {...common} cx="9" cy="7" r="4" />
        <path {...common} d="M22 21v-2a3 3 0 0 0-2.2-2.9" />
        <path {...common} d="M16.5 3.3a4 4 0 0 1 0 7.4" />
      </svg>
    );
  }

  if (name === 'library') {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
        <path {...common} d="M12 2l9 5-9 5-9-5 9-5Z" />
        <path {...common} d="M3 7v10l9 5 9-5V7" />
        <path {...common} d="M12 12v10" />
      </svg>
    );
  }

  if (name === 'home') {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
        <path {...common} d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z" />
      </svg>
    );
  }

  // configurator (sliders)
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path {...common} d="M4 21v-7" />
      <path {...common} d="M4 10V3" />
      <path {...common} d="M12 21v-9" />
      <path {...common} d="M12 8V3" />
      <path {...common} d="M20 21v-5" />
      <path {...common} d="M20 12V3" />
      <path {...common} d="M2 14h4" />
      <path {...common} d="M10 12h4" />
      <path {...common} d="M18 16h4" />
    </svg>
  );
}

const nav = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/register', label: 'Users', icon: 'users' },
  { to: '/admin/models', label: '3D Library', icon: 'library' },
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/configurator', label: 'Configurator', icon: 'configurator' },
];

export function AdminLayout() {
  const location = useLocation();
  const activeNav = nav.find((n) => n.to === location.pathname);

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 overflow-hidden">
      {/* Liquid-style background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-44 -left-44 w-96 h-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute top-24 -right-56 w-[28rem] h-[28rem] rounded-full bg-cyan-400/18 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 w-96 h-96 rounded-full bg-emerald-400/14 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/60" />
      </div>

      <div className="relative z-0 w-full max-w-7xl mx-auto my-6 md:my-10 px-3">
        <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_90px_-40px_rgba(0,0,0,0.85)] shadow-black/40 overflow-hidden">
          {/* Glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-28 -left-20 w-[22rem] h-[22rem] rounded-full bg-fuchsia-400/10 blur-3xl" />
            <div className="absolute top-16 right-[-8rem] w-[26rem] h-[26rem] rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
          </div>

          <div className="relative flex flex-col md:flex-row">
            <aside className="w-full md:w-44 border-b md:border-b-0 md:border-r border-white/10 p-3 shrink-0 bg-gradient-to-b from-white/[0.08] to-white/[0.03] backdrop-blur-xl">
              <div className="flex items-center justify-between md:block">
                <h2 className="text-lg font-semibold mb-0 md:mb-4 px-2">Admin</h2>
                <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-400/15 border border-white/10 shadow-inner shadow-black/20">
                  <span className="text-xs text-white/70">GL</span>
                </div>
              </div>

              <nav className="mt-2 md:mt-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
                {nav.map(({ to, label, icon }) => {
                  const isActive = location.pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      aria-label={label}
                      title={label}
                      className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all border ${
                        isActive
                          ? 'bg-white/12 text-emerald-200 border-white/15 shadow-[0_10px_30px_-15px_rgba(0,255,200,0.35)]'
                          : 'hover:bg-white/6 text-slate-300 border-white/0'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r bg-gradient-to-b from-emerald-400 to-cyan-400" />
                      )}
                      <NavIcon name={icon} />
                    </Link>
                  );
                })}
              </nav>
            </aside>

            <main className="flex-1 p-3 md:p-4 overflow-auto">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-white/60">Liquid Glass Admin</div>
                    <h1 className="text-lg md:text-xl font-semibold tracking-tight">
                      {activeNav?.label || 'Admin'}
                    </h1>
                    <div className="text-xs text-white/50 mt-1">
                      Glass-style UI built with Tailwind only.
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 shadow-inner shadow-black/20">
                      Online
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-inner shadow-black/20 shadow-[0_25px_70px_-50px_rgba(0,0,0,0.9)] p-3 md:p-4">
                  <Outlet />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
