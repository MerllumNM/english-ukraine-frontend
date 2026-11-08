const REVIEWS_KEY = 'english-ukraine-reviews-v1';
const REVIEWS_EVENT = 'english-ukraine-reviews-updated';

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('Local storage is unavailable in this browser.');
  }
  return window.localStorage;
}

function readReviews() {
  const rawReviews = getStorage().getItem(REVIEWS_KEY);
  if (!rawReviews) return [];

  const reviews = JSON.parse(rawReviews);
  if (!Array.isArray(reviews) || reviews.some((review) => (
    !review
    || typeof review.id !== 'string'
    || (typeof review.teacherId !== 'string' && typeof review.teacherId !== 'number')
    || typeof review.authorName !== 'string'
    || typeof review.text !== 'string'
    || !Number.isInteger(review.rating)
    || review.rating < 1
    || review.rating > 5
    || Number.isNaN(Date.parse(review.date))
  ))) {
    throw new Error('Saved review data is invalid. Clear the local review data and try again.');
  }
  return reviews;
}

function sortNewestFirst(reviews) {
  return [...reviews].sort((first, second) => Date.parse(second.date) - Date.parse(first.date));
}

function writeReviews(reviews) {
  getStorage().setItem(REVIEWS_KEY, JSON.stringify(reviews));
  window.dispatchEvent(new Event(REVIEWS_EVENT));
}

export function getReviews() {
  return sortNewestFirst(readReviews());
}

export function getTeacherReviews(teacherId) {
  return getReviews().filter((review) => String(review.teacherId) === String(teacherId));
}

export function getLatestReviews(limit = 5) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('The review limit must be a positive integer.');
  }
  return getReviews().slice(0, limit);
}

export function createReview({ teacherId, teacherName, authorName, rating, text }) {
  if ((typeof teacherId !== 'string' && typeof teacherId !== 'number') || String(teacherId).trim() === '') {
    throw new Error('Choose a teacher before submitting a review.');
  }
  if (!teacherName || typeof teacherName !== 'object' || !teacherName.uk || !teacherName.en) {
    throw new Error('Teacher details are unavailable. Please try again.');
  }
  if (typeof authorName !== 'string' || !authorName.trim()) {
    throw new Error('Your account name is required to submit a review.');
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Choose a rating from 1 to 5 stars.');
  }
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Write a review before submitting it.');
  }
  if (text.trim().length > 1000) {
    throw new Error('Reviews must be 1,000 characters or fewer.');
  }

  const review = {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    teacherId,
    teacherName,
    authorName: authorName.trim(),
    rating,
    text: text.trim(),
    date: new Date().toISOString()
  };
  writeReviews([review, ...readReviews()]);
  return review;
}

export function subscribeToReviewChanges(listener) {
  function handleStorageChange(event) {
    if (event.key === REVIEWS_KEY) listener();
  }
  window.addEventListener(REVIEWS_EVENT, listener);
  window.addEventListener('storage', handleStorageChange);
  return () => {
    window.removeEventListener(REVIEWS_EVENT, listener);
    window.removeEventListener('storage', handleStorageChange);
  };
}
