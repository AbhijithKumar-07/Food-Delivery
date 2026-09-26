import React, { useContext, useState, useRef, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("Home");
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const {
    cartItems,
    food_list,
    token,
    setToken,
    setCartItems,
    searchTerm,
    setSearchTerm,
    url,
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const location = useLocation();

  const searchContainerRef = useRef(null);
  const profileContainerRef = useRef(null);

  const totalCartCount = Object.values(cartItems || {}).reduce(
    (sum, qty) => sum + (qty > 0 ? qty : 0),
    0
  );

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        profileContainerRef.current &&
        !profileContainerRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cartItems");
    setToken("");
    setCartItems({});
    setProfileOpen(false);
    navigate("/");
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setSearchOpen(true);
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
    }
    setTimeout(() => {
      const el = document.getElementById("food-display");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
    setSearchOpen(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchOpen(false);
  };

  // Live search preview matches
  const liveResults = (food_list || []).filter((item) => {
    if (!searchTerm || !searchTerm.trim()) return false;
    const term = searchTerm.toLowerCase().trim();
    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.category && item.category.toLowerCase().includes(term))
    );
  }).slice(0, 5);

  const getImageSrc = (image) => {
    if (!image) return assets.logo;
    if (
      typeof image === "string" &&
      (image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("data:"))
    ) {
      return image;
    }
    return `${url}/images/${image}`;
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
        {/* 1. Real-Time Interactive Search Bar */}
        <div className="navbar-search-container" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="navbar-search-bar">
            <span className="search-bar-icon">
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
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              className="search-bar-input"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setSearchOpen(true)}
            />
            {searchTerm && (
              <button
                type="button"
                className="search-bar-clear"
                onClick={clearSearch}
                title="Clear"
              >
                ✕
              </button>
            )}
          </form>

          {/* Live Search Popup Dropdown */}
          {searchOpen && searchTerm.trim() && (
            <div className="search-live-dropdown">
              <div className="search-dropdown-header">
                <span>Dishes matching "{searchTerm}"</span>
              </div>
              {liveResults.length === 0 ? (
                <div className="search-no-results">No matching dishes found</div>
              ) : (
                <div className="search-results-list">
                  {liveResults.map((dish) => (
                    <div
                      key={dish._id}
                      className="search-result-row"
                      onClick={() => {
                        setSearchTerm(dish.name);
                        setSearchOpen(false);
                        if (location.pathname !== "/") navigate("/");
                        setTimeout(() => {
                          const el = document.getElementById("food-display");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      }}
                    >
                      <img
                        src={getImageSrc(dish.image)}
                        alt={dish.name}
                        className="search-result-img"
                        onError={(e) => {
                          e.target.src = assets.logo;
                        }}
                      />
                      <div className="search-result-meta">
                        <span className="search-result-name">{dish.name}</span>
                        <span className="search-result-cat">{dish.category}</span>
                      </div>
                      <span className="search-result-price">${dish.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Distinct Orders Button (with Document / Receipt Icon) */}
        {token && (
          <button
            className={`navbar-orders-btn ${
              location.pathname === "/myorders" ? "active" : ""
            }`}
            onClick={() => navigate("/myorders")}
            title="My Orders"
          >
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Orders</span>
          </button>
        )}

        {/* 3. Distinct Shopping Trolley Cart Icon */}
        <Link
          to="/cart"
          className={`navbar-cart-pill ${location.pathname === "/cart" ? "active" : ""}`}
          title="Cart"
        >
          <div className="cart-pill-inner">
            <svg
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {totalCartCount > 0 && (
              <span className="cart-counter-badge">{totalCartCount}</span>
            )}
          </div>
        </Link>

        {/* 4. Integrated Profile & Logout Popover */}
        {!token ? (
          <button className="navbar-signin-btn" onClick={() => setShowLogin(true)}>
            Sign In
          </button>
        ) : (
          <div className="navbar-profile-container" ref={profileContainerRef}>
            <button
              className={`profile-trigger-btn ${profileOpen ? "active" : ""}`}
              onClick={() => setProfileOpen(!profileOpen)}
              title="Account Menu"
              aria-label="User Account"
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>

            {/* Click-Activated Profile Popover */}
            {profileOpen && (
              <div className="profile-popover-menu">
                <div className="profile-popover-header">
                  <span className="popover-greeting">Signed in as User</span>
                </div>

                <div
                  className="profile-menu-item"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/myorders");
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  <span>My Orders</span>
                </div>

                <div className="profile-menu-divider"></div>

                <div className="profile-menu-item logout-item" onClick={logout}>
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
