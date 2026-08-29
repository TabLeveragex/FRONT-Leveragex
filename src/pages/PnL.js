import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import "../styles/PnL.css";
import SectionHeading from "../components/SectionHeading";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { MdOutlineAttachMoney } from "react-icons/md";

const PnL = () => {
  const [stocks, setStocks] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [updatedStocks, setUpdatedStocks] = useState([]);
  const [isLiquidated, setIsLiquidated] = useState(false);
  const [liquidationWarning, setLiquidationWarning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserStocks = async () => {
    try {
      const response = await api.get("/api/users/me/stocks");
      setStocks(response.data.stocks || []);
      setUserBalance(Number(response.data.balance) || 0);
      setIsLiquidated(Boolean(response.data.isLiquidated));
    } catch (error) {
      console.error("Error fetching user stocks:", error);
    }
  };

  const fetchRealTimePrices = async () => {
    try {
      const response = await api.get("/api/watchlist1");
      setUpdatedStocks(response.data);
    } catch (error) {
      console.error("Error fetching real-time prices:", error);
    }
  };

  useEffect(() => {
    fetchUserStocks();
    fetchRealTimePrices();
    const interval = setInterval(() => {
      fetchRealTimePrices();
      fetchUserStocks();
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const calculateProfitLoss = (buyPrice, currentPrice, quantity) => {
    return (currentPrice - buyPrice) * quantity;
  };

  const handleSell = async (stockName, quantity) => {
    if (isLiquidated) {
      alert("Account liquidated. Selling is not allowed.");
      return;
    }

    try {
      const response = await api.post("/api/users/sell", {
        stockName,
        quantity,
        watchlistType: "1",
      });

      if (response.status === 200) {
        if (typeof response.data.updatedBalance === "number") {
          setUserBalance(response.data.updatedBalance);
        }
        fetchUserStocks();
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      alert(message || "Error selling stock.");
      console.error("Error selling stock:", message);
    }
  };

  useEffect(() => {
    if (isLiquidated) {
      setLiquidationWarning(true);
      return;
    }

    if (!stocks.length || !updatedStocks.length) {
      setLiquidationWarning(false);
      return;
    }

    const thresholdBreached = stocks.some((stock) => {
      const currentStock = updatedStocks.find((s) => s.name === stock.stockName);
      const currentPrice = Number(currentStock?.price ?? stock.buyPrice);
      if (!Number.isFinite(currentPrice) || currentPrice < 0) {
        return false;
      }
      return currentPrice <= stock.buyPrice * 0.9;
    });

    setLiquidationWarning(thresholdBreached);
  }, [stocks, updatedStocks, isLiquidated]);

  const [payoutStatus, setPayoutStatus] = useState("Disable");
  const [showPendingPopup, setShowPendingPopup] = useState(false);

  useEffect(() => {
    const fetchPayoutStatus = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const response = await api.get(`/api/payout/users/${userId}`);
        setPayoutStatus(response.data.payoutStatus);
      } catch (err) {
        console.error("Failed to fetch payout status:", err);
      }
    };

    if (localStorage.getItem("token")) fetchPayoutStatus();
  }, []);

  const handleShow = () => {
    navigate("/history");
  };

  return (
    <div className="pnl-page">
      <div className="pnl-hero page-hero">
        <SectionHeading
          kicker="Portfolio"
          title="Profit & Loss"
          subtitle="Track open positions, live P&L, balance, and withdrawal status."
        />
      </div>
    <div className="pnl-container">
      {liquidationWarning && (
        <div className="liquidation-warning">
          {isLiquidated
            ? "10% platform loss limit triggered. Your account has been forcefully liquidated — balance is ₹0"
            : "10% platform loss limit reached. Your loss is shown below — balance will be forcefully reset to ₹0."}
        </div>
      )}
      <div className="portfolio">
        {stocks.length === 0 && isLiquidated && (
          <div className="liquidation-warning">
            All positions were liquidated under the platform 10% loss rule.
          </div>
        )}
        {stocks.map((stock, index) => {
          const currentStock = updatedStocks.find(
            (s) => s.name === stock.stockName
          );
          const currentPrice = currentStock
            ? currentStock.price
            : stock.buyPrice;
          const profitLoss = calculateProfitLoss(
            stock.buyPrice,
            currentPrice,
            stock.quantity
          );
          const sellDisabled = isLiquidated;

          return (
            <div key={index} className="position-window">
              <div className="Profit-Loss">
                <p className="total-name">Total P&L</p>
                <p
                  className={`moving-pnl ${
                    profitLoss >= 0 ? "positive" : "negative"
                  }`}
                >
                  ₹{profitLoss.toFixed(2)}
                </p>
              </div>

              <div className="sec-box">
                <p className="stockName">{stock.stockName}</p>

                <p>
                  Qty<span className="qunty">{stock.quantity}</span>
                </p>

                <p>
                  Avg Price{" "}
                  <span className="buyPrice">₹{stock.buyPrice.toFixed(2)}</span>
                </p>

                <p>
                  CMP{" "}
                  <span className="curr-price">₹{currentPrice.toFixed(2)}</span>
                </p>

                <p>
                  Invested Amount{" "}
                  <span className="invst-amt">
                    ₹{stock.investedAmount.toFixed(2)}
                  </span>
                </p>
              </div>

              <button
                onClick={() => handleSell(stock.stockName, stock.quantity)}
                className="sell-btn"
                disabled={sellDisabled}
                style={{
                  opacity: sellDisabled ? 0.5 : 1,
                  cursor: sellDisabled ? "not-allowed" : "pointer",
                }}
              >
                {sellDisabled ? "Liquidated" : "Sell"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="balance-updt">
        <div className="balance-folder">
          <div className="leverage-balance">
            <div className="company1">
              <h1 className="company-name">
                Leverage <span>X</span>
              </h1>
            </div>
            <div className="balance">
              <span>
                Balance Amount <p>₹{Number(userBalance || 0).toFixed(2)}</p>
              </span>
            </div>

            <button
              className="payout-btn"
              disabled={payoutStatus === "Disable" || isLiquidated}
              onClick={() => {
                if (payoutStatus === "Pending") {
                  setShowPendingPopup(true);
                } else if (payoutStatus === "Enable") {
                  navigate("/congrats");
                }
              }}
              style={{
                backgroundColor:
                  payoutStatus === "Disable" || isLiquidated ? "grey" : "#4CAF50",
                cursor:
                  payoutStatus === "Disable" || isLiquidated ? "not-allowed" : "pointer",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                marginTop: "20px",
                fontSize: "20px",
                gap: "30px",
              }}
            >
              <FaMoneyCheckAlt /> Withdrawal
            </button>

            {showPendingPopup && (
              <div className="pending-popup-overlay">
                <div className="pending-popup-card glass-card">
                  <h1 className="company-name">
                    Leverage <span>X</span>
                  </h1>
                  <h2 className="pending-popup-title">
                    <MdOutlineAttachMoney />
                    Pending Payment
                  </h2>
                  <p>Please clear your payment before withdrawal.</p>
                  <p>Check your mail for more information.</p>
                  <button
                    type="button"
                    className="pending-popup-close"
                    onClick={() => setShowPendingPopup(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <button type="button" className="history-link-btn" onClick={() => handleShow()}>
              Withdrawal History
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PnL;
