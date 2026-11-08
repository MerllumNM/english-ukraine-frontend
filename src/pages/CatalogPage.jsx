import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CatalogFilters from '../components/CatalogFilters.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import SavedButton from '../components/SavedButton.jsx';

const LEVEL_RANK = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

function getLocalized(value, language) {
  return typeof value === 'string' ? value : value[language];
}

function matchesLevel(itemLevel, selectedGroup) {
  if (!selectedGroup) return true;
  const levels = itemLevel.split('–').map((level) => LEVEL_RANK[level]);
  const minimum = levels[0];
  const maximum = levels[levels.length - 1];
  const groupMinimum = selectedGroup === 'A' ? 1 : selectedGroup === 'B' ? 3 : 5;
  return maximum >= groupMinimum && minimum <= groupMinimum + 1;
}

function CatalogCard({ item, type, language, t, isSaved, onToggle, onOpen, onRate }) {
  const isCourse = type === 'course';
  const title = getLocalized(isCourse ? item.title : item.name, language);
  const description = getLocalized(item.description, language);
  const specialty = !isCourse && getLocalized(item.specialty, language);
  const category = isCourse
    ? getLocalized(item.category, language)
    : item.specializations[language][0];
  const photoClass = isCourse ? '' : ` ${item.photoClass}`;

  return (
    <article
      className={`catalog-card catalog-${type}-card`}
      id={`${type}-${item.id}`}
      tabIndex="0"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        onOpen();
      }}
    >
      <div className={`catalog-card-image${isCourse ? ' catalog-course-image' : ` catalog-teacher-image${photoClass}`}`}>
        {item.image && (
          <img
            src={item.image}
            alt=""
            loading="lazy"
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
          />
        )}
        <span className="catalog-level">{item.level}</span>
        <span className="catalog-rating">★ {item.rating.toFixed(1)}</span>
      </div>
      <div className="catalog-card-content">
        <p className="catalog-card-kicker">{isCourse ? item.school : category}</p>
        <h2>{title}</h2>
        {!isCourse && <p className="catalog-card-specialty">{specialty}</p>}
        <p className="catalog-card-description">{description}</p>
        <div className="catalog-card-meta">
          <span>{isCourse ? category : `${item.experienceYears} ${t.years}`}</span>
          <span>{isCourse
            ? item.price == null ? t.priceNotAvailable : `${item.price} € ${t.perMonth}`
            : `${item.hourlyRate} € ${t.perLesson}`}</span>
        </div>
        <div className="catalog-card-actions">
          <button className="catalog-details-button" type="button" onClick={(event) => { event.stopPropagation(); onOpen(); }}>
            {t.viewDetails}
          </button>
          {!isCourse && (
            <button
              className="catalog-details-button catalog-rate-button"
              type="button"
              onClick={(event) => { event.stopPropagation(); onRate(); }}
            >
              {t.rateTeacher}
            </button>
          )}
          <SavedButton
            type={type}
            isSaved={isSaved}
            t={t}
            onToggle={(event) => { event.stopPropagation(); onToggle(); }}
            className="catalog-save-button"
          />
        </div>
      </div>
    </article>
  );
}

export default function CatalogPage({
  type,
  items,
  language,
  t,
  user,
  onRequestAuth,
  onToggleSavedTeacher,
  onToggleSavedCourse,
  openItemId,
  itemsReady = true,
  onConsumeOpenItem
}) {
  const isCourse = type === 'course';
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('rating');
  const [selectedItem, setSelectedItem] = useState(null);
  const [focusReview, setFocusReview] = useState(false);
  const [saveError, setSaveError] = useState('');
  const closeDetails = useCallback(() => setSelectedItem(null), []);
  const title = isCourse ? t.catalogCoursesTitle : t.teachersTitle;
  const listKey = isCourse ? 'savedCourses' : 'savedTeachers';
  const categories = useMemo(() => [...new Set(items.flatMap((item) => (
    isCourse ? [getLocalized(item.category, language)] : item.specializations[language]
  )))].sort((first, second) => first.localeCompare(second, language)), [items, isCourse, language]);

  useEffect(() => {
    const targetId = window.location.hash.slice(1);
    if (targetId) document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (openItemId == null || !itemsReady) return;

    const requestedItem = items.find((item) => String(item.id) === String(openItemId));
    if (requestedItem) {
      setSelectedItem(requestedItem);
      setFocusReview(false);
    }
    onConsumeOpenItem();
  }, [openItemId, items, itemsReady, onConsumeOpenItem]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = search.trim().toLocaleLowerCase(language);
    const filtered = items.filter((item) => {
      const itemName = getLocalized(isCourse ? item.title : item.name, language);
      const itemDescription = getLocalized(item.description, language);
      const itemCategories = isCourse
        ? [getLocalized(item.category, language)]
        : item.specializations[language];
      const itemPrice = isCourse ? item.price : item.hourlyRate;
      const matchesSearch = !normalizedQuery
        || itemName.toLocaleLowerCase(language).includes(normalizedQuery)
        || itemDescription.toLocaleLowerCase(language).includes(normalizedQuery);
      return matchesSearch
        && matchesLevel(item.level, level)
        && (!category || itemCategories.includes(category))
        && (!minPrice || (itemPrice != null && itemPrice >= Number(minPrice)))
        && (!maxPrice || (itemPrice != null && itemPrice <= Number(maxPrice)));
    });

    return filtered.sort((first, second) => {
      const firstPrice = isCourse ? first.price : first.hourlyRate;
      const secondPrice = isCourse ? second.price : second.hourlyRate;
      if (sort === 'price-asc') {
        return (firstPrice ?? Number.POSITIVE_INFINITY) - (secondPrice ?? Number.POSITIVE_INFINITY);
      }
      if (sort === 'price-desc') {
        return (secondPrice ?? Number.NEGATIVE_INFINITY) - (firstPrice ?? Number.NEGATIVE_INFINITY);
      }
      if (sort === 'name') {
        const firstName = getLocalized(isCourse ? first.title : first.name, language);
        const secondName = getLocalized(isCourse ? second.title : second.name, language);
        return firstName.localeCompare(secondName, language);
      }
      if (sort === 'experience') return second.experienceYears - first.experienceYears;
      return second.rating - first.rating;
    });
  }, [items, isCourse, language, search, level, category, minPrice, maxPrice, sort]);

  function resetFilters() {
    setSearch('');
    setLevel('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('rating');
  }

  async function toggleSaved(item) {
    if (!user) {
      onRequestAuth();
      return;
    }

    try {
      if (isCourse) await onToggleSavedCourse(item.id);
      else await onToggleSavedTeacher(item.id);
      setSaveError('');
    } catch (error) {
      setSaveError(error.message || t.authGenericError);
    }
  }

  return (
    <main className="catalog-page">
      <header className="catalog-heading">
        <p className="section-eyebrow">{isCourse ? t.coursesEyebrow : t.teachersEyebrow}</p>
        <h1>{title}</h1>
        <p>{isCourse ? t.catalogCoursesDescription : t.catalogTeachersDescription}</p>
        <span className="catalog-demo-label">{t.catalogDemoLabel}</span>
      </header>
      <CatalogFilters
        type={type}
        t={t}
        search={search}
        setSearch={setSearch}
        level={level}
        setLevel={setLevel}
        category={category}
        setCategory={setCategory}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        sort={sort}
        setSort={setSort}
        categories={categories}
        onReset={resetFilters}
      />
      {saveError && <p className="auth-error catalog-save-error" role="alert">{saveError}</p>}
      <p className="catalog-result-count" aria-live="polite">
        {t.catalogResults(visibleItems.length)}
      </p>
      {visibleItems.length ? (
        <div className="catalog-grid">
          {visibleItems.map((item) => (
            <CatalogCard
              key={item.id}
              item={item}
              type={type}
              language={language}
              t={t}
              isSaved={Boolean(user?.[listKey]?.includes(item.id))}
              onToggle={() => toggleSaved(item)}
              onOpen={() => {
                setSelectedItem(item);
                setFocusReview(false);
              }}
              onRate={() => {
                setSelectedItem(item);
                setFocusReview(true);
              }}
            />
          ))}
        </div>
      ) : (
        <p className="catalog-empty">{t.catalogNoResults}</p>
      )}
      {selectedItem && (
        <DetailsModal
          type={type}
          item={selectedItem}
          language={language}
          t={t}
          isSaved={Boolean(user?.[listKey]?.includes(selectedItem.id))}
          onToggleSaved={() => toggleSaved(selectedItem)}
          onClose={closeDetails}
          user={user}
          onRequestAuth={onRequestAuth}
          focusReview={focusReview}
        />
      )}
    </main>
  );
}
