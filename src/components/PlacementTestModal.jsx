import React, { useCallback, useEffect, useRef, useState } from 'react';
import questions from '../data/placementTestQuestions.js';

function getResultLevel(correctAnswers) {
  if (correctAnswers <= 1) return 'A1';
  if (correctAnswers <= 3) return 'A2';
  if (correctAnswers <= 5) return 'B1';
  if (correctAnswers <= 7) return 'B2';
  return 'C1';
}

export default function PlacementTestModal({ language, t, onClose, onFindTeacher }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(() => Array(questions.length).fill(null));
  const [result, setResult] = useState(null);
  const dialogRef = useRef(null);
  const question = questions[currentQuestion];
  const answeredCount = answers.filter((answer) => answer !== null).length;
  const progress = result ? 100 : ((currentQuestion + 1) / questions.length) * 100;

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

  function advance() {
    if (answers[currentQuestion] === null) return;
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((index) => index + 1);
      return;
    }

    const correctAnswers = answers.reduce(
      (total, answer, index) => total + (answer === questions[index].answer ? 1 : 0),
      0
    );
    setResult({ correctAnswers, level: getResultLevel(correctAnswers) });
  }

  function retry() {
    setCurrentQuestion(0);
    setAnswers(Array(questions.length).fill(null));
    setResult(null);
  }

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
          {!result && (
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

        {result ? (
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
            <p className="placement-test-scale">{t.placementTestResultScale}</p>
            <div className="placement-test-actions">
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
            <span className="placement-test-level-tag">{question.level}</span>
            <h3>{question.prompt[language]}</h3>
            <fieldset className="placement-test-options">
              <legend className="visually-hidden">{t.placementTestChooseAnswer}</legend>
              {question.options.map((option, index) => (
                <label
                  className={`placement-test-option${answers[currentQuestion] === index ? ' is-selected' : ''}`}
                  key={option}
                >
                  <input
                    type="radio"
                    name={`placement-question-${currentQuestion}`}
                    checked={answers[currentQuestion] === index}
                    onChange={() => selectAnswer(index)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>
            <div className="placement-test-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion((index) => index - 1)}
              >
                {t.placementTestPrevious}
              </button>
              <button
                className="auth-submit"
                type="button"
                disabled={answers[currentQuestion] === null}
                onClick={advance}
              >
                {currentQuestion === questions.length - 1 ? t.placementTestFinish : t.placementTestNext}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
