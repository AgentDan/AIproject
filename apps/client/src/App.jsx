import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AdminLayout, AdminDashboard, AdminRegister } from './features/admin/components/index.js';
import { AdminGuard } from './features/admin/AdminGuard.jsx';
import { LoginPage, RegisterPage } from './features/auth/index.js';
import { ConfiguratorPage } from './features/configurator/index.js';
import { HomePage } from './features/home/index.js';
import { ModelsAdmin } from './features/models/index.js';
import { MainLayout } from './layout/MainLayout.jsx';
import AppShell from './shell/AppShell.jsx';

function LabCloseOnLeave() {
  const location = useLocation();
  const prevLocationRef = useRef({ pathname: location.pathname, search: location.search });

  useEffect(() => {
    const prev = prevLocationRef.current;
    const currPath = location.pathname;
    const currSearch = location.search;
    if (prev.pathname === '/configurator' && currPath !== '/configurator') {
      const params = new URLSearchParams(prev.search);
      const labKey = params.get('labKey');
      if (labKey?.trim()) {
        fetch('/api/admin/lab/close', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: labKey.trim() })
        }).catch(() => {});
      }
    }
    prevLocationRef.current = { pathname: currPath, search: currSearch };
  }, [location.pathname, location.search]);

  return null;
}

export default function App() {
  return (
    <>
      <LabCloseOnLeave />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/assistant" element={<AppShell />} />
          <Route path="/configurator" element={<ConfiguratorPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<AdminGuard />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="register" element={<AdminRegister />} />
            <Route path="models" element={<ModelsAdmin />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
