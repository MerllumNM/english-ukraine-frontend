import React from 'react';
import CatalogPage from './CatalogPage.jsx';
import courses from '../data/courses.js';

export default function Courses(props) {
  const teacherCourses = props.teacherCourses || [];
  return <CatalogPage {...props} type="course" items={[...courses, ...teacherCourses]} />;
}
