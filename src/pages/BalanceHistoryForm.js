import React, { useEffect, useState } from 'react';
import adminApi from '../config/adminApi';
import '../styles/Withdrawal.css';

const WithdrawalForm = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    userId: '',
    name: '',
    amount: '',
    method: 'UPI',
    status: 'Pending',
  });

  useEffect(() => {
    adminApi
      .get('/api/users')
      .then((res) => setUsers(res.data || []))
      .catch((err) => console.error('Error fetching users:', err));
  }, []);

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
      setForm({
        userId: '',
        name: '',
        amount: '',
        method: 'UPI',
        status: 'Pending',
      });
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
      </div>
    </div>
  );
};

export default WithdrawalForm;
