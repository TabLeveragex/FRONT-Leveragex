import React from 'react';

function SectionHeading({ kicker, title, subtitle }) {
  return (
    <div className="section-heading">
      {kicker && <span className="section-kicker">{kicker}</span>}
      <h2 className="section-title">{title}</h2>
      <div className="section-title-line" aria-hidden="true" />
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}

export default SectionHeading;
