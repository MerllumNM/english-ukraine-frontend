import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import AuthModal from './components/AuthModal.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import Profile from './pages/Profile.jsx';
import Courses from './pages/Courses.jsx';
import Teachers from './pages/Teachers.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { TeacherCoursesProvider, useTeacherCourses } from './context/TeacherCoursesContext.jsx';
import translations from './translations.js';
import TeacherDashboard from './components/TeacherDashboard.jsx';

export default function App() {
  return <AuthProvider><TeacherCoursesProvider><AppContent /></TeacherCoursesProvider></AuthProvider>;
}

function AppContent() {
  const [language, setLanguage] = useState(() => {
    try {
      const savedLanguage = window.localStorage.getItem('lingo-language');
      return savedLanguage === 'en' || savedLanguage === 'uk' ? savedLanguage : 'uk';
    } catch (error) {
      console.error('Unable to restore the selected language.', error);
      return 'uk';
    }
  });
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  );
  const [themeStorageError, setThemeStorageError] = useState(false);
  const [isHeroChanging, setIsHeroChanging] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [navigationState, setNavigationState] = useState(
    () => window.history.state?.navigationState || {}
  );
  const isProfileRoute = currentPath === '/profile';
  const {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    toggleSavedTeacher,
    toggleSavedCourse
  } = useAuth();
  const teacherCourses = useTeacherCourses();
  const transitionTimeout = useRef(null);
  const t = translations[language];

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#2F3A33' : '#FFF5CF'
    );

    try {
      window.localStorage.setItem('lingo-theme', theme);
      setThemeStorageError(false);
    } catch (error) {
      console.error('Unable to save the selected theme.', error);
      setThemeStorageError(true);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t.title;

    try {
      window.localStorage.setItem('lingo-language', language);
    } catch (error) {
      console.error('Unable to save the selected language.', error);
    }

    return () => window.clearTimeout(transitionTimeout.current);
  }, [language, t.title]);

  useEffect(() => {
    function handlePopState() {
      setCurrentPath(window.location.pathname);
      setNavigationState(window.history.state?.navigationState || {});
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const isTeacherRoute = currentPath.startsWith('/teacher-dashboard');
    if ((isProfileRoute || isTeacherRoute) && !isLoading && !user) {
      navigate('/');
      setIsAuthOpen(true);
    } else if (isTeacherRoute && user && user.role !== 'teacher') {
      navigate('/profile');
    }
  }, [currentPath, isProfileRoute, isLoading, user]);

  function navigate(path, nextNavigationState = {}) {
    const currentHistoryState = window.history.state && typeof window.history.state === 'object'
      ? window.history.state
      : {};
    window.history.pushState(
      { ...currentHistoryState, navigationState: nextNavigationState },
      '',
      path
    );
    setCurrentPath(window.location.pathname);
    setNavigationState(nextNavigationState);
    window.scrollTo(0, 0);
  }

  const consumeNavigationState = useCallback(() => {
    const currentHistoryState = window.history.state && typeof window.history.state === 'object'
      ? window.history.state
      : {};
    window.history.replaceState(
      { ...currentHistoryState, navigationState: {} },
      '',
      window.location.href
    );
    setNavigationState({});
  }, []);

  function changeLanguage(nextLanguage) {
    if (nextLanguage === language) {
      return;
    }

    window.clearTimeout(transitionTimeout.current);
    setIsHeroChanging(true);
    transitionTimeout.current = window.setTimeout(() => {
      setLanguage(nextLanguage);
      setIsHeroChanging(false);
    }, 180);
  }

  return (
    <>
      <Header
        language={language}
        onChangeLanguage={changeLanguage}
        theme={theme}
        onToggleTheme={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
        themeStorageError={themeStorageError}
        t={t}
        user={user}
        isAuthLoading={isLoading}
        onOpenAuth={() => setIsAuthOpen(true)}
        onProfile={() => navigate('/profile')}
        onLogout={() => {
          logout();
          navigate('/');
        }}
        isProfileRoute={isProfileRoute}
        currentPath={currentPath}
        onNavigate={navigate}
      />
      {currentPath === '/courses' ? (
        <Courses
          language={language}
          t={t}
          user={user}
          teacherCourses={teacherCourses.courses.filter((course) => course.status === 'published')}
          onRequestAuth={() => setIsAuthOpen(true)}
          onToggleSavedTeacher={toggleSavedTeacher}
          onToggleSavedCourse={toggleSavedCourse}
          onNavigate={navigate}
          openItemId={navigationState.openItemId}
          itemsReady={!teacherCourses.isLoading}
          onConsumeOpenItem={consumeNavigationState}
        />
      ) : currentPath === '/teachers' ? (
        <Teachers
          language={language}
          t={t}
          user={user}
          onRequestAuth={() => setIsAuthOpen(true)}
          onToggleSavedTeacher={toggleSavedTeacher}
          onToggleSavedCourse={toggleSavedCourse}
          onNavigate={navigate}
          openItemId={navigationState.openItemId}
          onConsumeOpenItem={consumeNavigationState}
        />
      ) : currentPath.startsWith('/teacher-dashboard') && user?.role === 'teacher' ? (
        <TeacherDashboard
          user={user}
          language={language}
          t={t}
          path={currentPath}
          onNavigate={navigate}
        />
      ) : isProfileRoute && user ? (
        <Profile
          user={user}
          t={t}
          language={language}
          onUpdateProfile={updateProfile}
          onToggleSavedTeacher={toggleSavedTeacher}
          onToggleSavedCourse={toggleSavedCourse}
          teacherCourses={teacherCourses.courses}
          onNavigate={navigate}
          onLogout={() => { logout(); navigate('/'); }}
          onHome={() => navigate('/')}
        />
      ) : (
        <>
          <HomePage
            t={t}
            language={language}
            isHeroChanging={isHeroChanging}
            user={user}
            onRequestAuth={() => setIsAuthOpen(true)}
            onToggleSavedTeacher={toggleSavedTeacher}
            onToggleSavedCourse={toggleSavedCourse}
            onNavigate={navigate}
            onOpenCourse={(courseId) => navigate('/courses', { openItemId: courseId })}
            onOpenTeacher={(teacherId) => navigate('/teachers', { openItemId: teacherId })}
          />
          <Footer t={t} />
        </>
      )}
      {isAuthOpen && <AuthModal t={t} onClose={() => setIsAuthOpen(false)} onLogin={login} onRegister={register} />}
    </>
  );
}
