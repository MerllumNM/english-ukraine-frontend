import { apiRequest } from '../api/client';

const REVIEWS_EVENT = 'english-ukraine-reviews-updated';

// 1. Отримати всі відгуки з бази
export async function getReviews() {
  const data = await apiRequest('/reviews');
  return Array.isArray(data) ? data : data?.reviews || data?.data || [];
}

// 2. Отримати відгуки конкретного викладача
export async function getTeacherReviews(teacherId) {
  const data = await apiRequest(`/reviews/teacher/${teacherId}`);
  return Array.isArray(data) ? data : data?.reviews || data?.data || [];
}

// 3. Отримати відгуки конкретного курсу
export async function getCourseReviews(courseId) {
  const data = await apiRequest(`/reviews/course/${courseId}`);
  return Array.isArray(data) ? data : data?.reviews || data?.data || [];
}

// 4. Отримати останні відгуки для головної сторінки
export async function getLatestReviews(limit = 5) {
  const reviews = await getReviews();
  return Array.isArray(reviews) ? reviews.slice(0, limit) : [];
}

// 5. Відправка відгуку на бекенд
export async function createReview({ teacherId, courseId, rating, text }) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Увійдіть в акаунт, щоб залишити відгук.');
  }

  const targetId = teacherId || courseId;
  if (!targetId || String(targetId).trim() === '') {
    throw new Error('Оберіть викладача перед відправкою відгуку.');
  }

  const parsedRating = Number(rating);
  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    throw new Error('Оберіть оцінку від 1 до 5 зірок.');
  }

  if (typeof text !== 'string' || text.trim().length < 3) {
    throw new Error('Текст відгуку повинен містити щонайменше 3 символи.');
  }

  if (text.trim().length > 1000) {
    throw new Error('Відгук не може перевищувати 1000 символів.');
  }

  const cleanText = text.trim();

  const response = await apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: Number(teacherId),
      rating: parsedRating,
      comment: cleanText,
    }),
  });

  // Сповіщаємо ReviewsSection, що треба підтягнути свіжі відгуки з сервера
  window.dispatchEvent(new Event(REVIEWS_EVENT));

  return response;
}

export function subscribeToReviewChanges(listener) {
  window.addEventListener(REVIEWS_EVENT, listener);
  return () => {
    window.removeEventListener(REVIEWS_EVENT, listener);
  };
}

const reviewService = {
  getReviews,
  getTeacherReviews,
  getCourseReviews,
  getLatestReviews,
  createReview,
  subscribeToReviewChanges,
};

export default reviewService;