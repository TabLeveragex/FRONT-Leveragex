import React, { useMemo, useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip,
  Alert,
  Box,
  Skeleton,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { handleError, handleSuccess } from '../../utils';
import { useUpdateStockAB } from '../hooks/useAdminQueries';

function StockTable({ stocks = [], isLoading }) {
  const [editValues, setEditValues] = useState({});
  const updateAB = useUpdateStockAB();

  const nameCounts = useMemo(() => {
    return stocks.reduce((counts, stock) => {
      counts[stock.name] = (counts[stock.name] || 0) + 1;
      return counts;
    }, {});
  }, [stocks]);

  const hasDuplicates = Object.values(nameCounts).some((count) => count > 1);

  const getFieldValue = (stock, field) => {
    const edited = editValues[stock._id]?.[field];
    if (edited !== undefined && edited !== '') {
      return edited;
    }
    return stock[field === 'A' ? 'watchlist1_A' : 'watchlist1_B'] ?? '';
  };

  const handleFieldChange = (stockId, field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [stockId]: { ...prev[stockId], [field]: value },
    }));
  };

  const handleUpdate = async (stockId) => {
    const stock = stocks.find((s) => s._id === stockId);
    const aVal =
      editValues[stockId]?.A !== undefined
        ? Number(editValues[stockId].A)
        : Number(stock?.watchlist1_A);
    const bVal =
      editValues[stockId]?.B !== undefined
        ? Number(editValues[stockId].B)
        : Number(stock?.watchlist1_B);

    if (!Number.isFinite(aVal) || !Number.isFinite(bVal)) {
      handleError('Please enter valid values for A and B.');
      return;
    }

    try {
      await updateAB.mutateAsync({ stockId, A: aVal, B: bVal });
      handleSuccess('A and B values updated successfully!');
      setEditValues((prev) => {
        const next = { ...prev };
        delete next[stockId];
        return next;
      });
    } catch (error) {
      handleError(error.response?.data?.message || 'Error updating A/B values');
    }
  };

  return (
    <Paper sx={{ mb: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 2.5, pb: 0 }}>
        <Typography variant="h6" gutterBottom>
          Watchlist Stocks
        </Typography>
        {hasDuplicates && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Duplicate stock names detected. Stock deletion is disabled — contact support to clean up
            duplicates in the database if needed.
          </Alert>
        )}
      </Box>

      <TableContainer sx={{ maxHeight: 480 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Stock</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>A Value</TableCell>
              <TableCell>B Value</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={`skel-${i}`}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!isLoading &&
              stocks.map((stock) => (
                <TableRow key={stock._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" fontWeight={600}>
                        {stock.name}
                      </Typography>
                      {nameCounts[stock.name] > 1 && (
                        <Chip label="duplicate" size="small" color="warning" variant="outlined" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" fontFamily="monospace">
                        ₹{Number(stock.price ?? 0).toFixed(2)}
                      </Typography>
                      {stock.priceTrend === 'up' && (
                        <Chip
                          icon={<TrendingUpIcon />}
                          label="bullish"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      {stock.priceTrend === 'down' && (
                        <Chip
                          icon={<TrendingDownIcon />}
                          label="bearish"
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={getFieldValue(stock, 'A')}
                      onChange={(e) => handleFieldChange(stock._id, 'A', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                      sx={{ width: 110 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={getFieldValue(stock, 'B')}
                      onChange={(e) => handleFieldChange(stock._id, 'B', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                      sx={{ width: 110 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<SaveIcon />}
                      disabled={updateAB.isPending}
                      onClick={() => handleUpdate(stock._id)}
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && stocks.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No stocks in watchlist. Add your first stock above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default StockTable;
