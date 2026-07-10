import { Link } from 'react-router-dom';
import { useAuthStore } from '../auth/store/authStore.js';

const cards = [
  {
    to: '/assistant',
    title: 'AI Assistant',
    description: 'Голосовые и текстовые команды для сцены продукта.',
    accent: 'from-cyan-500/30 to-blue-600/20'
  },
  {
    to: '/configurator',
    title: '3D Configurator',
    description: 'Полноценный просмотр GLTF, варианты и Panel Lab.',
    accent: 'from-fuchsia-500/30 to-violet-600/20'
  }
];

export function HomePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-24">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-slate-400">AI Product Scene Platform</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
          Выберите режим работы
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          AI Assistant — быстрые команды и превью. Configurator — ручная настройка 3D-модели и Panel Lab.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className={`group rounded-2xl border border-white/10 bg-gradient-to-br ${card.accent} p-6 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/5`}
            >
              <h2 className="text-xl font-semibold text-white">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-200/90">{card.description}</p>
              <span className="mt-4 inline-block text-sm text-cyan-200 group-hover:text-cyan-100">
                Открыть →
              </span>
            </Link>
          ))}

          {user?.role === 'administrator' ? (
            <Link
              to="/admin"
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-slate-800/40 p-6 backdrop-blur-sm transition hover:border-white/20 md:col-span-2"
            >
              <h2 className="text-xl font-semibold text-white">Admin</h2>
              <p className="mt-2 text-sm text-slate-200/90">Пользователи, 3D Library, Lab и S3.</p>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
