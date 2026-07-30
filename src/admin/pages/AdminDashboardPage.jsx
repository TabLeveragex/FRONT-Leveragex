import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Alert, Box, Button, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import DashboardStats from '../components/DashboardStats';
import MarketControlsPanel from '../components/MarketControlsPanel';
import AddStockForm from '../components/AddStockForm';
import StockTable from '../components/StockTable';
import UserBalanceTable from '../components/UserBalanceTable';
import { useTrendStatus, useUsers, useWatchlistStocks } from '../hooks/useAdminQueries';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: stocks = [], isLoading: stocksLoading, isError: stocksError } = useWatchlistStocks();
  const { data: trendStatus } = useTrendStatus();
  const { data: users = [], isLoading: usersLoading, isError: usersError } = useUsers();

  return (
    <AdminLayout title="Dashboard">
      {(stocksError || usersError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load dashboard data. Check your connection and admin session.
        </Alert>
      )}

      <DashboardStats users={users} stocks={stocks} trendStatus={trendStatus} />

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Watchlist Management
      </Typography>

      <MarketControlsPanel trendStatus={trendStatus} />
      <AddStockForm />
      <StockTable stocks={stocks} isLoading={stocksLoading} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, mt: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          Trader Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AccountBalanceWalletIcon />}
          onClick={() => navigate('/putbalance')}
        >
          Withdrawal History
        </Button>
      </Box>

      <UserBalanceTable users={users} isLoading={usersLoading} />
      <ToastContainer theme="dark" />
    </AdminLayout>
  );
}

export default AdminDashboardPage;
