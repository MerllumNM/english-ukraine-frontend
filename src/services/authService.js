import { apiRequest } from '../api/client';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const SESSION_KEY = 'lingo-current-user-v1';

// Хелпер для безпечного форматування об'єкта користувача під UI Давида
function toPublicUser(user) {
  if (!user) return null;
  return {
    ...user,
    id: user.id || user._id || '',
    role: user.role === 'teacher' ? 'teacher' : 'student',
    savedTeachers: Array.isArray(user.savedTeachers) ? user.savedTeachers : [],
    savedCourses: Array.isArray(user.savedCourses) ? user.savedCourses : [],
  };
}

export async function register({ name, email, password, role = 'student' }) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });

  const token = data.token || data.accessToken;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  const rawUser = data.user || (data.id || data.email ? data : null);
  const user = toPublicUser(rawUser);

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(SESSION_KEY, String(user.id));
  }

  return user || data;
}

export async function login({ email, password }) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const token = data.token || data.accessToken;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  const rawUser = data.user || (data.id || data.email ? data : null);
  const user = toPublicUser(rawUser);

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(SESSION_KEY, String(user.id));
  }

  return user || data;
}

export function getCurrentUser() {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return toPublicUser(JSON.parse(userStr));
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function updateProfile(userId, changes) {
  const user = getCurrentUser();
  if (!user) return null;
  const updatedUser = toPublicUser({ ...user, ...changes });
  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
}

export function toggleSavedTeacher(userId, teacherId) {
  const user = getCurrentUser();
  if (!user) return null;
  const savedTeachers = Array.isArray(user.savedTeachers) ? user.savedTeachers : [];
  const nextSavedTeachers = savedTeachers.includes(teacherId)
    ? savedTeachers.filter((id) => id !== teacherId)
    : [...savedTeachers, teacherId];
  return updateProfile(userId, { savedTeachers: nextSavedTeachers });
}

export function toggleSavedCourse(userId, courseId) {
  const user = getCurrentUser();
  if (!user) return null;
  const savedCourses = Array.isArray(user.savedCourses) ? user.savedCourses : [];
  const nextSavedCourses = savedCourses.includes(courseId)
    ? savedCourses.filter((id) => id !== courseId)
    : [...savedCourses, courseId];
  return updateProfile(userId, { savedCourses: nextSavedCourses });
}

export const authService = {
  register,
  login,
  getCurrentUser,
  logout,
  updateProfile,
  toggleSavedTeacher,
  toggleSavedCourse,
};

export default authService;