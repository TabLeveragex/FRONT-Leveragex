import React from 'react';
import { FaBolt, FaChartLine, FaCrown } from 'react-icons/fa';
import '../styles/PlanBadge.css';

const PLAN_CONFIG = {
  Rapid: {
    icon: FaBolt,
    tagline: 'Fast-track funded trading',
    className: 'rapid',
  },
  Evolution: {
    icon: FaChartLine,
    tagline: 'Scale your trading journey',
    className: 'evolution',
  },
  Prime: {
    icon: FaCrown,
    tagline: 'Professional capital tier',
    className: 'prime',
  },
};

function PlanBadge({ plan = 'Rapid', size = 'large' }) {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.Rapid;
  const Icon = config.icon;

  return (
    <div className={`plan-badge plan-badge-${config.className} plan-badge-${size}`}>
      <div className="plan-badge-icon-wrap">
        <Icon className="plan-badge-icon" aria-hidden="true" />
      </div>
      <div className="plan-badge-copy">
        <span className="plan-badge-label">{plan}</span>
        {size === 'large' && <span className="plan-badge-tagline">{config.tagline}</span>}
      </div>
    </div>
  );
}

export default PlanBadge;
