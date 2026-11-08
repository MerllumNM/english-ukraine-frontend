import { apiRequest } from '../api/client';

// Отримання списку питань тесту
export async function getQuizQuestions() {
  return await apiRequest('/quiz/questions');
}

// Відправка відповідей тесту на бекенд і отримання результату/рекомендацій
export async function submitQuizAnswers(answers) {
  return await apiRequest('/quiz/submit', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

// Отримання рекомендованих курсів/викладачів на основі рівня
export async function getRecommendations(level) {
  return await apiRequest(`/quiz/recommendations?level=${level}`);
}

export const quizService = {
  getQuizQuestions,
  submitQuizAnswers,
  getRecommendations,
};

export default quizService;