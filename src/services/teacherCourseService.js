const COURSES_KEY = 'lingo-teacher-courses-v1';
const COURSES_EVENT = 'lingo-teacher-courses-updated';

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('Local storage is unavailable in this browser.');
  }
  return window.localStorage;
}

function readCourses() {
  const rawCourses = getStorage().getItem(COURSES_KEY);
  if (!rawCourses) return [];
  const courses = JSON.parse(rawCourses);
  if (!Array.isArray(courses)) {
    throw new Error('Saved course data is invalid. Clear the local course data and try again.');
  }
  return courses;
}

function writeCourses(courses) {
  getStorage().setItem(COURSES_KEY, JSON.stringify(courses));
  window.dispatchEvent(new Event(COURSES_EVENT));
}

function requireTeacher(user) {
  if (!user || user.role !== 'teacher') {
    throw new Error('Only teacher accounts can manage courses.');
  }
}

export function getCourses() {
  return readCourses();
}

export function createCourse(user, details) {
  requireTeacher(user);
  const now = new Date().toISOString();
  const course = {
    ...details,
    id: `teacher-course-${globalThis.crypto.randomUUID()}`,
    teacherId: user.id,
    school: user.name,
    rating: 0,
    createdAt: now,
    updatedAt: now,
    status: details.status === 'published' ? 'published' : 'draft',
    isDemo: true
  };
  writeCourses([...readCourses(), course]);
  return course;
}

export function updateCourse(user, courseId, changes) {
  requireTeacher(user);
  const courses = readCourses();
  const index = courses.findIndex((course) => course.id === courseId);
  if (index < 0 || courses[index].teacherId !== user.id) {
    throw new Error('This course does not belong to your account.');
  }
  const updatedCourse = {
    ...courses[index],
    ...changes,
    id: courses[index].id,
    teacherId: courses[index].teacherId,
    createdAt: courses[index].createdAt,
    updatedAt: new Date().toISOString()
  };
  courses[index] = updatedCourse;
  writeCourses(courses);
  return updatedCourse;
}

export function deleteCourse(user, courseId) {
  requireTeacher(user);
  const courses = readCourses();
  const course = courses.find((item) => item.id === courseId);
  if (!course || course.teacherId !== user.id) {
    throw new Error('This course does not belong to your account.');
  }
  writeCourses(courses.filter((item) => item.id !== courseId));
}

export function toggleCoursePublication(user, courseId) {
  requireTeacher(user);
  const course = readCourses().find((item) => item.id === courseId);
  if (!course || course.teacherId !== user.id) {
    throw new Error('This course does not belong to your account.');
  }
  return updateCourse(user, courseId, {
    status: course.status === 'published' ? 'draft' : 'published'
  });
}

export function subscribeToCourseChanges(listener) {
  function handleStorageChange(event) {
    if (event.key === COURSES_KEY) listener();
  }
  window.addEventListener(COURSES_EVENT, listener);
  window.addEventListener('storage', handleStorageChange);
  return () => {
    window.removeEventListener(COURSES_EVENT, listener);
    window.removeEventListener('storage', handleStorageChange);
  };
}
