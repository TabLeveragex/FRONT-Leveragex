import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import { ReactComponent as LogoMark } from '../Assets/logo/logo.svg';

const Navbar = ({ isAuthenticated, loggedInUser, handleLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const watchListLinkText = 'WatchList';
  const watchListLinkPath = '/watchlist1';

  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/home" className="logo" onClick={handleLinkClick}>
          <LogoMark className="logo-image" aria-hidden="true" />
          <span className="logo-text">
            Leverage<span>X</span>
          </span>
        </Link>

        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <div className="menu-items">
            <Link to="/home" onClick={handleLinkClick}>Home</Link>
            <Link to="/plans" onClick={handleLinkClick}>Plans</Link>
            <Link to={watchListLinkPath} onClick={handleLinkClick}>{watchListLinkText}</Link>
            <Link to="/pnl" onClick={handleLinkClick}>P&amp;L</Link>
          </div>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <span className="user-badge">{loggedInUser}</span>
                <button type="button" className="nav-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <Link className="nav-btn" to="/login" onClick={handleLinkClick}>Login</Link>
            )}
          </div>
        </div>

        <button
          type="button"
          className="hamburger"
          onClick={handleMenuToggle}
          aria-label="Toggle menu"
        >
          <span className={menuOpen ? 'bar open' : 'bar'} />
          <span className={menuOpen ? 'bar open' : 'bar'} />
          <span className={menuOpen ? 'bar open' : 'bar'} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
