import React from 'react';

export default function LoginForm({ t, onSubmit, onSwitch, isSubmitting }) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <label>
        {t.authEmail}
        <input name="email" type="email" autoComplete="email" required maxLength={254} />
      </label>
      <label>
        {t.authPassword}
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className="auth-submit" type="submit" disabled={isSubmitting}>{t.authLogin}</button>
      <button className="auth-switch" type="button" onClick={onSwitch}>{t.authNoAccount}</button>
    </form>
  );
}
