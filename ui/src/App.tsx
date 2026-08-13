import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthScreen } from './screens/AuthScreen';
import { useAuthStore } from './stores/authStore';

const DashboardScreen = lazy(() => import('./screens/DashboardScreen').then((module) => ({ default: module.DashboardScreen })));
const GraphWorkspaceScreen = lazy(() => import('./screens/GraphWorkspaceScreen').then((module) => ({ default: module.GraphWorkspaceScreen })));
const AddNodeScreen = lazy(() => import('./screens/AddNodeScreen').then((module) => ({ default: module.AddNodeScreen })));
const SettingsScreen = lazy(() => import('./screens/SettingsScreen').then((module) => ({ default: module.SettingsScreen })));

function RouteLoadingState(): JSX.Element {
  return <div className="min-h-screen bg-[#0c0e14] flex items-center justify-center text-[#3a7bd5] font-mono text-sm">LOADING SECURE WORKSPACE…</div>;
}

export const App: React.FC = () => {
  const { currentUser, isAppReady, initializeAuth, logout, intentionalBackground, setIntentionalBackground } = useAuthStore();

  useEffect(() => {
    void initializeAuth();
    const appStateListener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive && !intentionalBackground) logout();
      if (isActive && intentionalBackground) setIntentionalBackground(false);
    });
    return () => { void appStateListener.then((listener) => listener.remove()); };
  }, [initializeAuth, logout, intentionalBackground, setIntentionalBackground]);

  if (!isAppReady) return <RouteLoadingState />;
  if (!currentUser) return <AuthScreen />;

  return (
    <Router>
      <Suspense fallback={<RouteLoadingState />}>
        <Routes>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/workspace" element={<GraphWorkspaceScreen />} />
          <Route path="/add" element={<AddNodeScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};
