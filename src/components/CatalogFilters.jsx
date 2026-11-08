import React from 'react';

export default function CatalogFilters({
  type,
  t,
  search,
  setSearch,
  level,
  setLevel,
  category,
  setCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sort,
  setSort,
  categories,
  onReset
}) {
  return (
    <section className="catalog-filters" aria-label={t.catalogFilters}>
      <label className="catalog-search">
        <span>{t.catalogSearch}</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={type === 'course' ? t.searchCoursesPlaceholder : t.searchTeachersPlaceholder}
        />
      </label>
      <label>
        <span>{t.catalogLevel}</span>
        <select value={level} onChange={(event) => setLevel(event.target.value)}>
          <option value="">{t.filterAnyLevel}</option>
          <option value="A">A1–A2</option>
          <option value="B">B1–B2</option>
          <option value="C">C1–C2</option>
        </select>
      </label>
      <label>
        <span>{type === 'course' ? t.catalogCategory : t.catalogSpecialty}</span>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">{t.filterAny}</option>
          {categories.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label>
        <span>{t.priceFrom}</span>
        <input
          type="number"
          min="0"
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
          placeholder={t.priceMinPlaceholder}
        />
      </label>
      <label>
        <span>{t.priceTo}</span>
        <input
          type="number"
          min="0"
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          placeholder={t.priceMaxPlaceholder}
        />
      </label>
      <label>
        <span>{t.catalogSort}</span>
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="rating">{t.sortRating}</option>
          <option value="price-asc">{t.sortPriceAsc}</option>
          <option value="price-desc">{t.sortPriceDesc}</option>
          <option value={type === 'course' ? 'name' : 'experience'}>
            {type === 'course' ? t.sortName : t.sortExperience}
          </option>
        </select>
      </label>
      <button className="catalog-reset" type="button" onClick={onReset}>{t.resetFilters}</button>
    </section>
  );
}
