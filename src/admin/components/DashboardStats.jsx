import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BoltIcon from '@mui/icons-material/Bolt';

function StatCard({ icon, label, value, accent }) {
  return (
    <Paper sx={{ p: 2.5, height: '100%', flex: 1, minWidth: 160 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: `${accent}22`,
            color: accent,
            display: 'flex',
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

function DashboardStats({ users = [], stocks = [], trendStatus }) {
  const liquidated = users.filter((u) => u.isLiquidated).length;
  const marketTrend = trendStatus?.marketTrend;
  const movementActive = Boolean(trendStatus?.priceMovementActive);
  const trendLabel = movementActive
    ? marketTrend === 'up'
      ? 'Bullish'
      : marketTrend === 'down'
        ? 'Bearish'
        : 'A/B or ±3'
    : 'Frozen';

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
      }}
    >
      <StatCard
        icon={<PeopleIcon />}
        label="Active Traders"
        value={users.length}
        accent="#10b981"
      />
      <StatCard
        icon={<TrendingDownIcon />}
        label="Liquidated"
        value={liquidated}
        accent="#ef4444"
      />
      <StatCard
        icon={<ShowChartIcon />}
        label="Watchlist Stocks"
        value={stocks.length}
        accent="#06b6d4"
      />
      <StatCard
        icon={<BoltIcon />}
        label="Price Engine"
        value={trendLabel}
        accent={
          !movementActive
            ? '#64748b'
            : marketTrend === 'up'
              ? '#10b981'
              : marketTrend === 'down'
                ? '#ef4444'
                : '#f59e0b'
        }
      />
    </Box>
  );
}

export default DashboardStats;
