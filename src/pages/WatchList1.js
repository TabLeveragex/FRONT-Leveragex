import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import TradingView from '../components/TradingView';
import PlanBadge from '../components/PlanBadge';
import '../styles/WatchList.css';
import { BsGraphUp } from 'react-icons/bs';

const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

const WatchList1 = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [investedAmount, setInvestedAmount] = useState(0);
  const [updatedBalance, setUpdatedBalance] = useState(0);
  const [stocks, setStocks] = useState([]);
  const [showGraph, setShowGraph] = useState(false);
  const [selectedStockForGraph, setSelectedStockForGraph] = useState(null);
  const [planName, setPlanName] = useState('Rapid');
  const [isLiquidated, setIsLiquidated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
    localStorage.setItem('watchlistType', '1');
  }, [navigate]);

  useEffect(() => {
    if (!showGraph) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showGraph]);

  const fetchStocks = async () => {
    try {
      const response = await api.get('/api/watchlist1');
      setStocks(response.data);
    } catch (error) {
      console.error('Error fetching WatchList1 stocks:', error);
    }
  };

  const fetchPortfolio = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const response = await api.get('/api/users/me/stocks');
      const balance = Number(response.data.balance) || 0;
      const liquidated = Boolean(response.data.isLiquidated);
      setCurrentBalance(balance);
      setUpdatedBalance(balance);
      setIsLiquidated(liquidated);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await api.get('/api/plans/user-plan/me');
        if (response.data?.plan) {
          setPlanName(response.data.plan);
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
      }
    };

    fetchStocks();
    fetchPortfolio();
    fetchPlan();
    const interval = setInterval(() => {
      fetchStocks();
      fetchPortfolio();
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleBuyClick = (option) => {
    if (isLiquidated) {
      alert('Account liquidated. Trading is not allowed.');
      return;
    }
    const price = Number(option.price) || 0;
    const maxAffordable = price > 0 ? Math.floor(currentBalance / price) : 0;
    const buyQuantity = maxAffordable;
    setSelectedOption(option);
    setQuantity(buyQuantity);
    setInvestedAmount(price * buyQuantity);
    setUpdatedBalance(currentBalance - price * buyQuantity);
    setShowPopup(true);
  };

  const handleBuy = async () => {
    if (updatedBalance < 0 || quantity <= 0) {
      alert('Insufficient funds for this purchase.');
      return;
    }

    try {
      const response = await api.post('/api/watchlist1/buy', {
        stockName: selectedOption.name,
        quantity,
      });

      if (response.status === 200) {
        setCurrentBalance(response.data.updatedBalance);
        setUpdatedBalance(response.data.updatedBalance);
        setShowPopup(false);
        localStorage.setItem('watchlistType', '1');
        navigate('/pnl', {
          state: {
            watchlistType: '1',
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

  const openGraph = (option) => {
    setSelectedStockForGraph(option);
    setShowGraph(true);
  };

  return (
    <div className="watchlist-page">
      <div className="watchlist-header watchlist-header-compact">
        <PlanBadge plan={planName} size="small" />
        {isLiquidated && (
          <p className="watchlist-liquidation-banner">
            Account liquidated — balance is ₹0. Selling and buying are disabled.
          </p>
        )}
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
              <button
                type="button"
                className="icon-btn"
                onClick={() => openGraph(option)}
                aria-label={`Open chart for ${option.name}`}
              >
                <BsGraphUp />
              </button>
              <button
                type="button"
                className="btn-primary buy-btn"
                onClick={() => handleBuyClick(option)}
                disabled={isLiquidated}
              >
                {isLiquidated ? 'Liquidated' : 'Buy'}
              </button>
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
              <button type="button" className="btn-primary" onClick={handleBuy} disabled={quantity === 0}>
                Confirm
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowPopup(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showGraph && (
        <div className="graph-overlay" onClick={() => setShowGraph(false)} role="presentation">
          <div className="graph-shell" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button
              type="button"
              className="close-btn"
              onClick={() => setShowGraph(false)}
              aria-label="Close chart"
            >
              ✕
            </button>
            <div className="graph-panel glass-card">
              <TradingView stock={selectedStockForGraph} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchList1;
