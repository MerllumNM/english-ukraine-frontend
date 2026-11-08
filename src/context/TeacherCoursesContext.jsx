import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as teacherCourseService from '../services/teacherCourseService.js';
import { useAuth } from './AuthContext.jsx';

const TeacherCoursesContext = createContext(null);

export function TeacherCoursesProvider({ children }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const refreshCourses = useCallback(() => {
    try {
      setCourses(teacherCourseService.getCourses());
      setError('');
    } catch (loadError) {
      console.error('Unable to load teacher courses.', loadError);
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCourses();
    return teacherCourseService.subscribeToCourseChanges(refreshCourses);
  }, [refreshCourses]);

  const runCourseAction = useCallback((action) => {
    try {
      const result = action(user);
      refreshCourses();
      return result;
    } catch (actionError) {
      setError(actionError.message);
      throw actionError;
    }
  }, [user, refreshCourses]);

  const value = useMemo(() => ({
    courses,
    error,
    isLoading,
    createCourse: (details) => runCourseAction((currentUser) => teacherCourseService.createCourse(currentUser, details)),
    updateCourse: (courseId, changes) => runCourseAction(
      (currentUser) => teacherCourseService.updateCourse(currentUser, courseId, changes)
    ),
    deleteCourse: (courseId) => runCourseAction(
      (currentUser) => teacherCourseService.deleteCourse(currentUser, courseId)
    ),
    toggleCoursePublication: (courseId) => runCourseAction(
      (currentUser) => teacherCourseService.toggleCoursePublication(currentUser, courseId)
    )
  }), [courses, error, isLoading, runCourseAction]);

  return <TeacherCoursesContext.Provider value={value}>{children}</TeacherCoursesContext.Provider>;
}

export function useTeacherCourses() {
  const context = useContext(TeacherCoursesContext);
  if (!context) throw new Error('useTeacherCourses must be used within TeacherCoursesProvider.');
  return context;
}
