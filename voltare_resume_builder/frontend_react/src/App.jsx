import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ResumeBuilder from './pages/ResumeBuilder';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

/**
 * HashRedirect Component
 * Ensures hash-based links (e.g. #/admin or #admin) correctly route to their target
 */
function HashRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#/admin' || hash === '#admin' || hash === '#/admin-login' || hash === '#admin-login') {
      navigate('/admin', { replace: true });
    } else if (hash === '#/admin/dashboard' || hash === '#/admin-dashboard' || hash === '#admin/dashboard') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [location, navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <HashRedirect />
      <Routes>
        {/* Main Resume Builder Route */}
        <Route path="/" element={<ResumeBuilder />} />

        {/* Dedicated Admin Login Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Dedicated Admin Dashboard Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Fallback to Resume Builder */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
