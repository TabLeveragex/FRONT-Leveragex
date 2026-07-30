import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import TradingView from '../components/TradingView';
import '../styles/WatchList.css';

const WatchList1 = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [investedAmount, setInvestedAmount] = useState(0);
  const [updatedBalance, setUpdatedBalance] = useState(0);
  const [stocks, setStocks] = useState([]);
  const [showGraph, setShowGraph] = useState(false); // State to show TradingView
  const [selectedStockForGraph, setSelectedStockForGraph] = useState(null); // Selected stock for graph
  
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');

  const fetchStocks = async () => {
    try {
      const response = await api.get('/api/watchlist1');
      setStocks(response.data);
    } catch (error) {
      console.error('Error fetching WatchList1 stocks:', error);
    }
  };

  const fetchBalance = async () => {
    if (!userId) return;

    try {
      const response = await api.get(`/api/users/balance/${userId}`);
      setCurrentBalance(response.data.balance);
      setUpdatedBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching user balance:', error);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchBalance();
    const interval = setInterval(() => {
      fetchStocks(); // Fetch updated WatchList1 stock prices
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleBuyClick = (option) => {
    const maxQuantity = Math.floor(currentBalance / option.price);
    setSelectedOption(option);
    setQuantity(maxQuantity);
    setInvestedAmount(option.price * maxQuantity);
    setUpdatedBalance(currentBalance - (option.price * maxQuantity));
    setShowPopup(true);
  };

  const handleGraph = (stock) => {
    setSelectedStockForGraph(stock); // Set the selected stock for the graph
    setShowGraph(true); // Show TradingView component
  };

  const handleCloseGraph = () => {
    setShowGraph(false); // Close the TradingView component
  };

  const handleBuy = async () => {
    if (updatedBalance < 0) {
      alert("Insufficient funds for this purchase.");
      return;
    }

    try {
      const response = await api.post('/api/watchlist1/buy', {
        stockName: selectedOption.name,
        userId: userId,
        quantity: quantity
      });

      if (response.status === 200) {
        setCurrentBalance(response.data.updatedBalance);
        setUpdatedBalance(response.data.updatedBalance);
        setShowPopup(false);

        localStorage.setItem('watchlistType', '1');

        navigate('/pnl', {
          state: {
            watchlistType: '1',  // Flag for WatchList1
            selectedOption,
            quantity,
            investedAmount,
            updatedBalance: response.data.updatedBalance,
          }
        });
      } else {
        alert('Error purchasing stock.');
      }
    } catch (error) {
      console.error('Error buying stock:', error);
    }
  };

  return (
    <div className="watchlist-container">
      <div className="sidebar">
        <h2 className='currency-opt'>Demo Currency Options</h2>
        <div className="options">
          {stocks.map((option, index) => (
            <div key={index} className="option">
              <span>{option.name}</span>
              <span className='pad-ing'>₹{option.price.toFixed(2)}</span>
              <button className='graph' onClick={() => handleGraph(option)}>Graph</button>
              {/* <button className="buy-btn" onClick={() => handleBuyClick(option)}>Buy</button> */}
            </div>
          ))}
        </div>
        {/* <div className="balance">
          <span>Balance: ₹{currentBalance.toFixed(2)}</span>
        </div> */}
      </div>

      {/* {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Buy {selectedOption.name}</h3>
            <p>Current Balance: ₹{currentBalance.toFixed(2)}</p>
            <p>Quantity: {quantity}</p>
            <p>Invested: ₹{investedAmount.toFixed(2)}</p>
            <p>Updated Balance: ₹{updatedBalance.toFixed(2)}</p>
            <button onClick={handleBuy} disabled={quantity === 0}>Confirm Purchase</button>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )} */}

      {showGraph && (
        <div className="graph-container">
          <button className="close-btn" onClick={handleCloseGraph}>✖</button>
          <TradingView stock={selectedStockForGraph} />
        </div>
      )}

    </div>
  );
};

export default WatchList1;
