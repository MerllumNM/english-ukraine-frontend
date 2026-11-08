import React, { useEffect, useRef, useState } from 'react';
import LoginForm from './LoginForm.jsx';
import RegisterForm from './RegisterForm.jsx';

export default function AuthModal({ t, onClose, onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (mode === 'register' && !data.name.trim()) {
      setError(t.authNameRequired);
      return;
    }
    if (mode === 'register' && data.password.length < 8) {
      setError(t.authPasswordHint);
      return;
    }
    if (mode === 'register' && data.password !== data.confirmPassword) {
      setError(t.authPasswordMismatch);
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') await onLogin({ email: data.email, password: data.password });
      else await onRegister({ name: data.name, email: data.email, password: data.password, role: data.role });
      onClose();
    } catch (submitError) {
      if (submitError.message === 'An account with this email already exists.') {
        setError(t.authEmailExists);
      } else if (submitError.message === 'Incorrect email or password.') {
        setError(t.authInvalidCredentials);
      } else {
        setError(submitError.message || t.authGenericError);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="auth-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="auth-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        ref={dialogRef}
        tabIndex="-1"
      >
        <button className="auth-close" type="button" aria-label={t.authClose} onClick={onClose}>×</button>
        <p className="section-eyebrow">{t.authEyebrow}</p>
        <h2 id="auth-title">{mode === 'login' ? t.authLoginTitle : t.authRegisterTitle}</h2>
        <p className="auth-description">{t.authDescription}</p>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {mode === 'login' ? (
          <LoginForm
            t={t}
            onSubmit={submit}
            onSwitch={() => { setError(''); setMode('register'); }}
            isSubmitting={isSubmitting}
          />
        ) : (
          <RegisterForm
            t={t}
            onSubmit={submit}
            onSwitch={() => { setError(''); setMode('login'); }}
            isSubmitting={isSubmitting}
          />
        )}
      </section>
    </div>
  );
}
