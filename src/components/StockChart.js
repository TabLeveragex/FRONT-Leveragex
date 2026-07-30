import React, { useMemo } from 'react';

function buildSeries(basePrice, points = 48) {
  const price = Number(basePrice) || 100;
  const series = [];
  let current = price * (0.92 + Math.random() * 0.08);

  for (let i = 0; i < points; i += 1) {
    const drift = (price - current) * 0.08;
    const noise = (Math.random() - 0.48) * price * 0.02;
    current = Math.max(price * 0.85, Math.min(price * 1.15, current + drift + noise));
    series.push(current);
  }

  series[series.length - 1] = price;
  return series;
}

function StockChart({ stock }) {
  const stockName = stock?.name || 'Instrument';
  const price = Number(stock?.price) || 0;

  const { path, area, min, max } = useMemo(() => {
    const data = buildSeries(price);
    const lo = Math.min(...data);
    const hi = Math.max(...data);
    const pad = (hi - lo) * 0.08 || 1;
    const ymin = lo - pad;
    const ymax = hi + pad;
    const w = 100;
    const h = 100;

    const coords = data.map((value, index) => {
      const x = (index / (data.length - 1)) * w;
      const y = h - ((value - ymin) / (ymax - ymin)) * h;
      return { x, y };
    });

    const line = coords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    const fill = `${line} L${w},${h} L0,${h} Z`;

    return { path: line, area: fill, min: ymin, max: ymax };
  }, [price, stockName]);

  return (
    <div className="stock-chart">
      <div className="stock-chart-header">
        <div>
          <p className="stock-chart-label">Live chart</p>
          <h3 className="stock-chart-title">{stockName}</h3>
        </div>
        <p className="stock-chart-price mono">₹{price.toFixed(2)}</p>
      </div>
      <div className="stock-chart-canvas-wrap">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="stock-chart-svg" aria-hidden="true">
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.35)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#chartFill)" />
          <path d={path} fill="none" stroke="#10b981" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="stock-chart-axis">
        <span>Low ₹{min.toFixed(2)}</span>
        <span>High ₹{max.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default StockChart;
