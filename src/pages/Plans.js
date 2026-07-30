import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { handleError, handleSuccess } from '../utils';
import { getApiErrorMessage } from '../utils/apiErrors';
import { ToastContainer } from 'react-toastify';
import SectionHeading from '../components/SectionHeading';
import PlanBadge from '../components/PlanBadge';
import '../styles/Plans.css';

let qrcode1 = null;
let upiImg = null;
try {
  qrcode1 = require('../Assets/qrCode.jpg');
} catch {
  qrcode1 = null;
}
try {
  upiImg = require('../Assets/upiImg.png');
} catch {
  upiImg = null;
}

const PLAN_ROWS = [
  { name: 'Rapid', balance: '₹10,000', cost: '₹1,000', lifecycle: 'One Time' },
  { name: 'Evolution', balance: '₹50,000', cost: '₹5,000', lifecycle: 'Unlimited' },
  { name: 'Prime', balance: '₹1,00,000', cost: '₹10,000', lifecycle: 'Unlimited' },
];

const PLAN_PAY_AMOUNTS = {
  Rapid: '₹ 1,000',
  Evolution: '₹ 5,000',
  Prime: '₹ 10,000',
};

const CUSTOM_SUGGESTIONS = [5000, 10000, 15000, 25000, 50000, 100000];
const CUSTOM_MIN = 1000;

function formatIndianCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

function isCustomFundProduct(productType) {
  return productType === 'CustomExclusive' || productType === 'AddFunds';
}

function parseAmountInput(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return 0;
  return Number(digits);
}

function Plans() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [hasBoughtRapid, setHasBoughtRapid] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [customAmountRaw, setCustomAmountRaw] = useState('');
  const [txnId, setTxnId] = useState('');
  const navigate = useNavigate();

  const refreshPlanStatus = useCallback(async () => {
    try {
      const response = await api.get('/api/plans/user-plan/me');
      if (response.data) {
        setHasBoughtRapid(response.data.hasBoughtRapidPlan);
        setCurrentPlan(response.data.plan);
      }
    } catch (error) {
      console.error('Error fetching user plan status:', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    refreshPlanStatus();
  }, [navigate, refreshPlanStatus]);

  useEffect(() => {
    if (window.location.hash === '#custom-add-funds') {
      const el = document.getElementById('custom-add-funds');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  const pollPaymentReturn = useCallback(async (orderId) => {
    try {
      const response = await api.get(`/api/payments/payin/status/${encodeURIComponent(orderId)}`);
      const { status, productType } = response.data || {};
      if (status === 'success' && isCustomFundProduct(productType)) {
        const credited = response.data?.creditedAmount;
        const paid = response.data?.amount;
        if (credited != null && paid != null) {
          handleSuccess(
            `Payment successful! ₹${Number(paid).toLocaleString('en-IN')} added to your balance (₹1 discount applied).`
          );
        } else {
          handleSuccess('Payment successful! Funds have been added to your trading balance.');
        }
        await refreshPlanStatus();
      } else if (status === 'failed') {
        handleError('Payment failed or was cancelled. Please try again.');
      } else if (status === 'success') {
        handleSuccess('Payment received.');
        await refreshPlanStatus();
      } else {
        handleError('Payment is still processing. Refresh this page in a moment.');
      }
    } catch (err) {
      handleError(getApiErrorMessage(err, 'Could not verify payment status.'));
    }
  }, [refreshPlanStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    if (orderId) {
      pollPaymentReturn(orderId);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [pollPaymentReturn]);

  const startGatewayPayment = async (productType, amount) => {
    const mobile = localStorage.getItem('userMobile') || '';
    if (!/^[0-9]{10}$/.test(mobile)) {
      handleError('A valid 10-digit mobile number is required before payment.');
      navigate('/signup');
      return;
    }

    setGatewayLoading(true);
    try {
      const response = await api.post('/api/payments/payin/create', {
        productType,
        amount,
      });
      const { paymentUrl, success, message } = response.data;
      if (success && paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }
      handleError(message || 'Payment could not be started.');
    } catch (err) {
      handleError(getApiErrorMessage(err, 'Payment could not be started. Please try again.'));
    } finally {
      setGatewayLoading(false);
    }
  };

  const buyPlan = (plan) => {
    if (plan === 'Rapid' && hasBoughtRapid) {
      alert('You cannot buy the Rapid plan again!');
      return;
    }
    setSelectedPlan(plan);
    setTxnId('');
    setShowPopup(true);
  };

  const onTxnIdChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
    setTxnId(digits);
  };

  const handlePlanPayment = async () => {
    const mobile = localStorage.getItem('userMobile') || '';
    if (!/^[0-9]{10}$/.test(mobile)) {
      handleError('A valid 10-digit mobile number is required before accessing the watchlist.');
      setShowPopup(false);
      navigate('/signup');
      return;
    }

    if (!selectedPlan) {
      return;
    }

    if (!/^[0-9]{12}$/.test(txnId)) {
      handleError('Transaction ID must be exactly 12 digits.');
      return;
    }

    try {
      const response = await api.post('/api/plans/purchase', { plan: selectedPlan });
      if (response.status === 200) {
        handleSuccess(response.data.msg);
        setShowPopup(false);
        setTxnId('');
        if (selectedPlan === 'Rapid') {
          setHasBoughtRapid(true);
        }
        setCurrentPlan(selectedPlan);
        navigate('/watchlist1');
      }
    } catch (error) {
      handleError(error.response?.data?.msg || 'Welcome to LeverageX Team ✨');
      navigate('/watchlist1');
    }
  };

  const customAmount = parseAmountInput(customAmountRaw);

  const handleCustomPay = () => {
    if (customAmount < CUSTOM_MIN) {
      handleError(`Minimum contribution is ${formatIndianCurrency(CUSTOM_MIN)}.`);
      return;
    }
    startGatewayPayment('AddFunds', customAmount);
  };

  const onCustomInputChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
    setCustomAmountRaw(digits);
  };

  return (
    <div className="plans-container">
      <div className="page-hero">
        <SectionHeading
          kicker="Membership"
          title="Membership Plans"
          subtitle={
            currentPlan
              ? `Your active plan: ${currentPlan}`
              : 'Select a plan to unlock your funded watchlist and trading balance.'
          }
        />
      </div>

      <div className="plans-table-wrapper">
        <table className="plans-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Trading Balance</th>
              <th>Minimum Trading Days</th>
              <th>Margin</th>
              <th>Plan Cost</th>
              <th>Life Cycle</th>
            </tr>
          </thead>
          <tbody className="membership-plan">
            {PLAN_ROWS.map((plan) => (
              <tr key={plan.name}>
                <td className="plan-action-cell">
                  <div className="plan-cell-stack">
                    <PlanBadge plan={plan.name} size="small" />
                    <button
                      type="button"
                      className={
                        plan.name === 'Rapid' && hasBoughtRapid ? 'disabled-btn' : 'buy-now-btn'
                      }
                      onClick={() => buyPlan(plan.name)}
                      disabled={plan.name === 'Rapid' && hasBoughtRapid}
                    >
                      {plan.name === 'Rapid' && hasBoughtRapid ? 'Plan Used' : 'Buy Now'}
                    </button>
                  </div>
                </td>
                <td>{plan.balance}</td>
                <td>5 Days</td>
                <td>10X</td>
                <td>{plan.cost}</td>
                <td>{plan.lifecycle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="section-plan">
        <SectionHeading
          kicker="Details"
          title="Choose your plan"
          subtitle="Every tier is designed for a different stage of your trading journey."
        />
        <div className="plan-amt">
          <div className="amt funding-card">
            <PlanBadge plan="Rapid" size="small" />
            <h3>Rapid Plan (₹ 1,000)</h3>
            <p>
              Perfect for traders who want to start small and fast. For just Rs 1,000, you can join
              our Rapid Plan and start trading with leveraged capital.
            </p>
            <button
              type="button"
              className={hasBoughtRapid ? 'disabled-btn plan-card-btn' : 'buy-now-btn plan-card-btn'}
              onClick={() => buyPlan('Rapid')}
              disabled={hasBoughtRapid}
            >
              {hasBoughtRapid ? 'Plan Used' : 'Buy Now'}
            </button>
          </div>

          <div className="amt funding-card featured-plan-card">
            <PlanBadge plan="Evolution" size="small" />
            <h3>Evolution Plan (₹ 5,000)</h3>
            <p>
              Designed for those who are ready to take their trading to the next level with more
              capital and more flexibility.
            </p>
            <button
              type="button"
              className="buy-now-btn plan-card-btn"
              onClick={() => buyPlan('Evolution')}
            >
              Buy Now
            </button>
          </div>

          <div className="amt funding-card">
            <PlanBadge plan="Prime" size="small" />
            <h3>Prime Plan (₹ 10,000)</h3>
            <p>
              For serious traders aiming to trade with large amounts of capital and maximize their
              profit potential.
            </p>
            <button
              type="button"
              className="buy-now-btn plan-card-btn"
              onClick={() => buyPlan('Prime')}
            >
              Buy Now
            </button>
          </div>
        </div>
      </section>

      <section className="custom-exclusive-section" id="custom-add-funds">
        <SectionHeading
          kicker="Flexible"
          title="Custom Add Funds"
          subtitle="Pay any amount you choose — funds are credited to your trading balance after successful payment."
        />
        <div className="custom-exclusive-card">
          <div className="custom-exclusive-badge">Any amount</div>
          <h3>Enter amount to add</h3>
          <p className="custom-exclusive-note">
            A fixed ₹1 discount is applied: you pay and receive ₹1 less than the amount you enter
            (e.g. enter ₹5,000 → pay and credit ₹4,999).
          </p>

          <div className="custom-amount-suggestions">
            {CUSTOM_SUGGESTIONS.map((value) => (
              <button
                key={value}
                type="button"
                className="amount-chip"
                onClick={() => setCustomAmountRaw(String(value))}
              >
                {formatIndianCurrency(value)}
              </button>
            ))}
          </div>

          <label className="custom-amount-label" htmlFor="customAmount">
            Amount (INR)
          </label>
          <div className="custom-amount-input-wrap">
            <span className="currency-prefix">₹</span>
            <input
              id="customAmount"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 25,000"
              className="custom-amount-input"
              value={customAmountRaw ? Number(customAmountRaw).toLocaleString('en-IN') : ''}
              onChange={onCustomInputChange}
            />
          </div>
          <p className="custom-amount-preview">
            You will pay: <strong>{formatIndianCurrency(customAmount || 0)}</strong>
            {customAmount > 0 && customAmount < CUSTOM_MIN && (
              <span className="custom-amount-warning"> (minimum {formatIndianCurrency(CUSTOM_MIN)})</span>
            )}
          </p>

          <button
            type="button"
            className="buy-now-btn custom-pay-btn gateway-pay-btn"
            onClick={handleCustomPay}
            disabled={gatewayLoading || customAmount < CUSTOM_MIN}
          >
            {gatewayLoading ? 'Opening gateway…' : 'Pay Now — Add Funds'}
          </button>
        </div>
      </section>

      {showPopup && selectedPlan && (
        <div className="popup-overlay">
          <div className="popup qr-background popup-responsive">
            <h2 className="qr-h2">Pay for {selectedPlan}</h2>
            <p className="qr-p">Total: {PLAN_PAY_AMOUNTS[selectedPlan] || ''} /-</p>
            <p className="pay-here">Pay Here</p>
            {qrcode1 ? (
              <img src={qrcode1} alt="" className="qr-image" />
            ) : (
              <p className="qr-p">QR code image unavailable — use UPI ID below</p>
            )}
            <p className="qr-p qr-pq">leveragexfund-4@okicici</p>
            {upiImg && <img src={upiImg} alt="" className="upi-img" />}
            <input
              placeholder="Enter 12-digit transaction ID"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={12}
              className="input-num"
              value={txnId}
              onChange={onTxnIdChange}
              required
            />
            <p className="qr-txn-hint">
              {txnId.length}/12 digits
              {txnId.length > 0 && txnId.length !== 12 && ' — enter all 12 numbers'}
            </p>
            <div className="popup-actions">
              <button type="button" className="done-btn done-bttn" onClick={handlePlanPayment}>
                Done
              </button>
              <button type="button" className="cancel-btn" onClick={() => { setShowPopup(false); setTxnId(''); }}>
                X
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default Plans;
