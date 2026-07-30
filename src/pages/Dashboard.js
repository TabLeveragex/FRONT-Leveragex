// Importing necessary libraries and components
import React, { useState, useEffect } from "react"; // React hooks for state and lifecycle management
import adminApi from "../config/adminApi";
import { logoutAdminSession } from "../utils/authStorage";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify"; // For showing success and error notifications
import { handleError, handleSuccess } from "../utils"; // Utility functions to show error and success messages
import "../styles/Admin.css"; // Admin dashboard styles
// Dashboard component for managing users and stocks
function Dashboard() {
  // State variables for managing users and stock data
  const [users, setUsers] = useState([]); // List of users
  const [stocks, setStocks] = useState([]);
  const [stockForm, setStockForm] = useState({ symbol: "", name: "", currentPrice: "" });
  const [priceDrafts, setPriceDrafts] = useState({});
  const [balanceEdits, setBalanceEdits] = useState({});
  const [isAddingStock, setIsAddingStock] = useState(false);
  const navigate = useNavigate();

  const preventEnterSubmit = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const handleAdminLogout = async () => {
    await logoutAdminSession(adminApi);
    navigate('/admin/login');
  };

  const parseRequiredNumber = (value) => {
    if (value === "" || value === null || value === undefined) {
      return NaN;
    }
    return Number(value);
  };

  // useEffect hook to fetch user data and stock data when the component mounts
  useEffect(() => {
    fetchUsers();
    fetchStocks();
    const fetchStocksInterval = setInterval(() => {
      fetchStocks(true);
    }, 1000);
    // Balances are edited directly in MongoDB; refresh so edits show up here.
    const fetchUsersInterval = setInterval(fetchUsers, 5000);

    return () => {
      clearInterval(fetchStocksInterval);
      clearInterval(fetchUsersInterval);
    };
  }, []);

  // Function to fetch users from the backend
  const fetchUsers = async () => {
    try {
      const response = await adminApi.get("/api/users");  // Get request to fetch users
      setUsers(response.data); // Update users state with fetched data
    } catch (error) {
      console.error("Error fetching users:", error); // Handle errors while fetching users
    }
  };

  // Function to fetch WatchList stocks (server computes current + live price)
  const fetchStocks = async (silent = false) => {
    try {
      const response = await adminApi.get("/api/watchlist1");
      setStocks(response.data);
    } catch (error) {
      if (!silent) {
        handleError("Error fetching watchlist stocks");
      } else {
        console.error("Error fetching watchlist stocks:", error);
      }
    }
  };

  // Add a new stock — it starts drifting UP immediately from the given price
  const addStock = async (event) => {
    event.preventDefault();
    const price = parseRequiredNumber(stockForm.currentPrice);

    if (!stockForm.symbol.trim() || !stockForm.name.trim() || !Number.isFinite(price) || price <= 0) {
      handleError("Please enter a symbol, company name and a price greater than 0.");
      return;
    }
    if (isAddingStock) {
      return;
    }
    setIsAddingStock(true);
    try {
      await adminApi.post("/api/watchlist1", {
        symbol: stockForm.symbol.trim(),
        name: stockForm.name.trim(),
        currentPrice: price,
      });
      handleSuccess("Stock added");
      setStockForm({ symbol: "", name: "", currentPrice: "" });
      fetchStocks();
    } catch (error) {
      handleError(error.response?.data?.message || "Error adding stock");
    } finally {
      setIsAddingStock(false);
    }
  };

  // Set price: the price JUMPS to that value instantly, then keeps trending
  const setStockPrice = async (stockId) => {
    const price = parseRequiredNumber(priceDrafts[stockId]);
    if (!Number.isFinite(price) || price <= 0) {
      handleError("Enter a valid price");
      return;
    }
    try {
      await adminApi.patch("/api/watchlist1", { stockId, currentPrice: price });
      handleSuccess(`Price set to ₹${price}`);
      setPriceDrafts((d) => ({ ...d, [stockId]: "" }));
      fetchStocks();
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to set price");
    }
  };

  // Set trend: re-anchors at the current drifted price, so the direction
  // reverses smoothly without a jump
  const setStockTrend = async (stockId, trend) => {
    try {
      await adminApi.patch("/api/watchlist1", { stockId, trend });
      const label =
        trend === "up"
          ? "upside"
          : trend === "down"
            ? "downside"
            : "neutral (±3 only)";
      handleSuccess(`Trend set to ${label}`);
      fetchStocks();
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to set trend");
    }
  };

  // Remove a stock from the watchlist (also cleans user portfolios)
  const deleteStock = async (stock) => {
    if (!window.confirm(`Remove "${stock.name}" from the watchlist?`)) {
      return;
    }
    try {
      await adminApi.delete(`/api/watchlist1/${stock._id}`);
      handleSuccess("Stock removed");
      fetchStocks();
    } catch (error) {
      handleError(error.response?.data?.message || "Failed to remove stock");
    }
  };

  const togglePayout = async (userId, newStatus) => {
    try {
      await adminApi.put(`/api/payout/${String(userId)}`, {
        payoutStatus: newStatus,
      });
      handleSuccess(`Payout status set to ${newStatus}`);
      fetchUsers(); // Refresh
    } catch (error) {
      handleError("Failed to update payout status");
    }
  };

  const updateUserBalance = async (userId) => {
    const raw = balanceEdits[userId];
    if (raw === "" || raw === undefined || raw === null) {
      handleError("Please enter a valid balance.");
      return;
    }
    const balance = Number(raw);
    if (!Number.isFinite(balance)) {
      handleError("Please enter a valid balance.");
      return;
    }
    try {
      await adminApi.put(`/api/users/balance/${userId}`, { balance });
      handleSuccess("User balance updated successfully!");
      setBalanceEdits((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      fetchUsers();
    } catch (error) {
      handleError(error.response?.data?.message || "Error updating user balance");
    }
  };

  const handleShow = () => {
    navigate("/putbalance");
  };

  // JSX to render the dashboard UI
  return (
    <div className="admin-dashboard admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <button type="button" className="admin-logout-btn" onClick={handleAdminLogout}>
          Admin Logout
        </button>
      </div>
      {/* WatchList Section */}
      <div className="stocks-section">
        <h2>Manage WatchList Stocks</h2>
        <p className="watchlist-admin-note">
          Every stock drifts on its own: <strong>0.5/sec</strong> in its trend direction with small
          pullbacks and recoveries, plus a live <strong>±3</strong> tick. Use <strong>Set</strong> to
          jump the price instantly, and <strong>▲ Upside / ▼ Downside / ◆ Neutral</strong> to control
          drift (neutral = fixed price with only ±3 live jitter).
        </p>

        <div className="watchlist-panels">
          {/* ADD STOCK BOX (left panel) */}
          <div className="watchlist-panel add-stock-panel">
            <h3>Add Stock</h3>
            <form className="watchlist-add-form" onSubmit={addStock} noValidate>
              <input
                type="text"
                placeholder="Symbol (e.g. TCS)"
                value={stockForm.symbol}
                onChange={(e) => setStockForm({ ...stockForm, symbol: e.target.value })}
              />
              <input
                type="text"
                placeholder="Company Name"
                value={stockForm.name}
                onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })}
              />
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Current Price"
                value={stockForm.currentPrice}
                onChange={(e) => setStockForm({ ...stockForm, currentPrice: e.target.value })}
              />
              <button type="submit" disabled={isAddingStock}>
                {isAddingStock ? "Adding…" : "Add Stock"}
              </button>
              <p className="watchlist-admin-note add-stock-hint">
                New stocks start drifting UP immediately from the given price.
              </p>
            </form>
          </div>

          {/* STOCKS BOX (right panel) */}
          <div className="watchlist-panel stocks-table-panel">
            <h3>Stocks</h3>
            {stocks.length === 0 ? (
              <p className="watchlist-admin-note">No stocks added yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Current Price</th>
                    <th>Live Price (±3)</th>
                    <th>Set Price</th>
                    <th>Trend</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => {
                    const up = Number(stock.livePrice) >= Number(stock.currentPrice);
                    return (
                      <tr key={stock._id}>
                        <td>
                          <span className="stock-symbol">{stock.symbol || stock.name}</span>
                          {stock.symbol && <span className="stock-company"> {stock.name}</span>}
                        </td>
                        <td>₹{Number(stock.currentPrice ?? 0).toFixed(2)}</td>
                        <td className={up ? "live-price-up" : "live-price-down"}>
                          ₹{Number(stock.livePrice ?? 0).toFixed(2)} {up ? "▲" : "▼"}
                        </td>
                        <td>
                          <div className="set-price-row">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              placeholder="Price"
                              value={priceDrafts[stock._id] ?? ""}
                              onChange={(e) =>
                                setPriceDrafts((d) => ({ ...d, [stock._id]: e.target.value }))
                              }
                              onKeyDown={preventEnterSubmit}
                            />
                            <button type="button" onClick={() => setStockPrice(stock._id)}>
                              Set
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="trend-pair">
                            <button
                              type="button"
                              className={`trend-pair-btn ${stock.trend === "up" ? "trend-pair-btn-up-active" : ""}`}
                              title="Upside — price drifts up smoothly from here"
                              onClick={() => setStockTrend(stock._id, "up")}
                            >
                              ▲ Upside
                            </button>
                            <button
                              type="button"
                              className={`trend-pair-btn ${stock.trend === "down" ? "trend-pair-btn-down-active" : ""}`}
                              title="Downside — price drifts down smoothly from here"
                              onClick={() => setStockTrend(stock._id, "down")}
                            >
                              ▼ Downside
                            </button>
                            <button
                              type="button"
                              className={`trend-pair-btn ${stock.trend === "neutral" ? "trend-pair-btn-neutral-active" : ""}`}
                              title="Neutral — price stays here; only ±3 live jitter"
                              onClick={() => setStockTrend(stock._id, "neutral")}
                            >
                              ◆ Neutral
                            </button>
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="delete-stock-btn"
                            onClick={() => deleteStock(stock)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {/* Button For Adding Withdrawal History */}
      <div>
        Add Users Withdrawal History 👉
        <button type="button" onClick={() => handleShow()}>
          Add Users Withdrawal History
        </button>
      </div>
      {/* User Balance Section */}
      <div className="users-section">
        <h2>
          Manage User Balances ({users.length} traders
          {users.filter((u) => u.isLiquidated).length > 0 &&
            ` · ${users.filter((u) => u.isLiquidated).length} liquidated`}
          )
        </h2>
        <p className="watchlist-admin-note">
          Set each trader&apos;s balance below. Liquidated accounts are cleared when balance is set above zero.
        </p>
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Mobile no.</th>
              <th>Current Balance</th>
              <th>New Balance</th>
              <th>Update</th>
              <th>Payout</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.fullName}</td>
                <td>{user.mobile}</td>
                <td className={Number(user.balance) > 10000000 ? "invalid-balance" : ""}>
                  ₹{Number(user.balance ?? 0).toFixed(2)}
                  {user.isLiquidated && (
                    <span className="liquidated-tag"> liquidated</span>
                  )}
                  {Number(user.balance) > 10000000 && (
                    <span className="invalid-balance-tag"> invalid — fix in MongoDB</span>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={balanceEdits[user._id] ?? ""}
                    onChange={(e) =>
                      setBalanceEdits((prev) => ({ ...prev, [user._id]: e.target.value }))
                    }
                    onKeyDown={preventEnterSubmit}
                  />
                </td>
                <td>
                  <button type="button" onClick={() => updateUserBalance(user._id)}>
                    Update
                  </button>
                </td>
                <td>
                  <select
                    value={user.payoutStatus}
                    onChange={(e) => togglePayout(user._id, e.target.value)}
                  >
                    <option value="Enable">Enable</option>
                    <option value="Pending">Pending</option>
                    <option value="Disable">Disable</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer /> {/* Notification container */}
    </div>
  );
}

// Exporting the Dashboard component
export default Dashboard;
