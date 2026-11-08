import React, { useRef, useState } from 'react';
import teachers from '../data/teachers.js';
import courses from '../data/courses.js';
import TeacherDashboard from '../components/TeacherDashboard.jsx';

export default function Profile({
  user,
  t,
  language,
  onUpdateProfile,
  onToggleSavedTeacher,
  onToggleSavedCourse,
  teacherCourses = [],
  onNavigate,
  onLogout,
  onHome
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [error, setError] = useState('');
  const [savedError, setSavedError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedTab, setSavedTab] = useState('teachers');
  const fileInput = useRef(null);
  const savedTeachers = teachers.filter((teacher) => user.savedTeachers?.includes(teacher.id));
  const allCourses = [...courses, ...teacherCourses];
  const savedCourses = allCourses.filter((course) => user.savedCourses?.includes(course.id));

  async function saveName(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError(t.profileNameRequired);
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await onUpdateProfile({ name: name.trim() });
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError.message || t.authGenericError);
    } finally {
      setIsSaving(false);
    }
  }

  async function changeAvatar(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t.profileAvatarTypeError);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t.profileAvatarSizeError);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await onUpdateProfile({ avatar: reader.result });
        setError('');
      } catch (saveError) {
        setError(saveError.message || t.authGenericError);
      }
    };
    reader.onerror = () => setError(t.profileAvatarReadError);
    reader.readAsDataURL(file);
  }

  async function removeSavedTeacher(teacherId) {
    try {
      await onToggleSavedTeacher(teacherId);
      setSavedError('');
    } catch (saveError) {
      setSavedError(saveError.message || t.authGenericError);
    }
  }

  async function removeSavedCourse(courseId) {
    try {
      await onToggleSavedCourse(courseId);
      setSavedError('');
    } catch (saveError) {
      setSavedError(saveError.message || t.authGenericError);
    }
  }

  return (
    <main className="profile-page">
      <div className="profile-heading">
        <div>
          <p className="section-eyebrow">{t.profileEyebrow}</p>
          <h1>{t.profileTitle}</h1>
        </div>
        <button className="secondary-button" type="button" onClick={onHome}>{t.profileHome}</button>
      </div>

      <section className="profile-card" aria-label={t.profileDetails}>
        <div className="profile-avatar-wrap">
          {user.avatar ? (
            <img className="profile-avatar" src={user.avatar} alt={t.profileAvatarAlt} />
          ) : (
            <span className="profile-avatar profile-avatar-placeholder" aria-hidden="true">{user.name[0]?.toUpperCase()}</span>
          )}
          <button className="avatar-edit" type="button" onClick={() => fileInput.current?.click()}>{t.profileChangeAvatar}</button>
          <input ref={fileInput} className="visually-hidden" type="file" accept="image/*" onChange={changeAvatar} />
        </div>

        <div className="profile-details">
          {isEditing ? (
            <form className="profile-edit-form" onSubmit={saveName}>
              <label>
                {t.authName}
                <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required />
              </label>
              <div className="profile-actions">
                <button className="auth-submit" type="submit" disabled={isSaving}>{t.profileSave}</button>
                <button className="secondary-button" type="button" onClick={() => { setName(user.name); setIsEditing(false); }}>{t.profileCancel}</button>
              </div>
            </form>
          ) : (
            <>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <button className="secondary-button" type="button" onClick={() => setIsEditing(true)}>{t.profileEdit}</button>
            </>
          )}
          {error && <p className="auth-error" role="alert">{error}</p>}
        </div>
      </section>

      {user.role === 'teacher' && (
        <TeacherDashboard
          user={user}
          language={language}
          t={t}
          path="/teacher-dashboard"
          embedded
          onNavigate={onNavigate}
        />
      )}

      <section className="profile-section" aria-labelledby="saved-title">
        <h2 id="saved-title">{t.profileSaved}</h2>
        <div
          className="profile-saved-tabs"
          role="tablist"
          aria-label={t.profileSaved}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            const nextTab = savedTab === 'teachers' ? 'courses' : 'teachers';
            setSavedTab(nextTab);
            document.getElementById(`saved-${nextTab}-tab`)?.focus();
          }}
        >
          <button
            id="saved-teachers-tab"
            className="profile-saved-tab"
            type="button"
            role="tab"
            aria-selected={savedTab === 'teachers'}
            tabIndex={savedTab === 'teachers' ? 0 : -1}
            aria-controls="saved-content"
            onClick={() => setSavedTab('teachers')}
          >
            {t.savedTeachersTab}
          </button>
          <button
            id="saved-courses-tab"
            className="profile-saved-tab"
            type="button"
            role="tab"
            aria-selected={savedTab === 'courses'}
            tabIndex={savedTab === 'courses' ? 0 : -1}
            aria-controls="saved-content"
            onClick={() => setSavedTab('courses')}
          >
            {t.savedCoursesTab}
          </button>
        </div>
        {savedError && <p className="auth-error profile-saved-error" role="alert">{savedError}</p>}
        <div
          id="saved-content"
          className="profile-saved-content"
          role="tabpanel"
          aria-labelledby={savedTab === 'teachers' ? 'saved-teachers-tab' : 'saved-courses-tab'}
        >
          {savedTab === 'teachers' ? (
            savedTeachers.length ? (
              <div className="profile-saved-grid">
                {savedTeachers.map((teacher) => (
                  <article className="profile-saved-card profile-saved-teacher" key={teacher.id}>
                    <span className={`profile-teacher-avatar ${teacher.photoClass}`} aria-hidden="true">
                      {teacher.name[language][0]}
                    </span>
                    <div className="profile-saved-details">
                      <h3>{teacher.name[language]}</h3>
                      <p>{teacher.specialty[language]}</p>
                      <a
                        href={`/teachers#teacher-${teacher.id}`}
                        onClick={(event) => {
                          event.preventDefault();
                          onNavigate(`/teachers#teacher-${teacher.id}`);
                        }}
                      >
                        {t.viewTeacherProfile}
                      </a>
                    </div>
                    <button
                      className="profile-saved-remove"
                      type="button"
                      aria-label={`${t.removeSaved} ${teacher.name[language]}`}
                      onClick={() => removeSavedTeacher(teacher.id)}
                    >
                      {t.removeSaved}
                    </button>
                  </article>
                ))}
              </div>
            ) : <p className="profile-empty">{t.profileNoTeachers}</p>
          ) : savedCourses.length ? (
            <div className="profile-saved-grid">
              {savedCourses.map((course) => (
                <article className="profile-saved-card profile-saved-course" key={course.id}>
                  <div className="profile-saved-details">
                    <h3>{course.title[language]}</h3>
                    <p>{course.description[language]}</p>
                    <span className="profile-course-level">{t.courseLevel}: {course.level}</span>
                    <a
                      href={`/courses#course-${course.id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        onNavigate(`/courses#course-${course.id}`);
                      }}
                    >
                      {t.viewCourse}
                    </a>
                  </div>
                  <button
                    className="profile-saved-remove"
                    type="button"
                    aria-label={`${t.removeSaved} ${course.title[language]}`}
                    onClick={() => removeSavedCourse(course.id)}
                  >
                    {t.removeSaved}
                  </button>
                </article>
              ))}
            </div>
          ) : <p className="profile-empty">{t.profileNoCourses}</p>}
        </div>
      </section>

      <section className="profile-section" aria-labelledby="reviews-title">
        <h2 id="reviews-title">{t.profileReviews}</h2>
        {user.reviews.length ? (
          <ul className="profile-review-list">
            {user.reviews.map((review) => <li key={review.id || review.text}>{review.text}</li>)}
          </ul>
        ) : <p className="profile-empty">{t.profileNoReviews}</p>}
      </section>

      <button className="profile-logout" type="button" onClick={onLogout}>{t.authLogout}</button>
    </main>
  );
}
