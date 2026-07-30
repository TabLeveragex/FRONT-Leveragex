import adminApi from '../../config/adminApi';

export const watchlistService = {
  getStocks: () => adminApi.get('/api/watchlist1').then((r) => r.data),
  getTrendStatus: () => adminApi.get('/api/watchlist1/trend-status').then((r) => r.data),
  addStock: (payload) => adminApi.post('/api/watchlist1', payload).then((r) => r.data),
  updateStockAB: (stockId, payload) =>
    adminApi.put(`/api/watchlist1/${stockId}`, payload).then((r) => r.data),
  trendModeOn: () => adminApi.post('/api/watchlist1/trend-mode-on').then((r) => r.data),
  trendModeOff: () => adminApi.post('/api/watchlist1/trend-mode-off').then((r) => r.data),
  abModeOn: () => adminApi.post('/api/watchlist1/ab-mode-on').then((r) => r.data),
  abModeOff: () => adminApi.post('/api/watchlist1/ab-mode-off').then((r) => r.data),
  fluctuationOn: () => adminApi.post('/api/watchlist1/fluctuation-on').then((r) => r.data),
  fluctuationOff: () => adminApi.post('/api/watchlist1/fluctuation-off').then((r) => r.data),
  stopAllPrices: () => adminApi.post('/api/watchlist1/stop-all-prices').then((r) => r.data),
  trendUp: () => adminApi.post('/api/watchlist1/trend-up').then((r) => r.data),
  trendDown: () => adminApi.post('/api/watchlist1/trend-down').then((r) => r.data),
};

export const usersService = {
  getUsers: () => adminApi.get('/api/users').then((r) => r.data),
  updateBalance: (userId, balance) =>
    adminApi.put(`/api/users/balance/${userId}`, { balance }).then((r) => r.data),
};

export const payoutService = {
  updateStatus: (userId, payoutStatus) =>
    adminApi.put(`/api/payout/${String(userId)}`, { payoutStatus }).then((r) => r.data),
};
