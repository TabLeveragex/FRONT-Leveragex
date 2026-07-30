import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import TradingView from '../components/TradingView';
import '../styles/WatchList.css';
import { BsGraphUp } from 'react-icons/bs';

const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

const WatchList2 = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [investedAmount, setInvestedAmount] = useState(0);
  const [updatedBalance, setUpdatedBalance] = useState(0);
  const [stocks, setStocks] = useState([]);
  const [showGraph, setShowGraph] = useState(false);
  const [selectedStockForGraph, setSelectedStockForGraph] = useState(null);

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) navigate('/login');
  }, [userId, navigate]);

  const fetchStocks = async () => {
    try {
      const response = await api.get('/api/watchlist2');
      setStocks(response.data);
    } catch (error) {
      console.error('Error fetching WatchList2 stocks:', error);
    }
  };

  const fetchBalance = async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/api/users/balance/${userId}`);
      const balance = Number(response.data.balance) || 0;
      setCurrentBalance(balance);
      setUpdatedBalance(balance);
    } catch (error) {
      console.error('Error fetching user balance:', error);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchBalance();
    const interval = setInterval(() => {
      fetchStocks();
      fetchBalance();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBuyClick = (option) => {
    const price = Number(option.price) || 0;
    const maxQuantity = price > 0 ? Math.floor(currentBalance / price) : 0;
    setSelectedOption(option);
    setQuantity(maxQuantity);
    setInvestedAmount(price * maxQuantity);
    setUpdatedBalance(currentBalance - price * maxQuantity);
    setShowPopup(true);
  };

  const handleBuy = async () => {
    if (updatedBalance < 0 || quantity <= 0) {
      alert('Insufficient funds for this purchase.');
      return;
    }

    try {
      const response = await api.post('/api/watchlist2/buy', {
        stockName: selectedOption.name,
        userId,
        quantity,
      });

      if (response.status === 200) {
        setCurrentBalance(response.data.updatedBalance);
        setUpdatedBalance(response.data.updatedBalance);
        setShowPopup(false);
        localStorage.setItem('watchlistType', '2');
        navigate('/pnl', {
          state: {
            watchlistType: '2',
            selectedOption,
            quantity,
            investedAmount,
            updatedBalance: response.data.updatedBalance,
          },
        });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error purchasing stock.');
    }
  };

  return (
    <div className="watchlist-page">
      <div className="watchlist-header">
        <div>
          <p className="watchlist-eyebrow">Evolution / Prime Plan</p>
          <h1>Currency Options</h1>
          <p className="watchlist-subtitle">Live prices update every second. Select an instrument to trade.</p>
        </div>
        <div className="balance-chip glass-card">
          <span className="balance-label">Available Balance</span>
          <strong className="balance-value mono">{formatMoney(currentBalance)}</strong>
          <button
            type="button"
            className="add-funds-btn"
            onClick={() => navigate('/plans#custom-add-funds')}
          >
            Add Funds
          </button>
        </div>
      </div>

      <div className="stocks-grid">
        {stocks.map((option, index) => (
          <div key={option._id || index} className="stock-card glass-card">
            <div className="stock-card-top">
              <h3>{option.name}</h3>
              <span className="stock-price mono">{formatMoney(option.price)}</span>
            </div>
            <div className="stock-card-actions">
              <button type="button" className="icon-btn" onClick={() => { setSelectedStockForGraph(option); setShowGraph(true); }}>
                <BsGraphUp />
              </button>
              <button type="button" className="btn-primary buy-btn" onClick={() => handleBuyClick(option)}>Buy</button>
            </div>
          </div>
        ))}
      </div>

      {showPopup && (
        <div className="modal-overlay">
          <div className="buy-modal glass-card">
            <h3>Confirm Purchase</h3>
            <p className="modal-stock-name">{selectedOption?.name}</p>
            <div className="modal-stats">
              <div><span>Quantity</span><strong>{quantity}</strong></div>
              <div><span>Invested</span><strong className="mono">{formatMoney(investedAmount)}</strong></div>
              <div><span>Remaining</span><strong className="mono">{formatMoney(updatedBalance)}</strong></div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-primary" onClick={handleBuy} disabled={quantity === 0}>Confirm</button>
              <button type="button" className="btn-secondary" onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showGraph && (
        <div className="graph-overlay">
          <div className="graph-panel glass-card">
            <button type="button" className="close-btn" onClick={() => setShowGraph(false)}>✕</button>
            <TradingView stock={selectedStockForGraph} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchList2;
