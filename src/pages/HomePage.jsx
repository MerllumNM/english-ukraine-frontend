import React, { useEffect, useState } from 'react';
import teachers from '../data/teachers.js';
import courses from '../data/courses.js';
import SavedButton from '../components/SavedButton.jsx';
import PlacementTestModal from '../components/PlacementTestModal.jsx';
import ReviewsSection from '../components/ReviewsSection.jsx';

function PersonIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="6" r="3"></circle>
      <path d="M4.5 17v-1.5a5.5 5.5 0 0 1 11 0V17z"></path>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="7"></circle>
      <path d="M10 6v4l2.5 1.5"></path>
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m10 2 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"></path>
    </svg>
  );
}

function CourseIcon({ type }) {
  const paths = {
    general: <><path d="M5 5.5h10a3 3 0 0 1 3 3v8H8a3 3 0 0 1-3-3z"></path><path d="M5 13.5a3 3 0 0 1 3-3h10M9 7.5h5m-5 3h3"></path></>,
    business: <><rect x="4" y="7" width="16" height="12" rx="2"></rect><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-11 5h16m-10 0v2h4v-2"></path></>,
    exam: <><path d="M7 4h8l4 4v12H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"></path><path d="M15 4v5h5m-10 4h5m-5 4h5"></path><path d="m8 13 1 1 2-2"></path></>
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[type]}
    </svg>
  );
}

function CourseCard({ course, t, language, isSaved, onToggleSave, onOpen }) {
  return (
    <article className="course-card" id={`course-${course.id}`}>
      <div className={`course-artwork ${course.artwork}`.trim()}>
        <span className="course-tag">{t[course.tag]}</span>
        <span className="course-icon">
          <CourseIcon type={course.icon} />
        </span>
        <span className="course-number" aria-hidden="true">
          {String(courses.indexOf(course) + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="course-content">
        <h4>{course.title[language]}</h4>
        <p className="course-description">{course.description[language]}</p>
        <div className="course-meta">
          <span>
            <PersonIcon />
            <span>{course.level}</span>
          </span>
          <span>
            <ClockIcon />
            <span>{t.threeMonths}</span>
          </span>
        </div>
        <div className="course-footer">
          <p><strong>{course.price} €</strong> <span>{t.perMonth}</span></p>
          <a
            href="/courses"
            onClick={(event) => {
              event.preventDefault();
              onOpen(course.id);
            }}
          >
            <span>{t.viewCourse}</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
        <SavedButton type="course" isSaved={isSaved} t={t} onToggle={onToggleSave} className="teacher-save" />
      </div>
    </article>
  );
}

function TeacherCard({ teacher, t, language, isSaved, onToggleSave, onOpen }) {
  return (
    <article className="teacher-card" id={`teacher-${teacher.id}`}>
      <div className="teacher-frame">
        <div className={`teacher-photo ${teacher.photoClass}`.trim()}>
          <span>{t[`teacherPhoto${teacher.id}`]}</span>
          <div
            className="teacher-rating"
            aria-label={t[`teacherRating${teacher.id}`]}
          >
            <span>{teacher.rating}</span>
            <StarIcon />
          </div>
        </div>
      </div>
      <div className="teacher-content">
        <h3>{teacher.name[language]}</h3>
        <p className="teacher-specialty">{teacher.specialty[language]}</p>
        <p className="teacher-credentials">
          <PersonIcon />
          <span>{t[teacher.experience]}</span>
        </p>
        <button className="teacher-booking teacher-details-button" type="button" onClick={() => onOpen(teacher.id)}>
          {t.viewDetails}
        </button>
        <SavedButton type="teacher" isSaved={isSaved} t={t} onToggle={onToggleSave} className="teacher-save" />
      </div>
    </article>
  );
}

export default function HomePage({
  t,
  language,
  isHeroChanging,
  user,
  onRequestAuth,
  onToggleSavedTeacher,
  onToggleSavedCourse,
  onNavigate,
  onOpenCourse,
  onOpenTeacher
}) {
  const [showPlacementTest, setShowPlacementTest] = useState(false);
  const [teacherError, setTeacherError] = useState('');
  const [courseError, setCourseError] = useState('');

  useEffect(() => {
    const targetId = window.location.hash.slice(1);
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  async function toggleTeacher(teacherId) {
    if (!user) {
      onRequestAuth();
      return;
    }
    try {
      await onToggleSavedTeacher(teacherId);
      setTeacherError('');
    } catch (error) {
      setTeacherError(error.message);
    }
  }

  async function toggleCourse(courseId) {
    if (!user) {
      onRequestAuth();
      return;
    }
    try {
      await onToggleSavedCourse(courseId);
      setCourseError('');
    } catch (error) {
      setCourseError(error.message);
    }
  }

  return (
    <>
      <main className="container" id="home">
        <div className="hero-layout">
          <div className="hero-content">
            <div className={`hero-copy${isHeroChanging ? ' is-changing' : ''}`}>
              <div className="brand-promise">
                <span className="brand-promise-dot" aria-hidden="true"></span>
                <span>{t.brandPromise}</span>
              </div>
              <h1>
                <span>{t.headingLead}</span>
                <span className="highlight-word">
                  <span>{t.headingHighlight}</span>
                  <svg viewBox="0 0 220 34" aria-hidden="true" focusable="false">
                    <path d="M3 29C29 17 57 9 91 6C128 2 170 2 217 3"></path>
                  </svg>
                </span>
              </h1>
              <p>{t.description}</p>
            </div>

            <div id="quiz-box">
              <button
                id="start-btn"
                type="button"
                onClick={() => setShowPlacementTest(true)}
              >
                {t.start}
              </button>
              <a className="secondary-cta" href="#courses">{t.coursesCta}</a>
            </div>
          </div>
          <div
            className="hero-teacher-photo hero-illustration"
            role="img"
            aria-label={t.learningIllustration}
          >
            <svg viewBox="0 0 560 460" aria-hidden="true" focusable="false">
              <path className="illustration-blob" d="M82 259C36 188 85 77 179 56c70-16 116 25 174 20 62-5 124 31 130 103 7 76-55 107-73 168-20 67-92 87-158 52-59-31-132-59-170-140Z"></path>
              <circle className="illustration-sun" cx="427" cy="85" r="37"></circle>
              <path className="illustration-line" d="M91 343c82 34 251 32 358-6"></path>
              <rect className="illustration-note" x="309" y="68" width="126" height="58" rx="18"></rect>
              <path className="illustration-note-line" d="M331 90h81m-81 15h55"></path>
              <circle className="illustration-person-one" cx="183" cy="173" r="30"></circle>
              <path className="illustration-person-one" d="M127 302c4-62 19-91 56-91s57 31 61 91h-117Z"></path>
              <path className="illustration-person-one-detail" d="m168 228 15 21 16-21m-16 23v49"></path>
              <circle className="illustration-person-two" cx="354" cy="220" r="27"></circle>
              <path className="illustration-person-two" d="M301 329c5-56 20-84 53-84s50 28 54 84H301Z"></path>
              <path className="illustration-person-two-detail" d="m339 262 15 18 15-18m-15 19v41"></path>
              <circle className="illustration-person-three" cx="261" cy="287" r="22"></circle>
              <path className="illustration-person-three" d="M218 365c4-43 16-63 43-63s40 20 44 63h-87Z"></path>
              <path className="illustration-speech" d="M111 126h75a15 15 0 0 1 15 15v20a15 15 0 0 1-15 15h-28l-18 17v-17h-29a15 15 0 0 1-15-15v-20a15 15 0 0 1 15-15Z"></path>
              <circle className="illustration-speech-dot" cx="130" cy="151" r="3"></circle>
              <circle className="illustration-speech-dot" cx="149" cy="151" r="3"></circle>
              <circle className="illustration-speech-dot" cx="168" cy="151" r="3"></circle>
            </svg>
            <span className="hero-art-caption">{t.heroIllustrationCaption}</span>
          </div>
        </div>
      </main>

      <section className="placement-cta-section" aria-labelledby="placement-cta-title">
        <div className="placement-cta">
          <h2 id="placement-cta-title">{t.placementCtaTitle}</h2>
          <p>{t.placementCtaDescription}</p>
          <button
            className="placement-cta-button"
            type="button"
            onClick={() => setShowPlacementTest(true)}
          >
            <span>{t.placementCtaButton}</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <section className="courses-section" id="courses" aria-labelledby="courses-title">
        <div className="courses-inner">
          <header className="courses-intro">
            <p className="section-eyebrow">{t.coursesEyebrow}</p>
            <h2 id="courses-title">{t.coursesTitle}</h2>
            <p>{t.coursesDescription}</p>
            <button className="catalog-view-all" type="button" onClick={() => onNavigate('/courses')}>
              {t.viewAllCourses}<span aria-hidden="true">→</span>
            </button>
          </header>
          <div className="top-courses">
            <h3 className="top-courses-title">{t.topCourses}</h3>
            {courseError && <p className="auth-error" role="alert">{courseError}</p>}
            <div className="course-grid">
              {courses.slice(0, 3).map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  t={t}
                  language={language}
                  isSaved={Boolean(user?.savedCourses?.includes(course.id))}
                  onToggleSave={() => toggleCourse(course.id)}
                  onOpen={onOpenCourse}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="teachers-section" id="teachers" aria-labelledby="teachers-title">
        <div className="courses-inner">
          <header className="courses-intro">
            <p className="section-eyebrow">{t.teachersEyebrow}</p>
            <h2 id="teachers-title">{t.teachersTitle}</h2>
            <p>{t.teachersDescription}</p>
            <button className="catalog-view-all" type="button" onClick={() => onNavigate('/teachers')}>
              {t.viewAllTeachers}<span aria-hidden="true">→</span>
            </button>
          </header>
          <div className="teacher-panel">
            <div className="teacher-grid">
              {teacherError && <p className="auth-error" role="alert">{teacherError}</p>}
              {teachers.slice(0, 3).map((teacher) => (
                <TeacherCard
                  key={teacher.id}
                  teacher={teacher}
                  t={t}
                  language={language}
                  isSaved={Boolean(user?.savedTeachers.includes(teacher.id))}
                  onToggleSave={() => toggleTeacher(teacher.id)}
                  onOpen={onOpenTeacher}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <ReviewsSection language={language} t={t} />

      {showPlacementTest && (
        <PlacementTestModal
          language={language}
          t={t}
          onClose={() => setShowPlacementTest(false)}
          onFindTeacher={() => onNavigate('/teachers')}
        />
      )}
    </>
  );
}
