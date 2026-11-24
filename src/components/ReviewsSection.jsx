import React, { useEffect, useRef, useState } from 'react';
import { getLatestReviews, subscribeToReviewChanges } from '../services/reviewService.js';

function getLocalizedTeacherName(teacherName, language) {
  if (!teacherName) return '';
  if (typeof teacherName === 'string') return teacherName;
  return teacherName[language] || teacherName.uk || teacherName.en || '';
}

function ReviewCard({ review, language, t }) {
  if (!review) return null;

  const date = new Date(review.date || review.createdAt || Date.now());
  
  // Безпечно витягуємо текст відгуку
  const reviewText = review.text || review.comment || review.message || '';
  
  // Витягуємо ім'я автора (додано review.user?.name з Prisma)
  const authorName =
    review.user?.name ||
    review.authorName ||
    review.author?.name ||
    review.userName ||
    'Студент';
  
  // Витягуємо ім'я викладача
  const rawTeacherName = review.teacherName || review.teacher?.name;
  const teacherNameStr = getLocalizedTeacherName(rawTeacherName, language);

  const rating = Number(review.rating) || 5;

  return (
    <article className="review-card">
      <div className="review-card-top">
        <div className="review-stars" role="img" aria-label={(t && t.reviewRating) ? t.reviewRating(rating) : `${rating} зірок`}>
          {Array.from({ length: 5 }, (_, index) => (
            <span className={index < rating ? 'is-filled' : ''} key={index} aria-hidden="true">★</span>
          ))}
        </div>
        <span className="review-quote-mark" aria-hidden="true">“</span>
      </div>
      <p className="review-text">{reviewText}</p>
      <footer className="review-author">
        <span className="review-avatar" aria-hidden="true">{authorName.charAt(0).toUpperCase()}</span>
        <span className="review-author-details">
          <strong>{authorName}</strong>
          <time dateTime={date.toISOString()}>
            {new Intl.DateTimeFormat(language === 'uk' ? 'uk-UA' : 'en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }).format(date)}
          </time>
          {teacherNameStr && (
            <span className="review-teacher-name">
              {((t && t.reviewForTeacher) || 'Викладач')}: {teacherNameStr}
            </span>
          )}
        </span>
      </footer>
    </article>
  );
}

export default function ReviewsSection({ language, t }) {
  const trackRef = useRef(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [latestReviews, setLatestReviews] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function refreshReviews() {
      try {
        const data = await getLatestReviews(5);
        if (!isMounted) return;
        setLatestReviews(Array.isArray(data) ? data : []);
        setLoadError('');
      } catch (error) {
        console.error('Unable to load saved reviews.', error);
        if (!isMounted) return;
        setLoadError((t && t.reviewLoadError) || 'Не вдалося завантажити відгуки.');
      }
    }

    refreshReviews();
    const unsubscribe = subscribeToReviewChanges(refreshReviews);

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [t]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    track.scrollLeft = 0;

    function updateScrollControls() {
      const maxScroll = track.scrollWidth - track.clientWidth;
      setCanScrollPrevious(track.scrollLeft > 4);
      setCanScrollNext(track.scrollLeft < maxScroll - 4);
    }

    updateScrollControls();
    track.addEventListener('scroll', updateScrollControls, { passive: true });
    window.addEventListener('resize', updateScrollControls);
    return () => {
      track.removeEventListener('scroll', updateScrollControls);
      window.removeEventListener('resize', updateScrollControls);
    };
  }, [latestReviews]);

  function scrollReviews(direction) {
    const track = trackRef.current;
    const firstCard = track?.firstElementChild;
    if (!track || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * (firstCard.getBoundingClientRect().width + gap),
      behavior: 'smooth'
    });
  }

  const reviewsList = Array.isArray(latestReviews) ? latestReviews : [];
  const translations = t || {};

  return (
    <section className="reviews-section" aria-labelledby="reviews-title">
      <div className="courses-inner">
        <header className="courses-intro">
          <p className="section-eyebrow">{translations.reviewsEyebrow || 'Відгуки'}</p>
          <h2 id="reviews-title">{translations.reviewsTitle || 'Що кажуть наші студенти'}</h2>
        </header>
        {loadError ? (
          <p className="reviews-empty" role="alert">{loadError}</p>
        ) : reviewsList.length === 0 ? (
          <p className="reviews-empty">{translations.reviewEmptyState || 'Поки немає відгуків.'}</p>
        ) : (
          <div className="reviews-carousel">
            <div
              className="reviews-track"
              ref={trackRef}
              role="region"
              aria-label={translations.reviewsTitle || 'Відгуки'}
              tabIndex={0}
            >
              {reviewsList.map((review, index) => (
                <ReviewCard key={review.id || index} review={review} language={language} t={translations} />
              ))}
            </div>
            <div className="reviews-controls">
              <p className="reviews-demo-note">{translations.reviewsRecentNote || ''}</p>
              <div className="reviews-arrows">
                <button
                  type="button"
                  className="reviews-arrow"
                  onClick={() => scrollReviews(-1)}
                  disabled={!canScrollPrevious}
                  aria-label={translations.previousReviews || 'Попередні відгуки'}
                >
                  <span aria-hidden="true">←</span>
                </button>
                <button
                  type="button"
                  className="reviews-arrow"
                  onClick={() => scrollReviews(1)}
                  disabled={!canScrollNext}
                  aria-label={translations.nextReviews || 'Наступні відгуки'}
                >
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}