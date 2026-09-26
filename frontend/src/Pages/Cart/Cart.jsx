import React, { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../Context/StoreContext";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";

const CartItemImage = ({ image, name, url }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const getImageSrc = () => {
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
    <div className="cart-item-img-container">
      {!loaded && <div className="cart-item-skeleton"></div>}
      <img
        src={error ? assets.logo : getImageSrc()}
        alt={name || "Item"}
        className={`cart-item-img ${loaded ? "loaded" : "loading"}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
      />
    </div>
  );
};

const Cart = () => {
  const {
    cartItems,
    food_list,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
  } = useContext(StoreContext);

  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState("");
  const [promoMessage, setPromoMessage] = useState({ text: "", type: "" });

  const subtotal = getTotalCartAmount();
  const totalItemsCount = Object.values(cartItems).reduce(
    (sum, qty) => sum + (qty > 0 ? qty : 0),
    0
  );

  // Delivery fee logic: Free delivery over $50, otherwise $2
  const isFreeDelivery = subtotal >= 50 && subtotal > 0;
  const deliveryFee = subtotal === 0 ? 0 : isFreeDelivery ? 0 : 2;
  const finalTotal = Math.max(0, subtotal - discount + deliveryFee);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === "FEAST20") {
      const discountVal = (subtotal * 0.2).toFixed(2);
      setDiscount(Number(discountVal));
      setAppliedPromo("FEAST20 (20% OFF)");
      setPromoMessage({ text: "20% discount applied successfully! 🎉", type: "success" });
    } else if (code === "SAVE5") {
      setDiscount(5);
      setAppliedPromo("SAVE5 ($5 OFF)");
      setPromoMessage({ text: "$5 discount applied successfully! 🎁", type: "success" });
    } else if (code === "FREEDEL") {
      setDiscount(deliveryFee);
      setAppliedPromo("FREEDEL (Free Delivery)");
      setPromoMessage({ text: "Free delivery unlocked! 🚀", type: "success" });
    } else {
      setPromoMessage({ text: "Invalid promo code. Try 'FEAST20' or 'SAVE5'", type: "error" });
    }
    setPromoCode("");
  };

  const handleRemovePromo = () => {
    setDiscount(0);
    setAppliedPromo("");
    setPromoMessage({ text: "", type: "" });
  };

  const deleteItem = (itemId) => {
    const qty = cartItems[itemId] || 0;
    for (let i = 0; i < qty; i++) {
      removeFromCart(itemId);
    }
  };

  if (totalItemsCount === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart-card">
          <div className="empty-cart-icon-wrapper">
            <svg
              className="empty-cart-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h2>Your Cart is Empty</h2>
          <p>
            Looks like you haven't added anything to your cart yet. Explore our delicious dishes and treat yourself!
          </p>
          <button className="explore-menu-btn" onClick={() => navigate("/")}>
            Explore Delicious Menu 🍕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Checkout Step Header */}
      <div className="cart-header-section">
        <div>
          <h1 className="cart-title">Shopping Cart</h1>
          <p className="cart-subtitle">
            You have <span className="highlight-badge">{totalItemsCount} items</span> in your cart
          </p>
        </div>
        <div className="cart-steps">
          <div className="step active">
            <span className="step-num">1</span>
            <span className="step-label">Cart</span>
          </div>
          <div className="step-divider"></div>
          <div className="step">
            <span className="step-num">2</span>
            <span className="step-label">Delivery</span>
          </div>
          <div className="step-divider"></div>
          <div className="step">
            <span className="step-num">3</span>
            <span className="step-label">Payment</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Cart Layout */}
      <div className="cart-layout">
        {/* Left Column: Cart Items List */}
        <div className="cart-items-column">
          <div className="cart-table-header">
            <span className="col-item">Product</span>
            <span className="col-price">Price</span>
            <span className="col-qty">Quantity</span>
            <span className="col-total">Total</span>
            <span className="col-action"></span>
          </div>

          <div className="cart-items-list">
            {food_list.map((item) => {
              if (cartItems[item._id] > 0) {
                return (
                  <div key={item._id} className="cart-item-card">
                    <div className="cart-item-product">
                      <CartItemImage
                        image={item.image}
                        name={item.name}
                        url={url}
                      />
                      <div className="cart-item-meta">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <span className="cart-item-category">
                          {item.category || "Delicious Dish"}
                        </span>
                        <span className="cart-item-unit-price-mobile">
                          ${item.price} each
                        </span>
                      </div>
                    </div>

                    <div className="cart-item-price">${item.price}</div>

                    <div className="cart-item-quantity-control">
                      <button
                        className="qty-btn"
                        onClick={() => removeFromCart(item._id)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="qty-value">{cartItems[item._id]}</span>
                      <button
                        className="qty-btn"
                        onClick={() => addToCart(item._id)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-subtotal">
                      ${item.price * cartItems[item._id]}
                    </div>

                    <div className="cart-item-remove">
                      <button
                        className="delete-btn"
                        onClick={() => deleteItem(item._id)}
                        title="Remove from cart"
                        aria-label="Remove item"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Continue Shopping & Free Delivery Meter */}
          <div className="cart-items-footer">
            <button className="continue-shopping-btn" onClick={() => navigate("/")}>
              ← Continue Shopping
            </button>
            {subtotal < 50 && (
              <div className="delivery-meter">
                <p>
                  Add <strong>${(50 - subtotal).toFixed(2)}</strong> more to get{" "}
                  <span className="free-tag">FREE Delivery</span>!
                </p>
                <div className="meter-track">
                  <div
                    className="meter-fill"
                    style={{ width: `${Math.min(100, (subtotal / 50) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
            {subtotal >= 50 && (
              <div className="free-delivery-unlocked">
                🎉 You've unlocked <strong>FREE Delivery</strong>!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Card */}
        <div className="cart-summary-column">
          <div className="summary-card">
            <h3 className="summary-title">Order Summary</h3>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Items Subtotal</span>
                <span className="row-val">${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="summary-row discount-row">
                  <span className="discount-label">
                    Discount ({appliedPromo})
                    <button className="remove-promo-btn" onClick={handleRemovePromo} title="Remove code">
                      ✕
                    </button>
                  </span>
                  <span className="discount-val">-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Estimated Delivery</span>
                <span className="row-val">
                  {deliveryFee === 0 ? (
                    <span className="free-delivery-badge">FREE</span>
                  ) : (
                    `$${deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Grand Total</span>
                <span className="total-val">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code Input Box */}
            <div className="promo-box">
              <p className="promo-title">Have a coupon or promo code?</p>
              <form onSubmit={handleApplyPromo} className="promo-form">
                <input
                  type="text"
                  placeholder="e.g. FEAST20"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="promo-input"
                />
                <button type="submit" className="promo-submit-btn">
                  Apply
                </button>
              </form>
              {promoMessage.text && (
                <p className={`promo-msg ${promoMessage.type}`}>
                  {promoMessage.text}
                </p>
              )}
            </div>

            {/* Checkout Action Button */}
            <button
              className="checkout-btn"
              onClick={() => navigate("/order")}
            >
              <span>Proceed to Checkout</span>
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-item">
                <span className="trust-icon">🔒</span>
                <span>Secure Checkout</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">⚡</span>
                <span>Fast 30 Min Delivery</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🌱</span>
                <span>100% Fresh Food</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
