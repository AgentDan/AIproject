import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth';

const TITLES = {
  '/': 'Home',
  '/assistant': 'AI Assistant',
  '/configurator': 'Configurator',
  '/login': 'Login',
  '/register': 'Register',
};

/** Standard pages: same chrome as the model picker rail. */
const headerBar =
  'bg-gray-400 text-gray-950 border-b border-gray-500';
const navLink =
  'text-sm text-gray-800 hover:text-gray-950 transition-colors';
const navMuted = 'text-sm text-gray-800';

/** Over full-viewport 3D / long home scroll: fixed glass bar, light nav text. */
const overlayBar =
  'fixed top-0 left-0 right-0 z-50 pointer-events-auto ' +
  'bg-gray-400/25 backdrop-blur-md backdrop-saturate-150 ' +
  'supports-[backdrop-filter]:bg-gray-400/20 border-b border-white/15';
const overlayNavLink =
  'text-sm text-slate-100/95 hover:text-white transition-colors';
const overlayNavMuted = 'text-sm text-slate-200/90';

const iconClass = 'h-5 w-5 shrink-0';

function IconHome({ className = iconClass }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function IconCube({ className = iconClass }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function IconUser({ className = iconClass }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function IconLogin({ className = iconClass }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
      />
    </svg>
  );
}

function IconLogout({ className = iconClass }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}

function IconCog({ className = iconClass }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function MainHeader({ overlay = false }) {
  const location = useLocation();
  const title = TITLES[location.pathname] ?? 'App';
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const onConfigurator = location.pathname === '/configurator';

  const bar = overlay ? overlayBar : headerBar;
  const linkCls = overlay ? overlayNavLink : navLink;
  const mutedCls = overlay ? overlayNavMuted : navMuted;
  const titleCls = overlay
    ? 'text-xl font-semibold text-center flex-1 min-w-0 truncate px-2 text-white'
    : 'text-xl font-semibold text-center flex-1 min-w-0 truncate px-2 text-gray-950';

  return (
    <header
      className={`px-4 py-4 flex items-center justify-between ${bar} ${
        overlay ? '' : 'relative z-50 shrink-0'
      }`}
    >
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className={`inline-flex items-center justify-center rounded-md p-2 ${linkCls}`}
          aria-label="Home"
        >
          <IconHome />
        </Link>
        {!onConfigurator && (
          <>
            <Link to="/assistant" className={`flex items-center gap-1.5 ${linkCls}`}>
              <IconCube />
              Assistant
            </Link>
            <Link to="/configurator" className={`flex items-center gap-1.5 ${linkCls}`}>
              <IconCube />
              Configurator
            </Link>
          </>
        )}
      </div>
      <h1 className={titleCls}>
        {title}
      </h1>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className={`flex items-center gap-1.5 ${mutedCls} font-medium`}>
              <IconUser />
              {user.nickname}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className={`inline-flex items-center justify-center rounded-md p-2 ${linkCls}`}
              aria-label="Log out"
            >
              <IconLogout />
            </button>
          </>
        ) : (
          <>
            <span className={`flex items-center gap-1.5 ${mutedCls}`}>
              <IconUser />
              Authorize yourself
            </span>
            <Link
              to="/login"
              className={`flex items-center gap-1.5 ${linkCls}`}
              aria-label="Log in"
            >
              <IconLogin />
              Log in
            </Link>
          </>
        )}
        {user?.role === 'administrator' && (
          <Link
            to="/admin"
            className={`inline-flex items-center justify-center rounded-md p-2 ${linkCls}`}
            aria-label="Admin panel"
          >
            <IconCog />
          </Link>
        )}
      </div>
    </header>
  );
}
