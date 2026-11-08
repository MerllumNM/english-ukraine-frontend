import React from 'react';

export default function RatingStars({ rating, onChange, t, firstStarRef }) {
  return (
    <fieldset className="review-rating-fieldset">
      <legend>{t.reviewRatingLabel}</legend>
      <div className="review-rating-input" role="group" aria-label={t.reviewRatingLabel} aria-required="true">
        {Array.from({ length: 5 }, (_, index) => {
          const value = index + 1;
          return (
            <button
              type="button"
              className={`review-rating-star${value <= rating ? ' is-selected' : ''}`}
              key={value}
              ref={value === 1 ? firstStarRef : undefined}
              aria-label={t.reviewRating(value)}
              aria-pressed={rating === value}
              onClick={() => onChange(value)}
            >
              ★
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
