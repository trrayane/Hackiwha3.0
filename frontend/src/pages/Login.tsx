import React, { useState } from 'react';
import { ApiError, forgotPassword } from '../lib/api';

export interface LoginFormData {
  email: string;
  password: string;
}

interface LoginProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  onSwitchToRegister: () => void;
}

export default function Login({ onSubmit, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitting(true);
    setForgotMessage(null);
    try {
      const res = await forgotPassword(forgotEmail);
      setForgotMessage(res.message);
    } catch (err) {
      setForgotMessage(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  const colors = {
    backgroundLeft: '#FCFBF6',
    headings: '#282900',
    secondaryText: '#5C6B4D',
    primaryAccent: '#337738',
    inputBg: '#F2F6F1',
    border: '#D9D9D9',
    white: '#FFFFFF',
    textMuted: '#7E7E7A',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ email, password });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: colors.backgroundLeft,
      fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>

      {/* LEFT COLUMN: FORM INTERFACE */}
      <div style={{
        flex: '1 1 45%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column' }}>

          {/* Header Typography */}
          <h1 style={{ fontSize: '36px', fontWeight: '700', color: colors.headings, margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '16px', color: colors.secondaryText, fontWeight: '500', margin: '0 0 36px 0' }}>
            Enter your details to access your dashboard.
          </p>

          {error && (
            <div style={{
              backgroundColor: '#FDEDED',
              border: '1px solid #D9383A',
              color: '#D9383A',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Input Element: Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '15px', fontWeight: '700', color: colors.headings }}>Email</label>
              <input
                type="email"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '10px',
                  padding: '0 16px',
                  boxSizing: 'border-box',
                  fontSize: '15px',
                  color: colors.headings,
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Input Element: Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
              <label style={{ fontSize: '15px', fontWeight: '700', color: colors.headings }}>Password</label>
              <input
                type="password"
                placeholder="............."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '10px',
                  padding: '0 16px',
                  boxSizing: 'border-box',
                  fontSize: '15px',
                  color: colors.headings,
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <span
                onClick={() => { setShowForgotPassword(true); setForgotMessage(null); setForgotEmail(email); }}
                style={{
                alignSelf: 'flex-end',
                fontSize: '14px',
                fontWeight: '700',
                color: colors.primaryAccent,
                cursor: 'pointer',
                marginTop: '6px'
              }}>
                Forgot password?
              </span>
            </div>

            {showForgotPassword && (
              <div style={{
                backgroundColor: colors.inputBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: colors.headings }}>
                  Enter your email and we'll send you a reset link.
                </span>
                {forgotMessage && (
                  <span style={{ fontSize: '13px', color: colors.primaryAccent, fontWeight: '600' }}>{forgotMessage}</span>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={{
                      flexGrow: 1,
                      height: '40px',
                      backgroundColor: colors.white,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontSize: '14px',
                      color: colors.headings,
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                  <button
                    type="button"
                    disabled={forgotSubmitting || !forgotEmail}
                    onClick={handleForgotPassword}
                    style={{
                      height: '40px',
                      padding: '0 16px',
                      backgroundColor: colors.primaryAccent,
                      color: colors.white,
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: forgotSubmitting ? 'default' : 'pointer',
                      opacity: forgotSubmitting ? 0.7 : 1
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* Core Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: colors.primaryAccent,
                color: colors.white,
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: isSubmitting ? 'default' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                marginTop: '12px',
                transition: 'background-color 0.15s ease'
              }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Alternative Separation Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '24px 0',
            color: colors.textMuted,
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <div style={{ flexGrow: 1, height: '1px', backgroundColor: colors.border }}></div>
            <span style={{ padding: '0 12px' }}>Or continue with</span>
            <div style={{ flexGrow: 1, height: '1px', backgroundColor: colors.border }}></div>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: colors.inputBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '16px',
              fontWeight: '700',
              color: colors.headings,
              cursor: 'pointer'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Google
          </button>

          {/* Switch flow link */}
          <div style={{ textAlign: 'center', marginTop: '36px', fontSize: '14px', fontWeight: '700', color: colors.headings }}>
            Don't Have an Account ?{' '}
            <span
              onClick={onSwitchToRegister}
              style={{ color: colors.primaryAccent, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Sign up
            </span>
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: FULL HEIGHT FLUSH AD PANEL */}
      <div style={{
        flex: '1 1 55%',
        padding: 0, // Removed wrapper padding to make it flush
        boxSizing: 'border-box',
        display: 'flex',
        height: '100vh' // Explicitly occupies exact window height
      }}>
        <div style={{
          flexGrow: 1,
          background: 'linear-gradient(145deg, #2B6630 0%, #68B85C 50%, #90DD6A 100%)',
          borderRadius: '40px 0 0 40px', // Matches your exact image: rounded left edge, square right edge
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '48px',
          boxSizing: 'border-box',
          color: colors.white,
          textAlign: 'center'
        }}>

          {/* ABSTRACT VECTOR AUDIO WAVE BACKGROUND GRAPHIC */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            opacity: 0.12,
            pointerEvents: 'none',
            padding: '0 40px'
          }}>
            <div style={{ width: '12px', height: '160px', backgroundColor: colors.white, borderRadius: '6px' }}></div>
            <div style={{ width: '12px', height: '240px', backgroundColor: colors.white, borderRadius: '6px' }}></div>
            <div style={{ width: '12px', height: '320px', backgroundColor: colors.white, borderRadius: '6px' }}></div>
            <div style={{ width: '12px', height: '200px', backgroundColor: colors.white, borderRadius: '6px' }}></div>
            <div style={{ width: '12px', height: '280px', backgroundColor: colors.white, borderRadius: '6px' }}></div>
            <div style={{ width: '12px', height: '360px', backgroundColor: colors.white, borderRadius: '6px' }}></div>
            <div style={{ width: '12px', height: '240px', backgroundColor: colors.white, borderRadius: '6px' }}></div>
            <div style={{ width: '12px', height: '300px', backgroundColor: colors.white, borderRadius: '6px' }}></div>
            <div style={{ width: '12px', height: '180px', backgroundColor: colors.white, borderRadius: '6px' }}></div>
          </div>

          {/* FRONT TEXT OVERLAYS */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '540px' }}>
            <h2 style={{
              fontSize: '56px',
              fontWeight: '700',
              lineHeight: '1.15',
              margin: '0 0 24px 0',
              letterSpacing: '-1px'
            }}>
              Ads that fit their moment.
            </h2>
            <p style={{
              fontSize: '20px',
              fontWeight: '500',
              lineHeight: '1.5',
              opacity: 0.9,
              margin: 0,
              padding: '0 20px'
            }}>
              The creative studio meets SaaS dashboard for modern audio campaigns.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
