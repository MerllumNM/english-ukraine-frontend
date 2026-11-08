import React, { useEffect, useRef, useState } from 'react';
import SavedButton from './SavedButton.jsx';
import CourseReviewsPanel from './CourseReviewsPanel.jsx';
import RatingStars from './RatingStars.jsx';
import { createReview } from '../services/reviewService.js';

function ListSection({ title, items }) {
  if (!items?.length) return null;
  return (
    <section className="details-section">
      <h3>{title}</h3>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
}

export default function DetailsModal({
  type,
  item,
  language,
  t,
  isSaved,
  onToggleSaved,
  onClose,
  user,
  onRequestAuth,
  focusReview = false
}) {
  const dialogRef = useRef(null);
  const firstStarRef = useRef(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewMessage, setReviewMessage] = useState(null);
  const title = type === 'course' ? item.title[language] : item.name[language];
  const price = type === 'course' ? item.price : item.hourlyRate;
  const period = type === 'course' ? t.perMonth : t.perLesson;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (focusReview && type === 'teacher') {
      firstStarRef.current?.focus();
    }
  }, [focusReview, type]);

  function submitReview(event) {
    event.preventDefault();
    if (!reviewRating) {
      setReviewMessage({ type: 'error', text: t.reviewRatingRequired });
      return;
    }
    if (!reviewText.trim()) {
      setReviewMessage({ type: 'error', text: t.reviewTextRequired });
      return;
    }
    if (!user) {
      setReviewMessage({ type: 'info', text: t.reviewLoginRequired });
      onRequestAuth();
      return;
    }

    try {
      createReview({
        teacherId: item.id,
        teacherName: item.name,
        authorName: user.name,
        rating: reviewRating,
        text: reviewText
      });
      setReviewRating(0);
      setReviewText('');
      setReviewMessage({ type: 'success', text: t.reviewSubmitSuccess });
    } catch (error) {
      console.error('Unable to save the teacher review.', error);
      setReviewMessage({ type: 'error', text: error.message || t.reviewSubmitError });
    }
  }

  return (
    <div
      className="details-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
        tabIndex="-1"
        ref={dialogRef}
      >
        <button className="details-close" type="button" aria-label={t.closeDetails} onClick={onClose}>×</button>
        <div className={`details-hero ${type === 'course' ? 'details-course-hero' : 'details-teacher-hero'}`}>
          {item.image && (
            <img
              src={item.image}
              alt=""
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
            />
          )}
          <div className="details-heading">
            <p className="section-eyebrow">{type === 'course' ? item.school : item.specialty[language]}</p>
            <h2 id="details-title">{title}</h2>
            <div className="details-summary">
              {type === 'course' && <span>{t.catalogLevel}: {item.level}</span>}
              <span>{type === 'course' ? item.category[language] : item.level}</span>
              <span className="details-rating">★ {item.rating.toFixed(1)}</span>
              <span>{price != null ? `${price} € ${period}` : t.priceNotAvailable}</span>
            </div>
            <p>{item.description[language]}</p>
          </div>
        </div>
        <div className="details-body">
          <div className="details-actions">
            <SavedButton type={type} isSaved={isSaved} t={t} onToggle={onToggleSaved} />
            <span className="details-demo-note">{type === 'course' ? t.demoOnly : t.teacherDemoOnly}</span>
          </div>
          <section className="details-section">
            <h3>{type === 'course' ? t.aboutItem : t.aboutTeacher}</h3>
            <p>{item.fullDescription[language]}</p>
          </section>
          <dl className="details-facts">
            {type === 'course' ? (
              <>
                <div><dt>{t.catalogSchool}</dt><dd>{item.school}</dd></div>
                <div><dt>{t.catalogLevel}</dt><dd>{item.level}</dd></div>
                <div><dt>{t.catalogCategory}</dt><dd>{item.category[language]}</dd></div>
                <div><dt>{t.courseDuration}</dt><dd>{item.duration[language]}</dd></div>
                <div><dt>{t.courseFormat}</dt><dd>{item.format[language]}</dd></div>
                <div><dt>{t.courseLessons}</dt><dd>{item.lessonCount}</dd></div>
                {item.price != null && <div><dt>{t.catalogPrice}</dt><dd>{item.price} € {period}</dd></div>}
              </>
            ) : (
              <>
                <div><dt>{t.teacherExperience}</dt><dd>{item.experienceYears} {t.years}</dd></div>
                {item.hourlyRate != null && <div><dt>{t.catalogPrice}</dt><dd>{item.hourlyRate} € {period}</dd></div>}
                <div><dt>{t.catalogLevel}</dt><dd>{item.level}</dd></div>
                <div><dt>{t.teacherFormat}</dt><dd>{item.format[language].join(', ')}</dd></div>
              </>
            )}
          </dl>
          {type === 'course' ? (
            <>
              <ListSection title={t.courseProgram} items={item.curriculum[language]} />
              <section className="details-section">
                <h3>{t.courseAudience}</h3>
                <p>{item.audience[language]}</p>
              </section>
              <CourseReviewsPanel
                course={item}
                language={language}
                t={t}
                user={user}
                onRequestAuth={onRequestAuth}
              />
            </>
          ) : (
            <>
              <ListSection title={t.teacherLanguages} items={item.languages[language]} />
              <ListSection title={t.teacherSpecialties} items={item.specializations[language]} />
              <ListSection title={t.teacherEducation} items={item.education[language]} />
              <section className="teacher-review-section" aria-labelledby="teacher-review-title">
                <h3 id="teacher-review-title">{t.rateTeacher}</h3>
                <form className="teacher-review-form" onSubmit={submitReview}>
                  <RatingStars
                    rating={reviewRating}
                    onChange={(nextRating) => {
                      setReviewRating(nextRating);
                      setReviewMessage(null);
                    }}
                    t={t}
                    firstStarRef={firstStarRef}
                  />
                  <label className="teacher-review-label" htmlFor="teacher-review-text">{t.reviewTextLabel}</label>
                  <textarea
                    id="teacher-review-text"
                    value={reviewText}
                    maxLength={1000}
                    rows={4}
                    aria-required="true"
                    onChange={(event) => {
                      setReviewText(event.target.value);
                      setReviewMessage(null);
                    }}
                  />
                  <div className="teacher-review-form-footer">
                    <span className="teacher-review-count">{reviewText.length}/1000</span>
                    <button className="teacher-review-submit" type="submit">{t.submitReview}</button>
                  </div>
                  {reviewMessage && (
                    <p className={`teacher-review-message is-${reviewMessage.type}`} role={reviewMessage.type === 'error' ? 'alert' : 'status'}>
                      {reviewMessage.text}
                    </p>
                  )}
                </form>
              </section>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
