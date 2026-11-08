import React, { useState } from 'react';

export default function Footer({ t }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <footer className={`site-footer${isExpanded ? ' is-expanded' : ''}`} id="site-footer">
      <div className="footer-inner">
        <div
          className="footer-about-panel"
          id="footer-about"
          aria-hidden={!isExpanded}
          inert={!isExpanded}
        >
          <div className="footer-about-content">
            <div className="footer-about-copy">
              <h2>{t.footerAboutTitle}</h2>
              <p>{t.footerAboutDescription}</p>
            </div>
            <nav className="footer-links" aria-label={t.footerLinksLabel}>
              <a href="#courses">{t.navCourses}</a>
              <a href="#teachers">{t.navTeachers}</a>
              <a href="#quiz-box">{t.navTest}</a>
            </nav>
          </div>
        </div>
        <div className="footer-bottom">
          <a className="footer-brand" href="#home" aria-label={t.footerBrandHomeLabel}>
            <span className="brand-icon" aria-hidden="true">E</span>
            <span className="footer-brand-name">L.e.v.e.l</span>
          </a>
          <p className="footer-copyright">{t.footerCopyright}</p>
          <button
            className="footer-expand-button"
            type="button"
            aria-label={isExpanded ? t.footerCollapseLabel : t.footerExpandLabel}
            aria-expanded={isExpanded}
            aria-controls="footer-about"
            onClick={() => setIsExpanded((expanded) => !expanded)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 14 6-6 6 6"></path>
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
