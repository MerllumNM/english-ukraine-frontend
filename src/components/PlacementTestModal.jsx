import React, { useCallback, useEffect, useRef, useState } from 'react';
import defaultQuestions from '../data/placementTestQuestions.js';
import { quizService } from '../services/quizService.js';

// Збалансована шкала оцінювання
function getResultLevel(correctAnswers) {
  if (correctAnswers <= 2) return 'A1'; // 0–2 бали
  if (correctAnswers <= 4) return 'A2'; // 3–4 бали
  if (correctAnswers <= 6) return 'B1'; // 5–6 балів
  if (correctAnswers <= 8) return 'B2'; // 7–8 балів
  return 'C1';                          // 9–10 балів
}

export default function PlacementTestModal({ language, t, onClose, onFindTeacher }) {
  const [questions, setQuestions] = useState(defaultQuestions);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(() => Array(defaultQuestions.length).fill(null));
  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const dialogRef = useRef(null);

  // Завантаження питань з API з фолбеком на локальний файл
  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const data = await quizService.getQuizQuestions();
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
        setAnswers(Array(data.length).fill(null));
      } else if (data?.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers(Array(data.questions.length).fill(null));
      } else {
        setQuestions(defaultQuestions);
        setAnswers(Array(defaultQuestions.length).fill(null));
      }
    } catch {
      setQuestions(defaultQuestions);
      setAnswers(Array(defaultQuestions.length).fill(null));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const question = questions[currentQuestion] || questions[0];
  const answeredCount = answers.filter((answer) => answer !== null).length;
  const progress = result ? 100 : questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, []);

  const requestClose = useCallback(() => {
    if (!result && answeredCount > 0 && !window.confirm(t.placementTestConfirmClose)) return;
    onClose();
  }, [answeredCount, onClose, result, t.placementTestConfirmClose]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') requestClose();
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [requestClose]);

  function selectAnswer(optionIndex) {
    setAnswers((currentAnswers) => {
      const nextAnswers = [...currentAnswers];
      nextAnswers[currentQuestion] = optionIndex;
      return nextAnswers;
    });
  }

  async function advance() {
    if (answers[currentQuestion] === null) return;

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((index) => index + 1);
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    const correctAnswers = answers.reduce(
      (total, answer, index) => total + (answer === questions[index]?.answer ? 1 : 0),
      0
    );

    try {
      const apiResponse = await quizService.submitQuizAnswers(answers);
      const finalScore = typeof apiResponse?.correctAnswers === 'number' ? apiResponse.correctAnswers : correctAnswers;
      
      // Рахуємо рівень за нашою збалансованою шкалою
      const finalLevel = getResultLevel(finalScore);

      setResult({ correctAnswers: finalScore, level: finalLevel });

      if (apiResponse?.recommendations) {
        setRecommendations(apiResponse.recommendations);
      } else {
        try {
          const recs = await quizService.getRecommendations(finalLevel);
          setRecommendations(recs);
        } catch {
          // Пропускаємо рекомендації при помилці
        }
      }
    } catch {
      setResult({ correctAnswers, level: getResultLevel(correctAnswers) });
    } finally {
      setIsSubmitting(false);
    }
  }

  function retry() {
    setCurrentQuestion(0);
    setAnswers(Array(questions.length).fill(null));
    setResult(null);
    setRecommendations(null);
  }

  const questionPrompt = typeof question?.prompt === 'object'
    ? (question.prompt[language] || question.prompt.uk || question.prompt.en)
    : (question?.prompt || question?.question || '');

  return (
    <div
      className="placement-test-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <section
        className="placement-test-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="placement-test-title"
        tabIndex="-1"
        ref={dialogRef}
      >
        <button
          className="placement-test-close"
          type="button"
          aria-label={t.closeDetails}
          onClick={requestClose}
        >
          ×
        </button>
        <header className="placement-test-header">
          <p className="section-eyebrow">{t.placementTestEyebrow}</p>
          <h2 id="placement-test-title">{result ? t.placementTestResultTitle : t.placementTestTitle}</h2>
          {!result && !isLoading && (
            <>
              <p className="placement-test-count">
                {t.placementTestQuestion(currentQuestion + 1, questions.length)}
              </p>
              <div
                className="placement-test-progress"
                role="progressbar"
                aria-label={t.placementTestProgress}
                aria-valuemin="0"
                aria-valuemax={questions.length}
                aria-valuenow={currentQuestion + 1}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
            </>
          )}
        </header>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>{(t && t.loading) || 'Завантаження питань тесту...'}</p>
          </div>
        ) : result ? (
          <div className="placement-test-result">
            <p className="placement-test-score">
              <strong>{result.correctAnswers}/{questions.length}</strong>
              <span>{t.placementTestCorrectAnswers}</span>
            </p>
            <p className="placement-test-percentage">
              {Math.round((result.correctAnswers / questions.length) * 100)}%
            </p>
            <p className="section-eyebrow">{t.placementTestEstimatedLevel}</p>
            <p className="placement-test-level">{result.level}</p>
            <p className="placement-test-level-description">{t.placementTestLevelDescriptions[result.level]}</p>
            <p className="placement-test-scale">Шкала: 0–2 — A1, 3–4 — A2, 5–6 — B1, 7–8 — B2, 9–10 — C1.</p>

            {recommendations && (
              <div className="placement-test-recommendations" style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                <p className="section-eyebrow" style={{ marginBottom: '0.5rem' }}>Рекомендовано для вас:</p>
                {recommendations.teachers?.length > 0 && (
                  <p style={{ fontSize: '0.95rem' }}>
                    <strong>Викладачі:</strong> {recommendations.teachers.map((item) => item.name).join(', ')}
                  </p>
                )}
                {recommendations.courses?.length > 0 && (
                  <p style={{ fontSize: '0.95rem' }}>
                    <strong>Курси:</strong> {recommendations.courses.map((item) => item.title).join(', ')}
                  </p>
                )}
              </div>
            )}

            <div className="placement-test-actions" style={{ marginTop: '1.5rem' }}>
              <button className="secondary-button" type="button" onClick={retry}>
                {t.placementTestRetry}
              </button>
              <button className="auth-submit" type="button" onClick={onFindTeacher}>
                {t.placementTestFindTeacher}
              </button>
            </div>
          </div>
        ) : (
          <div className="placement-test-question">
            <span className="placement-test-level-tag">{question.level || 'A1'}</span>
            <h3>{questionPrompt}</h3>
            <fieldset className="placement-test-options">
              <legend className="visually-hidden">{t.placementTestChooseAnswer}</legend>
              {question.options.map((option, index) => (
                <label
                  className={`placement-test-option${answers[currentQuestion] === index ? ' is-selected' : ''}`}
                  key={typeof option === 'string' ? option : option.text || index}
                >
                  <input
                    type="radio"
                    name={`placement-question-${currentQuestion}`}
                    checked={answers[currentQuestion] === index}
                    onChange={() => selectAnswer(index)}
                  />
                  <span>{typeof option === 'string' ? option : option.text}</span>
                </label>
              ))}
            </fieldset>

            {apiError && <p className="auth-error" style={{ marginTop: '1rem' }}>{apiError}</p>}

            <div className="placement-test-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={currentQuestion === 0 || isSubmitting}
                onClick={() => setCurrentQuestion((index) => index - 1)}
              >
                {t.placementTestPrevious}
              </button>
              <button
                className="auth-submit"
                type="button"
                disabled={answers[currentQuestion] === null || isSubmitting}
                onClick={advance}
              >
                {isSubmitting
                  ? ((t && t.submitting) || 'Обробка...')
                  : currentQuestion === questions.length - 1
                  ? t.placementTestFinish
                  : t.placementTestNext}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}