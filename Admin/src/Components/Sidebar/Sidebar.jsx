import React from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className='admin-sidebar'>
      <div className="sidebar-nav-list">
        <div className="sidebar-section-label">Management</div>

        <NavLink to="/orders" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon-wrap">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </span>
          <span className="nav-label">Orders</span>
        </NavLink>

        <NavLink to="/list" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon-wrap">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </span>
          <span className="nav-label">Menu Items</span>
        </NavLink>

        <NavLink to="/add" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon-wrap">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </span>
          <span className="nav-label">Add New Item</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
