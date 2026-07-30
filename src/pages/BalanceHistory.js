import React, { useEffect, useState } from "react";
import api from "../config/api";
import "../styles/Withdrawal.css";

const WithdrawalHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    api
      .get("/putBalance")
      .then((res) => setHistory(res.data))
      .catch((err) => {
        console.error(err);
        setHistory([]);
      });
  }, []);

  return (
    <div className="withdrawal-page">
      <div className="withdrawal-container">
        <div className="withdrawal-header">
          <p className="withdrawal-eyebrow">LeverageX</p>
          <h1>Withdrawal History</h1>
          <p className="withdrawal-subtitle">Track your payout requests and completed withdrawals.</p>
        </div>

        <div className="glass-card withdrawal-card">
          {history.length === 0 ? (
            <p className="withdrawal-empty">No withdrawal history found</p>
          ) : (
            <div className="withdrawal-list">
              {history.map(({ _id, name, amount, method, date, status }) => (
                <div key={_id} className="withdrawal-item glass-card">
                  <div className="withdrawal-item-top">
                    <p className="withdrawal-item-name">{name}</p>
                    <p className="withdrawal-item-amount">₹{Number(amount).toLocaleString()}</p>
                  </div>
                  <p className="withdrawal-item-meta">
                    {method} • {new Date(date).toLocaleString()}
                  </p>
                  <span
                    className={`withdrawal-status ${
                      status === "Completed" ? "completed" : "pending"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalHistory;
