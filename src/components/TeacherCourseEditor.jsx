import React, { useRef, useState } from 'react';
import courseCategories from '../data/courseCategories.js';

function getInitialValues(course, language) {
  if (!course) {
    return {
      titleUk: '', titleEn: '', descriptionUk: '', descriptionEn: '',
      fullDescriptionUk: '', fullDescriptionEn: '', image: '', level: 'A1–A2',
      category: 'general', price: '', durationUk: '', durationEn: '',
      lessonCount: '', format: 'online', curriculumUk: '', curriculumEn: '',
      audienceUk: '', audienceEn: ''
    };
  }
  return {
    titleUk: course.title.uk,
    titleEn: course.title.en,
    descriptionUk: course.description.uk,
    descriptionEn: course.description.en,
    fullDescriptionUk: course.fullDescription.uk,
    fullDescriptionEn: course.fullDescription.en,
    image: course.image?.startsWith('data:') ? '' : course.image,
    level: course.level,
    category: course.categoryId || 'general',
    price: course.price ?? '',
    durationUk: course.duration.uk,
    durationEn: course.duration.en,
    lessonCount: course.lessonCount,
    format: course.formatId || 'online',
    curriculumUk: course.curriculum.uk.join('\n'),
    curriculumEn: course.curriculum.en.join('\n'),
    audienceUk: course.audience.uk,
    audienceEn: course.audience.en,
    status: course.status,
    language
  };
}

function localized(uk, en) {
  return { uk: uk.trim(), en: en.trim() };
}

export default function TeacherCourseEditor({
  course,
  language,
  t,
  onSave,
  onCancel
}) {
  const [values, setValues] = useState(() => getInitialValues(course, language));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef(null);

  function updateField(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function buildDetails(status) {
    const category = courseCategories.find((item) => item.value === values.category);
    return {
      title: localized(values.titleUk, values.titleEn),
      description: localized(values.descriptionUk, values.descriptionEn),
      fullDescription: localized(values.fullDescriptionUk, values.fullDescriptionEn),
      image: values.image.trim(),
      level: values.level,
      category: localized(category.uk, category.en),
      categoryId: category.value,
      price: values.price === '' ? null : Number(values.price),
      duration: localized(values.durationUk, values.durationEn),
      lessonCount: Number(values.lessonCount),
      format: values.format === 'online'
        ? localized('Онлайн', 'Online')
        : localized('Офлайн', 'In person'),
      formatId: values.format,
      curriculum: {
        uk: values.curriculumUk.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
        en: values.curriculumEn.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      },
      audience: localized(values.audienceUk, values.audienceEn),
      status
    };
  }

  async function submit(event, status) {
    event.preventDefault();
    if (!formRef.current?.reportValidity()) return;
    setError('');
    setIsSaving(true);
    try {
      await onSave(buildDetails(status));
    } catch (saveError) {
      setError(saveError.message || t.authGenericError);
    } finally {
      setIsSaving(false);
    }
  }

  const field = (name, label, options = {}) => (
    <label className={options.className || ''}>
      <span>{label}</span>
      {options.multiline ? (
        <textarea
          name={name}
          value={values[name]}
          onChange={updateField}
          rows={options.rows || 3}
          required={options.required !== false}
          maxLength={options.maxLength || 2000}
        />
      ) : (
        <input
          name={name}
          type={options.type || 'text'}
          value={values[name]}
          onChange={updateField}
          required={options.required !== false}
          min={options.min}
          max={options.max}
          maxLength={options.maxLength || 300}
          step={options.step}
        />
      )}
    </label>
  );

  return (
    <main className="profile-page teacher-dashboard-page">
      <header className="profile-heading">
        <div>
          <p className="section-eyebrow">{t.teacherDashboard}</p>
          <h1>{course ? t.editCourse : t.createCourse}</h1>
        </div>
        <button className="secondary-button" type="button" onClick={onCancel}>{t.cancel}</button>
      </header>
      <form ref={formRef} className="teacher-course-form" onSubmit={(event) => submit(event, 'published')}>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <div className="teacher-course-form-grid">
          {field('titleUk', `${t.courseTitle} — УКР`)}
          {field('titleEn', `${t.courseTitle} — ENG`)}
          {field('descriptionUk', `${t.courseShortDescription} — УКР`, { multiline: true, rows: 2 })}
          {field('descriptionEn', `${t.courseShortDescription} — ENG`, { multiline: true, rows: 2 })}
          {field('fullDescriptionUk', `${t.courseFullDescription} — УКР`, { multiline: true, rows: 4, className: 'teacher-form-wide' })}
          {field('fullDescriptionEn', `${t.courseFullDescription} — ENG`, { multiline: true, rows: 4, className: 'teacher-form-wide' })}
          <label>
            <span>{t.catalogLevel}</span>
            <select name="level" value={values.level} onChange={updateField}>
              {['A1–A2', 'A1–B1', 'A1–C1', 'A2–B2', 'B1–B2', 'B1–C1', 'B1–C2', 'B2–C2', 'C1–C2'].map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </label>
          <label>
            <span>{t.catalogCategory}</span>
            <select name="category" value={values.category} onChange={updateField}>
              {courseCategories.map((category) => (
                <option key={category.value} value={category.value}>{category[language]}</option>
              ))}
            </select>
          </label>
          {field('price', `${t.catalogPrice} (€)`, { type: 'number', min: '0', step: '0.01', required: false })}
          {field('image', t.courseCoverUrl, { type: 'url', required: false, maxLength: 1000 })}
          {field('durationUk', `${t.courseDuration} — УКР`)}
          {field('durationEn', `${t.courseDuration} — ENG`)}
          {field('lessonCount', t.courseLessons, { type: 'number', min: '1', step: '1' })}
          <label>
            <span>{t.courseFormat}</span>
            <select name="format" value={values.format} onChange={updateField}>
              <option value="online">{t.onlineFormat}</option>
              <option value="offline">{t.offlineFormat}</option>
            </select>
          </label>
          {field('curriculumUk', `${t.courseProgram} — УКР`, { multiline: true, rows: 5 })}
          {field('curriculumEn', `${t.courseProgram} — ENG`, { multiline: true, rows: 5 })}
          {field('audienceUk', `${t.courseAudience} — УКР`, { multiline: true, rows: 3 })}
          {field('audienceEn', `${t.courseAudience} — ENG`, { multiline: true, rows: 3 })}
        </div>
        <div className="teacher-course-form-actions">
          <button className="secondary-button" type="button" disabled={isSaving} onClick={(event) => submit(event, 'draft')}>
            {t.saveDraft}
          </button>
          <button className="auth-submit" type="submit" disabled={isSaving}>
            {isSaving ? t.saving : t.publishCourse}
          </button>
        </div>
      </form>
    </main>
  );
}
