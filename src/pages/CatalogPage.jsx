import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CatalogFilters from '../components/CatalogFilters.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import SavedButton from '../components/SavedButton.jsx';
import { catalogService } from '../services/catalogService.js';

const LEVEL_RANK = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

function getLocalized(value, language) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[language] || value.uk || value.en || '';
}

function matchesLevel(itemLevel, selectedGroup) {
  if (!selectedGroup || !itemLevel) return true;
  const levels = itemLevel.split('–').map((level) => LEVEL_RANK[level?.trim()] || 0);
  const minimum = levels[0] || 1;
  const maximum = levels[levels.length - 1] || minimum;
  const groupMinimum = selectedGroup === 'A' ? 1 : selectedGroup === 'B' ? 3 : 5;
  return maximum >= groupMinimum && minimum <= groupMinimum + 1;
}

// Нормалізатор об'єктів з бекенду під вимоги фронтенду
function normalizeCatalogItem(item, isCourse) {
  if (!item) return item;
  return {
    ...item,
    id: item.id,
    name: item.name || item.title || 'Викладач',
    title: item.title || item.name || 'Курс',
    description: item.description || item.bio || '',
    image: item.image || item.avatarUrl || '',
    rating: typeof item.rating === 'number' ? item.rating : 5.0,
    experienceYears: item.experienceYears ?? item.experience ?? 1,
    hourlyRate: item.hourlyRate ?? item.price ?? 15,
    price: item.price ?? item.hourlyRate ?? 15,
    level: item.level || 'A1–C2',
    specialty: item.specialty || 'Загальна англійська',
    category: item.category || 'Загальна англійська',
    specializations: item.specializations || {
      uk: [item.specialty || 'Загальна англійська'],
      en: ['General English']
    }
  };
}

function CatalogCard({ item, type, language, t, isSaved, onToggle, onOpen, onRate }) {
  const isCourse = type === 'course';
  const title = getLocalized(isCourse ? item.title : item.name, language);
  const description = getLocalized(item.description, language);
  const specialty = !isCourse && getLocalized(item.specialty, language);
  
  let category = '';
  if (isCourse) {
    category = getLocalized(item.category, language);
  } else if (item.specializations && item.specializations[language]) {
    category = Array.isArray(item.specializations[language])
      ? item.specializations[language][0]
      : item.specializations[language];
  } else {
    category = getLocalized(item.specialty, language);
  }

  const photoClass = isCourse || !item.photoClass ? '' : ` ${item.photoClass}`;
  const ratingVal = typeof item.rating === 'number' ? item.rating.toFixed(1) : '5.0';

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
        <span className="catalog-level">{item.level || 'A1–C2'}</span>
        <span className="catalog-rating">★ {ratingVal}</span>
      </div>
      <div className="catalog-card-content">
        <p className="catalog-card-kicker">{isCourse ? (item.school || 'Lingo') : category}</p>
        <h2>{title}</h2>
        {!isCourse && <p className="catalog-card-specialty">{specialty}</p>}
        <p className="catalog-card-description">{description}</p>
        <div className="catalog-card-meta">
          <span>{isCourse ? category : `${item.experienceYears} ${(t && t.years) || 'р.'}`}</span>
          <span>
            {isCourse
              ? item.price == null ? ((t && t.priceNotAvailable) || 'Ціна за запитом') : `${item.price} € ${(t && t.perMonth) || '/міс'}`
              : `${item.hourlyRate} € ${(t && t.perLesson) || '/урок'}`}
          </span>
        </div>
        <div className="catalog-card-actions">
          <button className="catalog-details-button" type="button" onClick={(event) => { event.stopPropagation(); onOpen(); }}>
            {(t && t.viewDetails) || 'Детальніше'}
          </button>
          {!isCourse && (
            <button
              className="catalog-details-button catalog-rate-button"
              type="button"
              onClick={(event) => { event.stopPropagation(); onRate(); }}
            >
              {(t && t.rateTeacher) || 'Оцінити'}
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
  items: initialItems,
  language = 'uk',
  t = {},
  user,
  onRequestAuth,
  onToggleSavedTeacher,
  onToggleSavedCourse,
  openItemId,
  itemsReady = true,
  onConsumeOpenItem
}) {
  const isCourse = type === 'course';
  const [rawItems, setRawItems] = useState(initialItems || []);
  const [isLoading, setIsLoading] = useState(!initialItems || initialItems.length === 0);
  const [apiError, setApiError] = useState('');

  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('rating');
  const [selectedItem, setSelectedItem] = useState(null);
  const [focusReview, setFocusReview] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Отримання та нормалізація даних з бекенду
  const fetchCatalogData = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      let responseData = [];
      if (isCourse) {
        responseData = await catalogService.getCourses();
      } else {
        responseData = await catalogService.getTeachers();
      }
      
      const list = Array.isArray(responseData)
        ? responseData
        : (responseData?.teachers || responseData?.courses || responseData?.data || responseData?.items || []);
        
      setRawItems(list);
    } catch (err) {
      setApiError(err.message || 'Не вдалося завантажити каталог з сервера');
    } finally {
      setIsLoading(false);
    }
  }, [isCourse]);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setRawItems(initialItems);
      setIsLoading(false);
    } else {
      fetchCatalogData();
    }
  }, [initialItems, fetchCatalogData]);

  // Мапимо всі елементи через нормалізатор
  const items = useMemo(() => {
    return rawItems.map((item) => normalizeCatalogItem(item, isCourse));
  }, [rawItems, isCourse]);

  const closeDetails = useCallback(() => setSelectedItem(null), []);
  const title = isCourse ? (t.catalogCoursesTitle || 'Курси') : (t.teachersTitle || 'Викладачі');
  const listKey = isCourse ? 'savedCourses' : 'savedTeachers';

  const categories = useMemo(() => {
    const list = items.flatMap((item) => {
      if (isCourse) {
        return [getLocalized(item.category, language)];
      }
      if (item.specializations && item.specializations[language]) {
        return Array.isArray(item.specializations[language]) ? item.specializations[language] : [item.specializations[language]];
      }
      return item.specialty ? [getLocalized(item.specialty, language)] : [];
    }).filter(Boolean);

    return [...new Set(list)].sort((first, second) => first.localeCompare(second, language));
  }, [items, isCourse, language]);

  useEffect(() => {
    const targetId = window.location.hash.slice(1);
    if (targetId) document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (openItemId == null || !itemsReady || items.length === 0) return;

    const requestedItem = items.find((item) => String(item.id) === String(openItemId));
    if (requestedItem) {
      setSelectedItem(requestedItem);
      setFocusReview(false);
    }
    if (onConsumeOpenItem) onConsumeOpenItem();
  }, [openItemId, items, itemsReady, onConsumeOpenItem]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = search.trim().toLocaleLowerCase(language);
    const filtered = items.filter((item) => {
      const itemName = getLocalized(isCourse ? item.title : item.name, language);
      const itemDescription = getLocalized(item.description, language);
      
      let itemCategories = [];
      if (isCourse) {
        itemCategories = [getLocalized(item.category, language)];
      } else if (item.specializations && item.specializations[language]) {
        itemCategories = Array.isArray(item.specializations[language]) ? item.specializations[language] : [item.specializations[language]];
      } else if (item.specialty) {
        itemCategories = [getLocalized(item.specialty, language)];
      }

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
      if (sort === 'experience') return (second.experienceYears || 0) - (first.experienceYears || 0);
      return (second.rating || 0) - (first.rating || 0);
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
      if (onRequestAuth) onRequestAuth();
      return;
    }

    try {
      if (isCourse && onToggleSavedCourse) await onToggleSavedCourse(item.id);
      else if (onToggleSavedTeacher) await onToggleSavedTeacher(item.id);
      setSaveError('');
    } catch (error) {
      setSaveError(error.message || (t && t.authGenericError) || 'Помилка збереження');
    }
  }

  return (
    <main className="catalog-page">
      <header className="catalog-heading">
        <p className="section-eyebrow">{isCourse ? (t.coursesEyebrow || 'Курси') : (t.teachersEyebrow || 'Викладачі')}</p>
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

      {/* Стан завантаження */}
      {isLoading && (
        <div className="catalog-loading" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>{(t && t.loading) || 'Завантаження каталогів з сервера...'}</p>
        </div>
      )}

      {/* Стан помилки */}
      {!isLoading && apiError && (
        <div className="catalog-error" style={{ textAlign: 'center', padding: '2rem 1rem', color: '#e53e3e' }}>
          <p>{apiError}</p>
          <button
            type="button"
            className="catalog-details-button"
            style={{ marginTop: '1rem', cursor: 'pointer' }}
            onClick={fetchCatalogData}
          >
            {(t && t.retry) || 'Спробувати знову'}
          </button>
        </div>
      )}

      {/* Основний вміст каталогів */}
      {!isLoading && !apiError && (
        <>
          <p className="catalog-result-count" aria-live="polite">
            {t.catalogResults ? t.catalogResults(visibleItems.length) : `Знайдено: ${visibleItems.length}`}
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
            <p className="catalog-empty">{t.catalogNoResults || 'Нічого не знайдено'}</p>
          )}
        </>
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