import React, { useCallback, useEffect, useState } from 'react';
import adminApi from '../config/adminApi';
import '../styles/Withdrawal.css';

const emptyHistoryForm = {
  userId: '',
  name: '',
  amount: '',
  method: 'UPI',
  status: 'Pending',
};

const emptyPayoutForm = {
  userId: '',
  amount: '',
  upi: '',
};

const WithdrawalForm = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyHistoryForm);
  const [payoutForm, setPayoutForm] = useState(emptyPayoutForm);
  const [payouts, setPayouts] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);

  const loadPayouts = useCallback(async () => {
    try {
      const res = await adminApi.get('/api/payments/payout/list');
      setPayouts(res.data?.payouts || []);
    } catch (err) {
      console.error('Error fetching payouts:', err);
    }
  }, []);

  useEffect(() => {
    adminApi
      .get('/api/users')
      .then((res) => setUsers(res.data || []))
      .catch((err) => console.error('Error fetching users:', err));
    loadPayouts();
  }, [loadPayouts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (e) => {
    const userId = e.target.value;
    const selectedUser = users.find((user) => user._id === userId);
    setForm((prev) => ({
      ...prev,
      userId,
      name: selectedUser?.fullName || prev.name,
    }));
  };

  const handlePayoutChange = (e) => {
    const { name, value } = e.target;
    setPayoutForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayoutUserChange = (e) => {
    const userId = e.target.value;
    const selectedUser = users.find((user) => user._id === userId);
    setPayoutForm((prev) => ({
      ...prev,
      userId,
    }));
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    if (!payoutForm.userId) {
      return alert('Please select a user.');
    }
    setPayoutLoading(true);
    try {
      const res = await adminApi.post('/api/payments/payout/create', {
        userId: payoutForm.userId,
        amount: Number(payoutForm.amount),
        upi: payoutForm.upi,
      });
      alert(res.data?.message || 'UPI payout request sent to Divine Pay.');
      setPayoutForm(emptyPayoutForm);
      loadPayouts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Could not create payout. Please try again.');
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userId) {
      return alert('Please select a user.');
    }

    const payload = {
      userId: form.userId,
      name: form.name,
      amount: parseFloat(form.amount),
      method: form.method,
      status: form.status,
      date: new Date(),
    };

    try {
      await adminApi.post('/putBalance', payload);
      alert('Withdrawal request submitted.');
      setForm(emptyHistoryForm);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error submitting withdrawal request.');
    }
  };

  return (
    <div className="withdrawal-page">
      <div className="withdrawal-container">
        <div className="withdrawal-header">
          <p className="withdrawal-eyebrow">Admin</p>
          <h1>Add Withdrawal History</h1>
          <p className="withdrawal-subtitle">Record a payout request for a user account.</p>
        </div>

        <div className="glass-card withdrawal-card">
          <form onSubmit={handleSubmit} className="withdrawal-form">
            <div className="withdrawal-field">
              <label htmlFor="userId">User</label>
              <select
                id="userId"
                name="userId"
                value={form.userId}
                onChange={handleUserChange}
                required
              >
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.fullName} — {user.mobile}
                  </option>
                ))}
              </select>
            </div>

            <div className="withdrawal-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="withdrawal-field">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="withdrawal-field">
              <label htmlFor="method">Method</label>
              <select id="method" name="method" value={form.method} onChange={handleChange}>
                <option value="UPI">UPI</option>
                <option value="Bank">Bank</option>
              </select>
            </div>

            <div className="withdrawal-field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <button type="submit" className="btn-primary withdrawal-submit">
              Submit Withdrawal
            </button>
          </form>
        </div>

        <div className="withdrawal-header" style={{ marginTop: '2.5rem' }}>
          <p className="withdrawal-eyebrow">Divine Pay</p>
          <h1>UPI Payout</h1>
          <p className="withdrawal-subtitle">
            Admin-only. Sends a UPI payout through Divine Pay for the selected trader.
          </p>
        </div>

        <div className="glass-card withdrawal-card">
          <form onSubmit={handlePayoutSubmit} className="withdrawal-form">
            <div className="withdrawal-field">
              <label htmlFor="payoutUserId">User</label>
              <select
                id="payoutUserId"
                name="userId"
                value={payoutForm.userId}
                onChange={handlePayoutUserChange}
                required
              >
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.fullName} — {user.mobile}
                  </option>
                ))}
              </select>
            </div>

            <div className="withdrawal-field">
              <label htmlFor="payoutAmount">Amount</label>
              <input
                id="payoutAmount"
                name="amount"
                type="number"
                min="1"
                step="1"
                value={payoutForm.amount}
                onChange={handlePayoutChange}
                required
              />
            </div>

            <div className="withdrawal-field">
              <label htmlFor="upi">UPI ID</label>
              <input
                id="upi"
                name="upi"
                value={payoutForm.upi}
                onChange={handlePayoutChange}
                placeholder="name@okaxis"
                required
              />
            </div>

            <button type="submit" className="btn-primary withdrawal-submit" disabled={payoutLoading}>
              {payoutLoading ? 'Sending payout…' : 'Send UPI Payout'}
            </button>
          </form>
        </div>

        {payouts.length > 0 && (
          <div className="withdrawal-list" style={{ marginTop: '1.5rem' }}>
            {payouts.map((item) => (
              <div key={item.id} className="glass-card withdrawal-item">
                <div className="withdrawal-item-top">
                  <p className="withdrawal-item-name">{item.userName}</p>
                  <p className="withdrawal-item-amount">₹{Number(item.amount || 0).toLocaleString('en-IN')}</p>
                </div>
                <p className="withdrawal-item-meta">
                  {item.upi || 'UPI'} · {item.orderId || 'No gateway ID yet'}
                </p>
                <span className={`withdrawal-status ${item.status === 'success' ? 'completed' : 'pending'}`}>
                  {item.status}
                  {item.utr ? ` · UTR ${item.utr}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalForm;
