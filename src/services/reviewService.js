import { apiRequest } from '../api/client';

const REVIEWS_KEY = 'english-ukraine-reviews-v1';
const REVIEWS_EVENT = 'english-ukraine-reviews-updated';

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  return window.localStorage;
}

function readLocalReviews() {
  const storage = getStorage();
  if (!storage) return [];
  const rawReviews = storage.getItem(REVIEWS_KEY);
  if (!rawReviews) return [];
  try {
    return JSON.parse(rawReviews) || [];
  } catch {
    return [];
  }
}

function writeLocalReviews(reviews) {
  const storage = getStorage();
  if (storage) {
    storage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new Event(REVIEWS_EVENT));
  }
}

// 1. Отримати всі відгуки з бекенду
export async function getReviews() {
  try {
    const data = await apiRequest('/reviews');
    return Array.isArray(data) ? data : data?.reviews || readLocalReviews();
  } catch {
    return readLocalReviews();
  }
}

// 2. Отримати відгуки конкретного викладача з бекенду
export async function getTeacherReviews(teacherId) {
  try {
    const data = await apiRequest(`/reviews/teacher/${teacherId}`);
    return Array.isArray(data) ? data : data?.reviews || [];
  } catch {
    return readLocalReviews().filter((review) => String(review.teacherId) === String(teacherId));
  }
}

// 3. Отримати відгуки конкретного курсу з бекенду
export async function getCourseReviews(courseId) {
  try {
    const data = await apiRequest(`/reviews/course/${courseId}`);
    return Array.isArray(data) ? data : data?.reviews || [];
  } catch {
    return [];
  }
}

// 4. Отримати останні відгуки
export async function getLatestReviews(limit = 5) {
  try {
    const reviews = await getReviews();
    return reviews.slice(0, limit);
  } catch {
    return readLocalReviews().slice(0, limit);
  }
}

// 5. Відправка відгуку на Express-бекенд
export async function createReview({ teacherId, courseId, teacherName, authorName, rating, text }) {
  const targetId = teacherId || courseId;
  const targetType = teacherId ? 'teacher' : 'course';

  if (!targetId || String(targetId).trim() === '') {
    throw new Error('Choose a teacher or course before submitting a review.');
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

  const payload = {
    type: targetType,
    targetId,
    teacherId: teacherId || null,
    courseId: courseId || null,
    teacherName,
    authorName: authorName.trim(),
    rating,
    text: text.trim(),
    comment: text.trim(),
  };

  try {
    const newReview = await apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    // Синхронізуємо локально для миттєвого оновлення UI
    const local = readLocalReviews();
    writeLocalReviews([newReview, ...local]);

    return newReview;
  } catch (err) {
    // Якщо бекенд повернув помилку або недоступний, робимо локальний запис з повідомленням про помилку
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }

    const fallbackReview = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...payload,
      date: new Date().toISOString()
    };
    const local = readLocalReviews();
    writeLocalReviews([fallbackReview, ...local]);
    return fallbackReview;
  }
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

export const reviewService = {
  getReviews,
  getTeacherReviews,
  getCourseReviews,
  getLatestReviews,
  createReview,
  subscribeToReviewChanges,
};

export default reviewService;