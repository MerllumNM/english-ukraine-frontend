const COURSE_REVIEWS_KEY = 'english-ukraine-course-reviews-v1';
const COURSE_REVIEWS_EVENT = 'english-ukraine-course-reviews-updated';

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('Local storage is unavailable in this browser.');
  }
  return window.localStorage;
}

function readCourseReviews() {
  const rawReviews = getStorage().getItem(COURSE_REVIEWS_KEY);
  if (!rawReviews) return [];

  const reviews = JSON.parse(rawReviews);
  if (!Array.isArray(reviews) || reviews.some((review) => (
    !review
    || typeof review.id !== 'string'
    || (typeof review.courseId !== 'string' && typeof review.courseId !== 'number')
    || typeof review.authorName !== 'string'
    || typeof review.text !== 'string'
    || !Number.isInteger(review.rating)
    || review.rating < 1
    || review.rating > 5
    || Number.isNaN(Date.parse(review.date))
  ))) {
    throw new Error('Saved course review data is invalid. Clear the local course review data and try again.');
  }
  return reviews;
}

function sortNewestFirst(reviews) {
  return [...reviews].sort((first, second) => Date.parse(second.date) - Date.parse(first.date));
}

function writeCourseReviews(reviews) {
  getStorage().setItem(COURSE_REVIEWS_KEY, JSON.stringify(reviews));
  window.dispatchEvent(new Event(COURSE_REVIEWS_EVENT));
}

export function getCourseReviews(courseId) {
  if (courseId == null || String(courseId).trim() === '') {
    throw new Error('Choose a course to load its reviews.');
  }
  return sortNewestFirst(readCourseReviews())
    .filter((review) => String(review.courseId) === String(courseId));
}

export function getCourseRatingSummary(courseId) {
  const reviews = getCourseReviews(courseId);
  return {
    count: reviews.length,
    average: reviews.length
      ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
      : null
  };
}

export function createCourseReview({ courseId, authorName, rating, text }) {
  if ((typeof courseId !== 'string' && typeof courseId !== 'number') || String(courseId).trim() === '') {
    throw new Error('Choose a course before submitting a review.');
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
    courseId,
    authorName: authorName.trim(),
    rating,
    text: text.trim(),
    date: new Date().toISOString()
  };
  writeCourseReviews([review, ...readCourseReviews()]);
  return review;
}

export function subscribeToCourseReviewChanges(listener) {
  function handleStorageChange(event) {
    if (event.key === COURSE_REVIEWS_KEY) listener();
  }
  window.addEventListener(COURSE_REVIEWS_EVENT, listener);
  window.addEventListener('storage', handleStorageChange);
  return () => {
    window.removeEventListener(COURSE_REVIEWS_EVENT, listener);
    window.removeEventListener('storage', handleStorageChange);
  };
}
