import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import RefrshHandler from './RefrshHandler';
import { clearTraderSessionFully } from './utils/sessionManager';
import AdminPortalGate from './components/AdminPortalGate';
import TraderPortalGate from './components/TraderPortalGate';
import {
  ADMIN_SESSION_EVENT,
  TRADER_SESSION_EVENT,
} from './utils/sessionManager';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Plans from './pages/Plans';
import Home from './pages/Home';
import Congrats from './pages/congrats';
import BalanceHistory from './pages/BalanceHistory';
import BalanceHistoryForm from './pages/BalanceHistoryForm';

import WatchList1 from './pages/WatchList1';

import PnL from './pages/PnL';

import AdminDashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import TermsAndConditions from './pages/termandcondtion';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('loggedInUser'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }

    const onTraderCleared = () => {
      setIsAuthenticated(false);
      setLoggedInUser('');
    };
    const onAdminCleared = () => {
      setLoggedInUser('');
    };

    window.addEventListener(TRADER_SESSION_EVENT, onTraderCleared);
    window.addEventListener(ADMIN_SESSION_EVENT, onAdminCleared);

    return () => {
      window.removeEventListener(TRADER_SESSION_EVENT, onTraderCleared);
      window.removeEventListener(ADMIN_SESSION_EVENT, onAdminCleared);
    };
  }, []);

  const handleLogout = () => {
    clearTraderSessionFully();
    setIsAuthenticated(false);
    setLoggedInUser('');
  };

  const PrivateRoute = ({ element }) => (
    <TraderPortalGate element={element} />
  );

  const AdminRoute = ({ element }) => (
    <AdminPortalGate element={element} />
  );

  return (
    <div className="App">
      <RefrshHandler setIsAuthenticated={setIsAuthenticated} />
      <Navbar
        isAuthenticated={isAuthenticated}
        loggedInUser={loggedInUser}
        handleLogout={handleLogout}
      />
      <main className="page-content">
      <Routes>
        <Route path='/' element={<Navigate to="/login" />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />

        <Route path='/home' element={<Home />} />
        <Route path='/plans' element={<PrivateRoute element={<Plans />} />} />

        <Route path='/watchlist' element={<PrivateRoute element={<WatchList1 />} />} />
        <Route path='/watchlist1' element={<PrivateRoute element={<WatchList1 />} />} />
        <Route path='/watchlist2' element={<Navigate to="/watchlist1" replace />} />

        <Route path='/pnl' element={<PrivateRoute element={<PnL />} />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<AdminRoute element={<AdminDashboard />} />} />
        <Route path="/putbalance" element={<AdminRoute element={<BalanceHistoryForm />} />} />

        <Route path="/term" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/congrats" element={<Congrats />} />
        <Route path="/history" element={<BalanceHistory />} />

      </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
