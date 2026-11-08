import React, { useMemo, useState } from 'react';
import { useTeacherCourses } from '../context/TeacherCoursesContext.jsx';
import TeacherCourseEditor from './TeacherCourseEditor.jsx';

export default function TeacherDashboard({ user, language, t, path, onNavigate, embedded = false }) {
  const {
    courses,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    toggleCoursePublication
  } = useTeacherCourses();
  const ownedCourses = useMemo(
    () => courses.filter((course) => course.teacherId === user.id),
    [courses, user.id]
  );
  const [actionError, setActionError] = useState('');
  const editMatch = path.match(/^\/teacher-dashboard\/courses\/([^/]+)\/edit$/);
  const editingCourse = editMatch
    ? ownedCourses.find((course) => course.id === decodeURIComponent(editMatch[1]))
    : null;
  const isEditor = path === '/teacher-dashboard/courses/new' || Boolean(editMatch);
  const Wrapper = embedded ? 'section' : 'main';
  const wrapperClass = embedded ? 'profile-section teacher-dashboard-section' : 'profile-page teacher-dashboard-page';

  async function saveCourse(details) {
    if (editingCourse) await updateCourse(editingCourse.id, details);
    else await createCourse(details);
    onNavigate('/teacher-dashboard');
  }

  function confirmDelete(course) {
    if (!window.confirm(t.confirmDeleteCourse)) return;
    try {
      deleteCourse(course.id);
      setActionError('');
    } catch (deleteError) {
      console.error('Unable to delete teacher course.', deleteError);
      setActionError(deleteError.message || t.authGenericError);
    }
  }

  function togglePublication(courseId) {
    try {
      toggleCoursePublication(courseId);
      setActionError('');
    } catch (publicationError) {
      console.error('Unable to change teacher course publication.', publicationError);
      setActionError(publicationError.message || t.authGenericError);
    }
  }

  if (isEditor) {
    if (editMatch && !editingCourse) {
      return (
        <main className="profile-page">
          <p className="auth-error" role="alert">{t.courseNotFound}</p>
          <button className="secondary-button" type="button" onClick={() => onNavigate('/teacher-dashboard')}>
            {t.backToDashboard}
          </button>
        </main>
      );
    }

    return (
      <TeacherCourseEditor
        key={editingCourse?.id || 'new-course'}
        course={editingCourse}
        language={language}
        t={t}
        onSave={saveCourse}
        onCancel={() => onNavigate('/teacher-dashboard')}
      />
    );
  }

  return (
    <Wrapper className={wrapperClass}>
      <header className="profile-heading teacher-dashboard-heading">
        <div>
          <p className="section-eyebrow">{t.teacherRole}</p>
          <h1>{t.teacherDashboard}</h1>
        </div>
        <button className="auth-submit" type="button" onClick={() => onNavigate('/teacher-dashboard/courses/new')}>
          {t.createCourse}
        </button>
      </header>
      {(error || actionError) && <p className="auth-error" role="alert">{actionError || error}</p>}
      {ownedCourses.length ? (
        <div className="teacher-dashboard-list">
          {ownedCourses.map((course) => (
            <article className="teacher-dashboard-course" key={course.id}>
              <div>
                <span className={`teacher-course-status is-${course.status}`}>{course.status === 'published' ? t.published : t.draft}</span>
                <h2>{course.title[language]}</h2>
                <p>{course.description[language]}</p>
                <small>{t.lastUpdated}: {new Date(course.updatedAt).toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-GB')}</small>
              </div>
              <div className="teacher-dashboard-actions">
                <button className="secondary-button" type="button" onClick={() => onNavigate(`/teacher-dashboard/courses/${encodeURIComponent(course.id)}/edit`)}>
                  {t.editCourse}
                </button>
                <button className="secondary-button" type="button" onClick={() => togglePublication(course.id)}>
                  {course.status === 'published' ? t.unpublishCourse : t.publishCourse}
                </button>
                <button className="profile-saved-remove" type="button" onClick={() => confirmDelete(course)}>
                  {t.deleteCourse}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="profile-section">
          <p className="profile-empty">{t.noTeacherCourses}</p>
        </section>
      )}
      <button className="secondary-button teacher-dashboard-back" type="button" onClick={() => onNavigate('/profile')}>
        {t.profileTitle}
      </button>
    </Wrapper>
  );
}
