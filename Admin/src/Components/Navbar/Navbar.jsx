import React from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets.js';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className='admin-navbar'>
      <div className="admin-nav-left">
        <Link to="/orders" className="admin-brand-link">
          <img className='admin-logo' src={assets.logo} alt="Tomato Logo" />
          <span className="admin-badge-pill">Admin Portal</span>
        </Link>
      </div>

      <div className="admin-nav-right">
        <div className="admin-status-indicator" title="Backend Server Connected">
          <span className="status-live-pulse"></span>
          <span className="status-live-text">Live Server</span>
        </div>

        <div className="admin-profile-chip">
          <img className='admin-avatar' src={assets.profile_image} alt="Admin Avatar" />
          <div className="admin-info-text">
            <span className="admin-user-name">Administrator</span>
            <span className="admin-user-role">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
