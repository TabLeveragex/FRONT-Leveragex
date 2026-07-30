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
  MenuItem,
  Select,
  FormControl,
  InputAdornment,
  Box,
  Skeleton,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import { handleError, handleSuccess } from '../../utils';
import { useUpdatePayoutStatus, useUpdateUserBalance } from '../hooks/useAdminQueries';

const PAYOUT_OPTIONS = ['Enable', 'Pending', 'Disable'];
const INVALID_BALANCE_THRESHOLD = 10000000;

function UserBalanceTable({ users = [], isLoading }) {
  const [balanceEdits, setBalanceEdits] = useState({});
  const [search, setSearch] = useState('');
  const updateBalance = useUpdateUserBalance();
  const updatePayout = useUpdatePayoutStatus();

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        String(u.fullName || '').toLowerCase().includes(q) ||
        String(u.mobile || '').includes(q)
    );
  }, [users, search]);

  const liquidatedCount = users.filter((u) => u.isLiquidated).length;

  const handleBalanceChange = (userId, value) => {
    setBalanceEdits((prev) => ({ ...prev, [userId]: value }));
  };

  const handleUpdateBalance = async (userId) => {
    const raw = balanceEdits[userId];
    const balance = Number(raw);
    if (!Number.isFinite(balance)) {
      handleError('Please enter a valid balance.');
      return;
    }
    try {
      await updateBalance.mutateAsync({ userId, balance });
      handleSuccess('User balance updated successfully!');
      setBalanceEdits((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    } catch (error) {
      handleError(error.response?.data?.message || 'Error updating user balance');
    }
  };

  const handlePayoutChange = async (userId, payoutStatus) => {
    try {
      await updatePayout.mutateAsync({ userId, payoutStatus });
      handleSuccess(`Payout status set to ${payoutStatus}`);
    } catch (error) {
      handleError('Failed to update payout status');
    }
  };

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Trader Balances
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {users.length} traders
          {liquidatedCount > 0 && ` · ${liquidatedCount} liquidated`}. User delete is disabled —
          use balance reset for liquidated traders.
        </Typography>
        <TextField
          size="small"
          placeholder="Search by name or mobile…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 360 }}
          fullWidth
        />
      </Box>

      <TableContainer sx={{ maxHeight: 520 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Current Balance</TableCell>
              <TableCell>New Balance</TableCell>
              <TableCell align="right">Action</TableCell>
              <TableCell>Payout</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`user-skel-${i}`}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!isLoading &&
              filteredUsers.map((user) => {
                const balance = Number(user.balance ?? 0);
                const isInvalid = balance > INVALID_BALANCE_THRESHOLD;
                return (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {user.fullName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.mobile}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography
                          variant="body2"
                          fontFamily="monospace"
                          color={isInvalid ? 'error.main' : 'text.primary'}
                        >
                          ₹{balance.toFixed(2)}
                        </Typography>
                        {user.isLiquidated && (
                          <Chip label="liquidated" size="small" color="error" variant="outlined" />
                        )}
                        {isInvalid && (
                          <Chip label="invalid" size="small" color="warning" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={balanceEdits[user._id] ?? ''}
                        onChange={(e) => handleBalanceChange(user._id, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                        sx={{ width: 130 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        disabled={updateBalance.isPending}
                        onClick={() => handleUpdateBalance(user._id)}
                      >
                        Update
                      </Button>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 110 }}>
                        <Select
                          value={user.payoutStatus || 'Disable'}
                          onChange={(e) => handlePayoutChange(user._id, e.target.value)}
                          disabled={updatePayout.isPending}
                        >
                          {PAYOUT_OPTIONS.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                );
              })}
            {!isLoading && filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Alert severity="info" sx={{ display: 'inline-flex' }}>
                    {search ? 'No traders match your search.' : 'No traders registered yet.'}
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default UserBalanceTable;
