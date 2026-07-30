import React from 'react';
import { ToastContainer } from 'react-toastify';
import AdminLayout from '../layout/AdminLayout';
import BalanceHistoryForm from '../../pages/BalanceHistoryForm';

function WithdrawalsPage() {
  return (
    <AdminLayout title="Withdrawals">
      <BalanceHistoryForm />
      <ToastContainer theme="dark" />
    </AdminLayout>
  );
}

export default WithdrawalsPage;
