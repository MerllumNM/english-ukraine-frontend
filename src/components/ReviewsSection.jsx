import React, { useEffect, useRef, useState } from 'react';
import { getLatestReviews, subscribeToReviewChanges } from '../services/reviewService.js';

function ReviewCard({ review, language, t }) {
  const date = new Date(review.date);

  return (
    <article className="review-card">
      <div className="review-card-top">
        <div className="review-stars" role="img" aria-label={t.reviewRating(review.rating)}>
          {Array.from({ length: 5 }, (_, index) => (
            <span className={index < review.rating ? 'is-filled' : ''} key={index} aria-hidden="true">★</span>
          ))}
        </div>
        <span className="review-quote-mark" aria-hidden="true">“</span>
      </div>
      <p className="review-text">{review.text}</p>
      <footer className="review-author">
        <span className="review-avatar" aria-hidden="true">{review.authorName.charAt(0)}</span>
        <span className="review-author-details">
          <strong>{review.authorName}</strong>
          <time dateTime={review.date}>
            {new Intl.DateTimeFormat(language === 'uk' ? 'uk-UA' : 'en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }).format(date)}
          </time>
          <span className="review-teacher-name">
              {t.reviewForTeacher}: {review.teacherName[language]}
          </span>
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
    function refreshReviews() {
      try {
        setLatestReviews(getLatestReviews(5));
        setLoadError('');
      } catch (error) {
        console.error('Unable to load saved reviews.', error);
        setLoadError(t.reviewLoadError);
      }
    }

    refreshReviews();
    return subscribeToReviewChanges(refreshReviews);
  }, [t.reviewLoadError]);

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

  return (
    <section className="reviews-section" aria-labelledby="reviews-title">
      <div className="courses-inner">
        <header className="courses-intro">
          <p className="section-eyebrow">{t.reviewsEyebrow}</p>
          <h2 id="reviews-title">{t.reviewsTitle}</h2>
        </header>
        {loadError ? (
          <p className="reviews-empty" role="alert">{loadError}</p>
        ) : latestReviews.length === 0 ? (
          <p className="reviews-empty">{t.reviewEmptyState}</p>
        ) : (
          <div className="reviews-carousel">
            <div
              className="reviews-track"
              ref={trackRef}
              role="region"
              aria-label={t.reviewsTitle}
              tabIndex={0}
            >
              {latestReviews.map((review) => (
                <ReviewCard key={review.id} review={review} language={language} t={t} />
              ))}
            </div>
            <div className="reviews-controls">
              <p className="reviews-demo-note">{t.reviewsRecentNote}</p>
              <div className="reviews-arrows">
                <button
                  type="button"
                  className="reviews-arrow"
                  onClick={() => scrollReviews(-1)}
                  disabled={!canScrollPrevious}
                  aria-label={t.previousReviews}
                >
                  <span aria-hidden="true">←</span>
                </button>
                <button
                  type="button"
                  className="reviews-arrow"
                  onClick={() => scrollReviews(1)}
                  disabled={!canScrollNext}
                  aria-label={t.nextReviews}
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
