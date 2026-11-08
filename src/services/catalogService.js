import { apiRequest } from '../api/client';

// Отримання списку викладачів з урахуванням фільтрів та пошуку
export async function getTeachers(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = `/teachers${queryString ? `?${queryString}` : ''}`;
  return await apiRequest(endpoint);
}

// Отримання конкретного викладача за ID
export async function getTeacherById(id) {
  return await apiRequest(`/teachers/${id}`);
}

// Отримання списку курсів з урахуванням фільтрів
export async function getCourses(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = `/courses${queryString ? `?${queryString}` : ''}`;
  return await apiRequest(endpoint);
}

// Отримання конкретного курсу за ID
export async function getCourseById(id) {
  return await apiRequest(`/courses/${id}`);
}

// Отримання списку шкіл
export async function getSchools(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = `/schools${queryString ? `?${queryString}` : ''}`;
  return await apiRequest(endpoint);
}

// Отримання публічного профілю користувача/викладача
export async function getUserProfile(id) {
  return await apiRequest(`/users/${id}`);
}

export const catalogService = {
  getTeachers,
  getTeacherById,
  getCourses,
  getCourseById,
  getSchools,
  getUserProfile,
};

export default catalogService;