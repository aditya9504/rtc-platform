import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import SessionsPage from './pages/SessionsPage';
import ReviewsPage from './pages/ReviewsPage';
import PullRequestsPage from './pages/PullRequestsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Layout
import AppLayout from './components/layout/AppLayout';

// Socket init
import { initSocket } from './services/socket';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(s => s.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(s => s.auth);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  const { token, isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => {
    if (isAuthenticated && token) {
      initSocket(token);
    }
  }, [isAuthenticated, token]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a2235', color: '#E2E8F0', border: '1px solid #1e2d45' },
          success: { iconTheme: { primary: '#10B981', secondary: '#0B1020' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#0B1020' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="editor" element={<EditorPage />} />
          <Route path="editor/:sessionId" element={<EditorPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="pull-requests" element={<PullRequestsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
