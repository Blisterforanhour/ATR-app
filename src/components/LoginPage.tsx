import React, { useState } from 'react';
import { Mail, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage('Magic link sent! Redirecting...');

    try {
      await login(email);
    } catch (error) {
      setMessage('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="pulse-glow">
        <div className="hero-border">
          <div className="login-container">
            <div className="login-hero">
              <div className="float login-icon">
                <Zap size={48} className="mx-auto text-quantum-cyan" style={{ color: 'var(--quantum-cyan)' }} />
              </div>
              <h1 className="login-title">
                Africa Tennis
              </h1>
              <p className="login-subtitle">
                Enter the future of competitive tennis
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-form-group">
                <label htmlFor="email" className="login-form-label">
                  Email Address
                </label>
                <div className="login-input-container">
                  <Mail size={20} className="login-input-icon" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                    placeholder="your@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="login-submit-btn"
              >
                {isLoading ? (
                  <div className="loading-spinner w-5 h-5"></div>
                ) : (
                  <>
                    <span>Enter the Arena</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {message && (
                <p className="login-message">
                  {message}
                </p>
              )}
            </form>

            <div className="login-footer">
              <p className="login-footer-text">
                Passwordless authentication • Secure • Instant
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;