import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setUser(authService.getCurrentUser());
    } catch (loadError) {
      console.error('Unable to restore the saved account.', loadError);
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }

    function handleStorageChange(event) {
      if (event.key === 'lingo-current-user-v1' || event.key === 'lingo-users-v1') {
        try {
          setUser(authService.getCurrentUser());
          setError('');
        } catch (storageError) {
          console.error('Unable to sync account changes from another tab.', storageError);
          setError(storageError.message);
        }
      }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  async function runAccountAction(action) {
    try {
      const nextUser = await action();
      setUser(nextUser);
      setError('');
      return nextUser;
    } catch (actionError) {
      setError(actionError.message);
      throw actionError;
    }
  }

  const value = useMemo(() => ({
    user,
    isLoading,
    error,
    register: (details) => runAccountAction(() => authService.register(details)),
    login: (details) => runAccountAction(() => authService.login(details)),
    logout: () => {
      try {
        authService.logout();
        setUser(null);
        setError('');
      } catch (logoutError) {
        setError(logoutError.message);
        throw logoutError;
      }
    },
    updateProfile: (changes) => runAccountAction(() => authService.updateProfile(user.id, changes)),
    toggleSavedTeacher: (teacherId) => runAccountAction(
      () => authService.toggleSavedTeacher(user.id, teacherId)
    ),
    toggleSavedCourse: (courseId) => runAccountAction(
      () => authService.toggleSavedCourse(user.id, courseId)
    )
  }), [user, isLoading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
