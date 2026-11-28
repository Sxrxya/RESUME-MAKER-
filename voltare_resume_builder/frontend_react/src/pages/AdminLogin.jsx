import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

/**
 * AdminLogin Component
 * 
 * Provides authenticated login for the Resume Masking Admin Dashboard.
 * Credentials:
 *   Username: Akashvoltare
 *   Password: U002
 */
export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect directly to dashboard
  useEffect(() => {
    try {
      if (sessionStorage.getItem('voltare_admin_auth') === 'true') {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch { }
  }, [navigate]);

  // Close modal and return to Resume Builder on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleClose = () => {
    navigate('/');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();
    if (!trimmedUser || !trimmedPass) {
      setFeedback({
        type: 'error',
        message: 'Please provide both username and password.'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Attempt backend authentication
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUser,
          password: trimmedPass,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('voltare_admin_auth', 'true');
        sessionStorage.setItem('voltare_admin_user', data.username || 'Akashvoltare');
        navigate('/admin/dashboard');
        return;
      }

      // Allow case-insensitive matching (e.g. u002 or U002, Akashvoltare or akashvoltare)
      if (trimmedUser.toLowerCase() === 'akashvoltare' && trimmedPass.toUpperCase() === 'U002') {
        sessionStorage.setItem('voltare_admin_auth', 'true');
        sessionStorage.setItem('voltare_admin_user', 'Akashvoltare');
        navigate('/admin/dashboard');
        return;
      }

      setFeedback({
        type: 'error',
        message: 'Invalid administrator credentials. Please check your username and password.'
      });
    } catch (_err) {
      // Graceful offline fallback
      if (trimmedUser.toLowerCase() === 'akashvoltare' && trimmedPass.toUpperCase() === 'U002') {
        sessionStorage.setItem('voltare_admin_auth', 'true');
        sessionStorage.setItem('voltare_admin_user', 'Akashvoltare');
        navigate('/admin/dashboard');
        return;
      }
      setFeedback({
        type: 'error',
        message: 'Invalid administrator credentials. Please check your username and password.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Top Header */}
      <Header subtitle="Administrative Portal" />

      {/* Main Admin Page Area with Backdrop and Centered Modal */}
      <main className="admin-page-content" onClick={handleBackdropClick}>
        <div
          className="admin-modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            className="admin-modal-close-btn"
            onClick={handleClose}
            aria-label="Close Admin Login and return to Resume Builder"
            title="Return to Resume Builder (Esc)"
          >
            ✕
          </button>

          {/* Modal Header */}
          <div className="admin-modal-header">
            <div className="admin-icon-badge" aria-hidden="true">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 id="admin-modal-title" className="admin-modal-title">Admin Login</h1>
            <p className="admin-modal-subtitle">
              Sign in to access the Resume Masking Administrator Dashboard
            </p>
          </div>

          {/* Login Form */}
          <form className="admin-form" onSubmit={handleSubmit} noValidate>
            {/* Username Input Field */}
            <div className="admin-field-group">
              <label htmlFor="admin-username" className="admin-field-label">
                <span>Username</span>
              </label>
              <div className="admin-input-wrapper">
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  className="voltare-input admin-input"
                  placeholder="Enter administrator username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Password Input Field */}
            <div className="admin-field-group">
              <label htmlFor="admin-password" className="admin-field-label">
                <span>Password</span>
              </label>
              <div className="admin-input-wrapper">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="voltare-input admin-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Status / Feedback Banner */}
            {feedback && (
              <div
                className={`admin-feedback-banner ${feedback.type}`}
                role="status"
              >
                {feedback.message}
              </div>
            )}

            {/* Login Action Button */}
            <button
              type="submit"
              className="voltare-btn admin-submit-btn"
              disabled={isLoading}
            >
              <span>{isLoading ? 'Verifying...' : 'Login'}</span>
            </button>
          </form>

          {/* Modal Footer with navigation back */}
          <div className="admin-modal-footer">
            <button
              type="button"
              className="admin-back-btn"
              onClick={handleClose}
            >
              ← Return to Resume Builder
            </button>
            <span className="admin-scope-badge">
              Protected Administrator Area
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
