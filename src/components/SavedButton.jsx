import React from 'react';

export default function SavedButton({ type, isSaved, t, onToggle, className = '' }) {
  const label = type === 'course'
    ? (isSaved ? t.courseSaved : t.courseSave)
    : (isSaved ? t.teacherSaved : t.teacherSave);

  return (
    <button
      className={`saved-button${isSaved ? ' is-saved' : ''}${className ? ` ${className}` : ''}`}
      type="button"
      aria-pressed={isSaved}
      onClick={onToggle}
    >
      <span aria-hidden="true">{isSaved ? '♥' : '♡'}</span>
      {label}
    </button>
  );
}
