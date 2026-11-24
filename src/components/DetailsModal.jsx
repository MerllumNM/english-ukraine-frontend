import React, { useEffect, useRef, useState } from 'react';
import SavedButton from './SavedButton.jsx';
import CourseReviewsPanel from './CourseReviewsPanel.jsx';
import RatingStars from './RatingStars.jsx';
import { createReview, getTeacherReviews } from '../services/reviewService.js';

function getLocalized(value, language) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[language] || value.uk || value.en || '';
}

function ListSection({ title, items }) {
  const listItems = Array.isArray(items)
    ? items
    : (items && typeof items === 'object' ? items.uk || items.en || [] : []);
  if (!listItems?.length) return null;
  return (
    <section className="details-section">
      <h3>{title}</h3>
      <ul>{listItems.map((item, index) => <li key={typeof item === 'string' ? item : index}>{item}</li>)}</ul>
    </section>
  );
}

export default function DetailsModal({
  type,
  item,
  language,
  t,
  isSaved,
  onToggleSaved,
  onClose,
  user,
  onRequestAuth,
  focusReview = false
}) {
  const dialogRef = useRef(null);
  const firstStarRef = useRef(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewMessage, setReviewMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Живий рейтинг та список відгуків викладача
  const [liveRating, setLiveRating] = useState(typeof item.rating === 'number' ? item.rating : 5.0);
  const [reviewsCount, setReviewsCount] = useState(item.reviewsCount || 0);
  const [teacherReviews, setTeacherReviews] = useState([]);

  const title = getLocalized(type === 'course' ? item.title : item.name, language);
  const description = getLocalized(item.description, language);
  const fullDescription = getLocalized(item.fullDescription || item.description, language);
  const specialty = getLocalized(item.specialty, language);
  const category = getLocalized(item.category, language);
  const audience = getLocalized(item.audience, language);
  const duration = getLocalized(item.duration, language);
  const format = getLocalized(item.format, language);

  const price = type === 'course' ? item.price : item.hourlyRate;
  const period = type === 'course' ? (t && t.perMonth) || '/міс' : (t && t.perLesson) || '/урок';
  const ratingVal = Number(liveRating || 0).toFixed(1);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (focusReview && type === 'teacher') {
      firstStarRef.current?.focus();
    }
  }, [focusReview, type]);

  // Підтягуємо актуальні відгуки та рейтинг викладача при відкритті модалки
  useEffect(() => {
    if (type !== 'teacher' || !item?.id) return;
    let active = true;

    async function loadTeacherReviews() {
      try {
        const res = await getTeacherReviews(item.id);
        if (!active) return;
        const list = Array.isArray(res) ? res : res?.data || [];
        setTeacherReviews(list);
        if (res?.ratingStats) {
          setLiveRating(res.ratingStats.averageRating || item.rating || 5.0);
          setReviewsCount(res.ratingStats.reviewsCount || list.length);
        }
      } catch {
        // Ігноруємо, якщо відгуків ще немає
      }
    }

    loadTeacherReviews();
    return () => { active = false; };
  }, [type, item]);

  async function submitReview(event) {
    event.preventDefault();
    if (!reviewRating) {
      setReviewMessage({ type: 'error', text: (t && t.reviewRatingRequired) || 'Оберіть рейтинг від 1 до 5 зірок.' });
      return;
    }
    if (!reviewText.trim()) {
      setReviewMessage({ type: 'error', text: (t && t.reviewTextRequired) || 'Напишіть текст відгуку.' });
      return;
    }
    if (!user) {
      setReviewMessage({ type: 'info', text: (t && t.reviewLoginRequired) || 'Увійдіть в акаунт для відправки відгуку.' });
      if (onRequestAuth) onRequestAuth();
      return;
    }

    setIsSubmitting(true);
    setReviewMessage(null);

    try {
      const result = await createReview({
        teacherId: type === 'teacher' ? item.id : null,
        courseId: type === 'course' ? item.id : null,
        teacherName: item.name || item.title,
        authorName: user.name || user.email || 'Студент',
        rating: reviewRating,
        text: reviewText
      });

      // Оновлюємо рейтинг у модалці миттєво
      if (result?.updatedRating) {
        setLiveRating(result.updatedRating.averageRating);
        setReviewsCount(result.updatedRating.reviewsCount);
      }

      // Додаємо новий відгук у список прямо в модалці
      const createdEntry = {
        id: result?.data?.id || Date.now(),
        rating: reviewRating,
        comment: reviewText.trim(),
        createdAt: new Date().toISOString(),
        user: { name: user.name || user.email || 'Студент' }
      };
      setTeacherReviews((prev) => [createdEntry, ...prev]);

      setReviewRating(0);
      setReviewText('');
      setReviewMessage({ type: 'success', text: (t && t.reviewSubmitSuccess) || 'Відгук успішно додано!' });
    } catch (error) {
      console.error('Unable to save review.', error);
      setReviewMessage({ type: 'error', text: error.message || (t && t.reviewSubmitError) || 'Не вдалося зберегти відгук.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="details-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
        tabIndex="-1"
        ref={dialogRef}
      >
        <button className="details-close" type="button" aria-label={(t && t.closeDetails) || 'Закрити'} onClick={onClose}>×</button>
        <div className={`details-hero ${type === 'course' ? 'details-course-hero' : 'details-teacher-hero'}`}>
          {item.image && (
            <img
              src={item.image}
              alt=""
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
            />
          )}
          <div className="details-heading">
            <p className="section-eyebrow">{type === 'course' ? item.school || 'Lingo' : specialty || category}</p>
            <h2 id="details-title">{title}</h2>
            <div className="details-summary">
              {type === 'course' && <span>{(t && t.catalogLevel) || 'Рівень'}: {item.level || 'A1–C2'}</span>}
              <span>{type === 'course' ? category : item.level || 'A1–C2'}</span>
              <span className="details-rating">★ {ratingVal} {reviewsCount > 0 ? `(${reviewsCount})` : ''}</span>
              <span>{price != null ? `${price} € ${period}` : ((t && t.priceNotAvailable) || 'Ціна за запитом')}</span>
            </div>
            <p>{description}</p>
          </div>
        </div>
        <div className="details-body">
          <div className="details-actions">
            <SavedButton type={type} isSaved={isSaved} t={t} onToggle={onToggleSaved} />
            <span className="details-demo-note">{type === 'course' ? t && t.demoOnly : t && t.teacherDemoOnly}</span>
          </div>
          <section className="details-section">
            <h3>{type === 'course' ? (t && t.aboutItem) || 'Про курс' : (t && t.aboutTeacher) || 'Про викладача'}</h3>
            <p>{fullDescription || description}</p>
          </section>
          <dl className="details-facts">
            {type === 'course' ? (
              <>
                <div><dt>{(t && t.catalogSchool) || 'Школа'}</dt><dd>{item.school || 'Lingo'}</dd></div>
                <div><dt>{(t && t.catalogLevel) || 'Рівень'}</dt><dd>{item.level || 'A1–C2'}</dd></div>
                <div><dt>{(t && t.catalogCategory) || 'Категорія'}</dt><dd>{category}</dd></div>
                {duration && <div><dt>{(t && t.courseDuration) || 'Тривалість'}</dt><dd>{duration}</dd></div>}
                {format && <div><dt>{(t && t.courseFormat) || 'Формат'}</dt><dd>{format}</dd></div>}
                {item.lessonCount && <div><dt>{(t && t.courseLessons) || 'Занять'}</dt><dd>{item.lessonCount}</dd></div>}
                {item.price != null && <div><dt>{(t && t.catalogPrice) || 'Ціна'}</dt><dd>{item.price} € {period}</dd></div>}
              </>
            ) : (
              <>
                <div><dt>{(t && t.teacherExperience) || 'Досвід'}</dt><dd>{item.experienceYears || 1} {(t && t.years) || 'р.'}</dd></div>
                {item.hourlyRate != null && <div><dt>{(t && t.catalogPrice) || 'Ціна'}</dt><dd>{item.hourlyRate} € {period}</dd></div>}
                <div><dt>{(t && t.catalogLevel) || 'Рівень'}</dt><dd>{item.level || 'A1–C2'}</dd></div>
                {format && <div><dt>{(t && t.teacherFormat) || 'Формат'}</dt><dd>{Array.isArray(format) ? format.join(', ') : format}</dd></div>}
              </>
            )}
          </dl>
          {type === 'course' ? (
            <>
              <ListSection title={(t && t.courseProgram) || 'Програма'} items={item.curriculum} />
              {audience && (
                <section className="details-section">
                  <h3>{(t && t.courseAudience) || 'Для кого'}</h3>
                  <p>{audience}</p>
                </section>
              )}
              <CourseReviewsPanel
                course={item}
                language={language}
                t={t}
                user={user}
                onRequestAuth={onRequestAuth}
              />
            </>
          ) : (
            <>
              <ListSection title={(t && t.teacherLanguages) || 'Мови викладання'} items={item.languages} />
              <ListSection title={(t && t.teacherSpecialties) || 'Спеціалізація'} items={item.specializations} />
              <ListSection title={(t && t.teacherEducation) || 'Освіта'} items={item.education} />
              <section className="teacher-review-section" aria-labelledby="teacher-review-title">
                <h3 id="teacher-review-title">{(t && t.rateTeacher) || 'Оцінити викладача'}</h3>
                <form className="teacher-review-form" onSubmit={submitReview}>
                  <RatingStars
                    rating={reviewRating}
                    onChange={(nextRating) => {
                      setReviewRating(nextRating);
                      setReviewMessage(null);
                    }}
                    t={t}
                    firstStarRef={firstStarRef}
                  />
                  <label className="teacher-review-label" htmlFor="teacher-review-text">{(t && t.reviewTextLabel) || 'Ваш відгук'}</label>
                  <textarea
                    id="teacher-review-text"
                    value={reviewText}
                    maxLength={1000}
                    rows={4}
                    aria-required="true"
                    onChange={(event) => {
                      setReviewText(event.target.value);
                      setReviewMessage(null);
                    }}
                  />
                  <div className="teacher-review-form-footer">
                    <span className="teacher-review-count">{reviewText.length}/1000</span>
                    <button className="teacher-review-submit" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? ((t && t.submitting) || 'Відправка...') : ((t && t.submitReview) || 'Надіслати')}
                    </button>
                  </div>
                  {reviewMessage && (
                    <p className={`teacher-review-message is-${reviewMessage.type}`} role={reviewMessage.type === 'error' ? 'alert' : 'status'}>
                      {reviewMessage.text}
                    </p>
                  )}
                </form>

                {teacherReviews.length > 0 && (
                  <div className="teacher-reviews-list" style={{ marginTop: '1.25rem' }}>
                    <h4>{(t && t.studentReviews) || 'Відгуки студентів'} ({teacherReviews.length})</h4>
                    {teacherReviews.map((rev, idx) => (
                      <div key={rev.id || idx} className="teacher-review-item" style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <strong>{rev.user?.name || rev.authorName || 'Студент'}</strong>
                          <span>{'★'.repeat(rev.rating || 5)}</span>
                        </div>
                        <p style={{ margin: 0 }}>{rev.comment || rev.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </section>
    </div>
  );
}