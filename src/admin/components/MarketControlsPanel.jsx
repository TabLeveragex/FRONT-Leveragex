import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Stack,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Tooltip,
  Alert,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { handleError, handleSuccess } from '../../utils';
import {
  useAbModeToggle,
  useFluctuationToggle,
  useStopAllPrices,
  useTrendDown,
  useTrendModeToggle,
  useTrendUp,
} from '../hooks/useAdminQueries';

function ToggleChip({ label, enabled, onClick, loading }) {
  return (
    <Chip
      label={enabled ? `${label}: ON` : `${label}: OFF`}
      color={enabled ? 'primary' : 'default'}
      variant={enabled ? 'filled' : 'outlined'}
      onClick={onClick}
      disabled={loading}
      sx={{ fontWeight: 600, px: 0.5 }}
    />
  );
}

function MarketControlsPanel({ trendStatus }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const plusMinusToggle = Boolean(trendStatus?.plusMinusToggleEnabled);
  const abModeEnabled = Boolean(trendStatus?.abModeEnabled);
  const fluctuationEnabled = Boolean(trendStatus?.fluctuationEnabled);
  const marketTrend = trendStatus?.marketTrend;
  const movementActive = Boolean(trendStatus?.priceMovementActive);
  const movementWithoutTrend =
    movementActive && marketTrend !== 'up' && marketTrend !== 'down';

  const trendModeMutation = useTrendModeToggle();
  const abModeMutation = useAbModeToggle();
  const fluctuationMutation = useFluctuationToggle();
  const stopAllMutation = useStopAllPrices();
  const trendUpMutation = useTrendUp();
  const trendDownMutation = useTrendDown();

  const isBusy =
    trendModeMutation.isPending ||
    abModeMutation.isPending ||
    fluctuationMutation.isPending ||
    stopAllMutation.isPending ||
    trendUpMutation.isPending ||
    trendDownMutation.isPending;

  const handleTrendMode = async () => {
    try {
      const data = await trendModeMutation.mutateAsync(plusMinusToggle);
      handleSuccess(data?.message || '+/- toggle updated');
    } catch (error) {
      handleError(error.response?.data?.message || 'Failed to update +/- toggle');
    }
  };

  const handleAbMode = async () => {
    try {
      const data = await abModeMutation.mutateAsync(abModeEnabled);
      handleSuccess(data?.message || 'A/B toggle updated');
    } catch (error) {
      handleError(error.response?.data?.message || 'Failed to update A/B toggle');
    }
  };

  const handleFluctuation = async () => {
    try {
      const data = await fluctuationMutation.mutateAsync(fluctuationEnabled);
      handleSuccess(data?.message || 'Fluctuation toggle updated');
    } catch (error) {
      handleError(error.response?.data?.message || 'Failed to update fluctuation toggle');
    }
  };

  const handleTrendUp = async () => {
    if (!plusMinusToggle) {
      handleError('Turn +/- Toggle ON first, then click +');
      return;
    }
    try {
      const data = await trendUpMutation.mutateAsync();
      handleSuccess(data?.message || 'Bullish trend started');
    } catch (error) {
      handleError(error.response?.data?.message || 'Failed to start bullish trend');
    }
  };

  const handleTrendDown = async () => {
    if (!plusMinusToggle) {
      handleError('Turn +/- Toggle ON first, then click −');
      return;
    }
    try {
      const data = await trendDownMutation.mutateAsync();
      handleSuccess(data?.message || 'Bearish trend started');
    } catch (error) {
      handleError(error.response?.data?.message || 'Failed to start bearish trend');
    }
  };

  const handleStopAll = async () => {
    setConfirmOpen(false);
    try {
      const data = await stopAllMutation.mutateAsync();
      handleSuccess(data?.message || 'All price movement stopped');
    } catch (error) {
      handleError(error.response?.data?.message || 'Failed to stop all price movement');
    }
  };

  return (
    <Paper sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Market Controls
      </Typography>
      {!movementActive && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Prices are frozen. Turn on A/B, Fluctuation ±3, or +/- trend to move prices.
        </Alert>
      )}
      {movementWithoutTrend && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Prices are moving because A/B or Fluctuation ±3 is ON — even though market trend is
          idle. Click <strong>Stop all prices</strong> to freeze everything.
        </Alert>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        A/B band logic, ±3 fluctuation, and +/− trend work independently. Turn{' '}
        <strong>+/- Toggle ON</strong>, then click <strong>+</strong> or <strong>−</strong>.
        {marketTrend === 'up' && (
          <Box component="span" sx={{ color: 'primary.main', ml: 1, fontWeight: 600 }}>
            Active: bullish trend
          </Box>
        )}
        {marketTrend === 'down' && (
          <Box component="span" sx={{ color: 'error.main', ml: 1, fontWeight: 600 }}>
            Active: bearish trend
          </Box>
        )}
      </Typography>

      <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
        <Tooltip title="Bearish trend — all stocks decrease gradually">
          <span>
            <Button
              variant="contained"
              color="error"
              disabled={!plusMinusToggle || isBusy}
              onClick={handleTrendDown}
              sx={{ minWidth: 48 }}
            >
              <TrendingDownIcon />
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Bullish trend — all stocks increase gradually">
          <span>
            <Button
              variant="contained"
              color="primary"
              disabled={!plusMinusToggle || isBusy}
              onClick={handleTrendUp}
              sx={{ minWidth: 48 }}
            >
              <TrendingUpIcon />
            </Button>
          </span>
        </Tooltip>

        <ToggleChip
          label="+/- Toggle"
          enabled={plusMinusToggle}
          loading={trendModeMutation.isPending}
          onClick={handleTrendMode}
        />
        <ToggleChip
          label="A/B"
          enabled={abModeEnabled}
          loading={abModeMutation.isPending}
          onClick={handleAbMode}
        />
        <ToggleChip
          label="Fluctuation ±3"
          enabled={fluctuationEnabled}
          loading={fluctuationMutation.isPending}
          onClick={handleFluctuation}
        />

        <Button
          variant="outlined"
          color="warning"
          startIcon={<StopCircleIcon />}
          disabled={isBusy}
          onClick={() => setConfirmOpen(true)}
        >
          Stop all prices
        </Button>
      </Stack>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Stop all price movement?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This turns OFF +/- trend, A/B, and fluctuation ±3 for all watchlist stocks.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="warning" variant="contained" onClick={handleStopAll}>
            Stop all
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default MarketControlsPanel;
