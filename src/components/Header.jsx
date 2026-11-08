import React, { useEffect, useRef, useState } from 'react';
import UserMenu from './UserMenu.jsx';

export default function Header({
  language,
  onChangeLanguage,
  theme,
  onToggleTheme,
  themeStorageError,
  t,
  user,
  isAuthLoading,
  onOpenAuth,
  onProfile,
  onLogout,
  isProfileRoute,
  currentPath,
  onNavigate
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButton = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        menuButton.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="site-header">
      <a
        className="brand"
        href={currentPath === '/' ? '#home' : '/'}
        aria-label={t.brandHomeLabel}
        onClick={(event) => {
          if (currentPath !== '/') {
            event.preventDefault();
            onNavigate('/');
          }
        }}
      >
        <span className="brand-icon" aria-hidden="true">L</span>
        <span>L.e.v.e.l</span>
      </a>
      <div className="header-controls">
        <button
          className="language-switch"
          type="button"
          aria-label={t.languageLabel}
          onClick={() => onChangeLanguage(language === 'uk' ? 'en' : 'uk')}
        >
          <span className={`language-option${language === 'uk' ? ' is-active' : ''}`}>УКР</span>
          <span className={`language-option${language === 'en' ? ' is-active' : ''}`}>ENG</span>
        </button>
        <button
          className="theme-toggle"
          type="button"
          aria-label={theme === 'light' ? t.switchToDarkMode : t.switchToLightMode}
          aria-pressed={theme === 'dark'}
          title={t.themeToggleLabel}
          onClick={onToggleTheme}
        >
          {theme === 'light' ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"></path>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z"></path>
            </svg>
          )}
        </button>
        {!isAuthLoading && (user ? (
          <UserMenu user={user} t={t} onProfile={() => {
            closeMenu();
            onProfile();
          }} />
        ) : (
          <button
            className="student-cabinet"
            type="button"
            onClick={onOpenAuth}
          >
            {t.authLogin}
          </button>
        ))}
        <button
          className="menu-toggle"
          ref={menuButton}
          type="button"
          aria-label={isMenuOpen ? t.closeMenuLabel : t.menuLabel}
          aria-expanded={isMenuOpen}
          aria-controls="site-nav"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        {themeStorageError && (
          <span className="visually-hidden" role="status">{t.themeStorageError}</span>
        )}
      </div>
      <nav
        className={`site-nav${isMenuOpen ? ' is-open' : ''}`}
        id="site-nav"
        aria-label={t.navLabel}
        aria-hidden={isMenuOpen ? 'false' : undefined}
        onClick={(event) => {
          if (event.target.closest('a')) {
            closeMenu();
          }
        }}
      >
        <a
          href="/courses"
          aria-current={currentPath === '/courses' ? 'page' : undefined}
          onClick={(event) => {
            event.preventDefault();
            closeMenu();
            onNavigate('/courses');
          }}
        >
          {t.navCourses}
        </a>
        <a
          href={currentPath === '/' ? '#quiz-box' : '/#quiz-box'}
          onClick={(event) => {
            if (currentPath !== '/') {
              event.preventDefault();
              closeMenu();
              onNavigate('/#quiz-box');
            }
          }}
        >
          {t.navTest}
        </a>
        <a
          href="/teachers"
          aria-current={currentPath === '/teachers' ? 'page' : undefined}
          onClick={(event) => {
            event.preventDefault();
            closeMenu();
            onNavigate('/teachers');
          }}
        >
          {t.navTeachers}
        </a>
        <a
          href={currentPath === '/' ? '#site-footer' : '/#site-footer'}
          onClick={(event) => {
            if (currentPath !== '/') {
              event.preventDefault();
              closeMenu();
              onNavigate('/#site-footer');
            }
          }}
        >
          {t.navAbout}
        </a>
        {user && (
          <button
            className="site-nav-logout"
            type="button"
            onClick={() => {
              closeMenu();
              onLogout();
            }}
          >
            {t.authLogout}
          </button>
        )}
      </nav>
    </header>
  );
}
