import React, { useCallback, useEffect, useState } from 'react';
import RatingStars from './RatingStars.jsx';
import {
  createCourseReview,
  getCourseRatingSummary,
  getCourseReviews,
  subscribeToCourseReviewChanges
} from '../services/courseReviewService.js';

function formatReviewDate(date, language) {
  return new Intl.DateTimeFormat(language === 'uk' ? 'uk-UA' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date));
}

export default function CourseReviewsPanel({ course, language, t, user, onRequestAuth }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average: null, count: 0 });
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [message, setMessage] = useState(null);
  const [loadError, setLoadError] = useState('');

  const refreshReviews = useCallback(() => {
    try {
      setReviews(getCourseReviews(course.id));
      setSummary(getCourseRatingSummary(course.id));
      setLoadError('');
    } catch (error) {
      console.error('Unable to load saved course reviews.', error);
      setLoadError(t.courseReviewLoadError);
    }
  }, [course.id, t.courseReviewLoadError]);

  useEffect(() => {
    refreshReviews();
    return subscribeToCourseReviewChanges(refreshReviews);
  }, [refreshReviews]);

  function handleRatingChange(nextRating) {
    setRating(nextRating);
    setMessage(null);
  }

  function handleTextChange(event) {
    setText(event.target.value);
    setMessage(null);
  }

  function submitReview(event) {
    event.preventDefault();
    if (!rating) {
      setMessage({ type: 'error', text: t.courseReviewRatingRequired });
      return;
    }
    if (!text.trim()) {
      setMessage({ type: 'error', text: t.courseReviewTextRequired });
      return;
    }
    if (!user) {
      setMessage({ type: 'info', text: t.courseReviewLoginRequired });
      onRequestAuth();
      return;
    }

    try {
      createCourseReview({
        courseId: course.id,
        authorName: user.name,
        rating,
        text
      });
      setRating(0);
      setText('');
      setMessage({ type: 'success', text: t.courseReviewSubmitSuccess });
    } catch (error) {
      console.error('Unable to save the course review.', error);
      setMessage({ type: 'error', text: error.message || t.courseReviewSubmitError });
    }
  }

  return (
    <section className="teacher-review-section course-reviews-section" aria-labelledby="course-reviews-title">
      <h3 id="course-reviews-title">{t.courseReviewsTitle}</h3>
      <div className="course-review-summary" aria-live="polite">
        {summary.count > 0 ? (
          <span>
            <strong>★ {summary.average.toFixed(1)}</strong>
            {' · '}
            {t.courseReviewCount(summary.count)}
          </span>
        ) : (
          <p>{t.courseReviewEmpty}</p>
        )}
      </div>

      <form className="teacher-review-form" onSubmit={submitReview}>
        <h4>{t.rateCourse}</h4>
        <RatingStars rating={rating} onChange={handleRatingChange} t={t} />
        <label className="teacher-review-label" htmlFor="course-review-text">{t.reviewTextLabel}</label>
        <textarea
          id="course-review-text"
          value={text}
          maxLength={1000}
          rows={4}
          aria-required="true"
          onChange={handleTextChange}
        />
        <div className="teacher-review-form-footer">
          <span className="teacher-review-count">{text.length}/1000</span>
          <button className="teacher-review-submit" type="submit">{t.submitReview}</button>
        </div>
        {message && (
          <p
            className={`teacher-review-message is-${message.type}`}
            role={message.type === 'error' ? 'alert' : 'status'}
          >
            {message.text}
          </p>
        )}
      </form>

      {loadError ? (
        <p className="course-reviews-empty" role="alert">{loadError}</p>
      ) : reviews.length > 0 && (
        <div className="course-reviews-list" aria-label={t.courseReviewsTitle}>
          {reviews.map((review) => (
            <article className="course-review-card" key={review.id}>
              <div className="course-review-card-heading">
                <strong>{review.authorName}</strong>
                <time dateTime={review.date}>{formatReviewDate(review.date, language)}</time>
              </div>
              <div className="review-stars" role="img" aria-label={t.reviewRating(review.rating)}>
                {Array.from({ length: 5 }, (_, index) => (
                  <span className={index < review.rating ? 'is-filled' : ''} key={index} aria-hidden="true">★</span>
                ))}
              </div>
              <p>{review.text}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
