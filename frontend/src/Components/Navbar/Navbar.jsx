import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("Home");
  const [searchOpen, setSearchOpen] = useState(false);

  const {
    cartItems,
    token,
    setToken,
    setCartItems,
    searchTerm,
    setSearchTerm,
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const location = useLocation();

  const totalCartCount = Object.values(cartItems || {}).reduce(
    (sum, qty) => sum + (qty > 0 ? qty : 0),
    0
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cartItems");
    setToken("");
    setCartItems({});
    navigate("/");
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className='navbar'>
      <Link to="/" onClick={() => setMenu("Home")}>
        <img src={assets.logo} alt="Tomato Logo" className="logo" />
      </Link>

      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => {
            setMenu("Home");
            setSearchTerm("");
          }}
          className={menu === "Home" && location.pathname === "/" ? "active" : ""}
        >
          Home
        </Link>
        <a
          href='#explore-menu'
          onClick={() => {
            setMenu("Menu");
            if (location.pathname !== "/") navigate("/");
          }}
          className={menu === "Menu" ? "active" : ""}
        >
          Menu
        </a>
        <a
          href='#app-download'
          onClick={() => {
            setMenu("Mobile-App");
            if (location.pathname !== "/") navigate("/");
          }}
          className={menu === "Mobile-App" ? "active" : ""}
        >
          Mobile-App
        </a>
        <a
          href='#footer'
          onClick={() => setMenu("Contact Us")}
          className={menu === "Contact Us" ? "active" : ""}
        >
          Contact Us
        </a>
      </ul>

      <div className="navbar-right">
        {/* Interactive Search Bar */}
        <div className={`navbar-search-wrapper ${searchOpen || searchTerm ? "expanded" : ""}`}>
          <button
            className="search-toggle-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Toggle Search"
            title="Search dishes"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search delicious dishes..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setSearchOpen(true)}
          />
          {searchTerm && (
            <button className="search-clear-btn" onClick={clearSearch} title="Clear search">
              ✕
            </button>
          )}
        </div>

        {/* Orders Nav Button (for logged-in users) */}
        {token && (
          <button
            className={`navbar-action-btn orders-nav-btn ${
              location.pathname === "/myorders" ? "active" : ""
            }`}
            onClick={() => navigate("/myorders")}
            title="View My Orders"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Orders</span>
          </button>
        )}

        {/* Cart Button with Dynamic Badge Count */}
        <Link
          to="/cart"
          className={`navbar-cart-btn ${location.pathname === "/cart" ? "active" : ""}`}
          title="Shopping Cart"
        >
          <div className="cart-icon-container">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {totalCartCount > 0 && (
              <span className="cart-badge-count">{totalCartCount}</span>
            )}
          </div>
        </Link>

        {/* Authentication Controls: Sign In or Direct Logout */}
        {!token ? (
          <button className="navbar-signin-btn" onClick={() => setShowLogin(true)}>
            Sign In
          </button>
        ) : (
          <div className="navbar-auth-group">
            <div className="user-avatar-badge" title="Logged in">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <button className="navbar-logout-btn" onClick={logout} title="Sign out">
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
