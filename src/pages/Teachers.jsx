import React from 'react';
import CatalogPage from './CatalogPage.jsx';
import teachers from '../data/teachers.js';

export default function Teachers(props) {
  return <CatalogPage {...props} type="teacher" items={teachers} />;
}
