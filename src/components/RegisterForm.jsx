import React from 'react';

export default function RegisterForm({ t, onSubmit, onSwitch, isSubmitting }) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <label>
        {t.authName}
        <input name="name" type="text" autoComplete="name" required maxLength={80} />
      </label>
      <label>
        {t.authEmail}
        <input name="email" type="email" autoComplete="email" required maxLength={254} />
      </label>
      <fieldset className="account-role-options">
        <legend>{t.accountType}</legend>
        <label>
          <input type="radio" name="role" value="student" defaultChecked />
          <span>
            <strong>{t.studentRole}</strong>
            <small>{t.studentRoleDescription}</small>
          </span>
        </label>
        <label>
          <input type="radio" name="role" value="teacher" />
          <span>
            <strong>{t.teacherRole}</strong>
            <small>{t.teacherRoleDescription}</small>
          </span>
        </label>
      </fieldset>
      <label>
        {t.authPassword}
        <input name="password" type="password" autoComplete="new-password" minLength={8} required />
        <span className="auth-hint">{t.authPasswordHint}</span>
      </label>
      <label>
        {t.authConfirmPassword}
        <input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
      </label>
      <button className="auth-submit" type="submit" disabled={isSubmitting}>{t.authRegister}</button>
      <button className="auth-switch" type="button" onClick={onSwitch}>{t.authHaveAccount}</button>
    </form>
  );
}
