import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../Context/StoreContext.jsx";
import axios from "axios";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { url, token, addToCart } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("live"); // 'live' | 'past'
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [reorderSuccess, setReorderSuccess] = useState("");

  const navigate = useNavigate();

  const fetchOrders = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      if (response.data && response.data.data) {
        // Sort newest orders first
        const sorted = [...response.data.data].sort((a, b) => {
          return new Date(b.date || 0) - new Date(a.date || 0);
        });
        setData(sorted);

        // Smart tab selection on initial fetch: default to past if no live orders exist
        const hasLive = sorted.some((order) => {
          const status = (order.status || "").toLowerCase().trim();
          return status === "food processing" || status === "out for delivery" || status === "order placed";
        });
        if (!hasLive) {
          setActiveTab("past");
        } else {
          setActiveTab("live");
        }
      }
    } catch (err) {
      console.error("Error fetching user orders:", err);
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Differentiate current/live orders from past orders
  const isLiveOrder = (order) => {
    const status = (order.status || "").toLowerCase().trim();
    return status === "food processing" || status === "out for delivery" || status === "order placed";
  };

  const liveOrders = data.filter(isLiveOrder);
  const pastOrders = data.filter((order) => !isLiveOrder(order));

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Recently";
    }
  };

  const getStatusStep = (status) => {
    const s = (status || "").toLowerCase().trim();
    if (s === "delivered") return 4;
    if (s === "out for delivery") return 3;
    if (s === "food processing") return 2;
    return 1; // Order Placed
  };

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;

    order.items.forEach((item) => {
      const qty = item.quantity || 1;
      for (let i = 0; i < qty; i++) {
        addToCart(item._id);
      }
    });

    setReorderSuccess(
      `Added ${order.items.length} items from Order #${order._id
        .slice(-6)
        .toUpperCase()} to cart! 🛒`
    );
    setTimeout(() => {
      setReorderSuccess("");
      navigate("/cart");
    }, 1200);
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  if (!token) {
    return (
      <div className="orders-page">
        <div className="orders-empty-card">
          <div className="empty-icon-box">🔒</div>
          <h2>Please Sign In</h2>
          <p>Sign in to view your live orders and previous order history.</p>
          <button className="primary-order-btn" onClick={() => navigate("/")}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      {/* Page Header */}
      <div className="orders-header-row">
        <div>
          <h1 className="orders-page-title">My Orders</h1>
          <p className="orders-page-subtitle">
            Track live deliveries and view your past food orders
          </p>
        </div>

        <button
          className={`refresh-orders-btn ${refreshing ? "spinning" : ""}`}
          onClick={() => fetchOrders(true)}
          title="Refresh orders"
        >
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
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
          </svg>
          <span>{refreshing ? "Updating..." : "Refresh Status"}</span>
        </button>
      </div>

      {/* Toast alert on reorder */}
      {reorderSuccess && (
        <div className="reorder-toast">
          <span>{reorderSuccess}</span>
        </div>
      )}

      {/* Tabs Filter Bar (Only Live Orders & Past Orders) */}
      <div className="orders-tabs-bar">
        <button
          className={`orders-tab-btn live-tab ${
            activeTab === "live" ? "active" : ""
          }`}
          onClick={() => setActiveTab("live")}
        >
          {liveOrders.length > 0 && <span className="live-pulse-dot"></span>}
          Live Orders
          <span className="tab-count-pill live-pill">{liveOrders.length}</span>
        </button>

        <button
          className={`orders-tab-btn ${activeTab === "past" ? "active" : ""}`}
          onClick={() => setActiveTab("past")}
        >
          Past Orders
          <span className="tab-count-pill">{pastOrders.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="orders-skeleton-list">
          <div className="order-skeleton-card"></div>
          <div className="order-skeleton-card"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="orders-empty-card">
          <div className="empty-icon-box">🍕</div>
          <h2>No Orders Found</h2>
          <p>You haven't placed any delicious orders yet. Explore our menu!</p>
          <button className="primary-order-btn" onClick={() => navigate("/")}>
            Explore Menu Now
          </button>
        </div>
      ) : (
        <div className="orders-content-layout">
          {/* TAB 1: LIVE ORDERS */}
          {activeTab === "live" && (
            <div className="orders-section-block">
              {liveOrders.length === 0 ? (
                <div className="orders-empty-card mini">
                  <div className="empty-icon-box">🛵</div>
                  <h3>No Active Live Orders</h3>
                  <p>You don't have any ongoing orders at the moment. Hungry?</p>
                  <button
                    className="primary-order-btn"
                    onClick={() => navigate("/")}
                  >
                    Order Delicious Food
                  </button>
                </div>
              ) : (
                <div className="orders-cards-grid">
                  {liveOrders.map((order) => {
                    const step = getStatusStep(order.status);
                    const isExpanded = expandedOrder === order._id;

                    return (
                      <div key={order._id} className="order-card live-order-card">
                        {/* Live Card Header */}
                        <div className="card-top-bar">
                          <div className="order-id-group">
                            <span className="order-type-tag live-tag">
                              Active Delivery
                            </span>
                            <span className="order-id">
                              Order #{order._id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                          <div className="order-meta-right">
                            <span className="order-time">
                              {formatDate(order.date)}
                            </span>
                            <span className="order-status-pill status-live">
                              <span className="status-dot-blink"></span>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Live Step Progress Tracker */}
                        <div className="live-tracker-box">
                          <div className="tracker-steps-line">
                            <div
                              className="tracker-progress-fill"
                              style={{
                                width:
                                  step === 1
                                    ? "15%"
                                    : step === 2
                                    ? "50%"
                                    : step === 3
                                    ? "85%"
                                    : "100%",
                              }}
                            ></div>
                          </div>

                          <div className="tracker-steps">
                            <div
                              className={`track-step ${
                                step >= 1 ? "completed" : ""
                              }`}
                            >
                              <div className="step-circle">
                                {step > 1 ? "✓" : "1"}
                              </div>
                              <span className="step-title">Order Placed</span>
                            </div>

                            <div
                              className={`track-step ${
                                step >= 2
                                  ? step === 2
                                    ? "current"
                                    : "completed"
                                  : ""
                              }`}
                            >
                              <div className="step-circle">
                                {step > 2 ? "✓" : "2"}
                              </div>
                              <span className="step-title">
                                Kitchen Preparing
                              </span>
                            </div>

                            <div
                              className={`track-step ${
                                step >= 3
                                  ? step === 3
                                    ? "current"
                                    : "completed"
                                  : ""
                              }`}
                            >
                              <div className="step-circle">
                                {step > 3 ? "✓" : "3"}
                              </div>
                              <span className="step-title">
                                Out for Delivery
                              </span>
                            </div>

                            <div
                              className={`track-step ${
                                step === 4 ? "completed" : ""
                              }`}
                            >
                              <div className="step-circle">4</div>
                              <span className="step-title">Delivered</span>
                            </div>
                          </div>
                        </div>

                        {/* Items Summary */}
                        <div className="order-items-snippet">
                          <div className="items-icon-wrap">
                            <img src={assets.parcel_icon} alt="Items" />
                          </div>
                          <div className="items-text-flow">
                            <p className="items-line">
                              {order.items.map((it, idx) => (
                                <span key={idx} className="item-chip">
                                  <strong>{it.quantity}x</strong> {it.name}
                                </span>
                              ))}
                            </p>
                            <span className="items-count-label">
                              {order.items.reduce(
                                (sum, i) => sum + (i.quantity || 1),
                                0
                              )}{" "}
                              Total Items
                            </span>
                          </div>
                        </div>

                        {/* Delivery Address Details */}
                        {order.address && (
                          <div className="order-address-box">
                            <svg
                              viewBox="0 0 24 24"
                              width="14"
                              height="14"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span className="address-text">
                              Delivering to: {order.address.street},{" "}
                              {order.address.city}
                            </span>
                          </div>
                        )}

                        {/* Expandable Item Breakdown */}
                        {isExpanded && (
                          <div className="expanded-breakdown">
                            <div className="breakdown-header">
                              Detailed Breakdown
                            </div>
                            <div className="breakdown-items-list">
                              {order.items.map((item, i) => (
                                <div key={i} className="breakdown-item-row">
                                  <span>
                                    {item.name}{" "}
                                    <span className="item-qty-tag">
                                      × {item.quantity}
                                    </span>
                                  </span>
                                  <span className="breakdown-price">
                                    $
                                    {(
                                      (item.price || 0) * (item.quantity || 1)
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Live Card Actions & Total */}
                        <div className="card-footer-row">
                          <div className="order-total-group">
                            <span className="total-label">Total Amount</span>
                            <span className="total-val">${order.amount}.00</span>
                          </div>

                          <div className="card-action-btns">
                            <button
                              className="details-toggle-btn"
                              onClick={() => toggleExpand(order._id)}
                            >
                              {isExpanded ? "Hide Details ↑" : "View Details ↓"}
                            </button>
                            <button
                              className="track-live-btn"
                              onClick={() => fetchOrders(true)}
                            >
                              <span className="btn-pulse-dot"></span>
                              Track Order
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PAST ORDERS */}
          {activeTab === "past" && (
            <div className="orders-section-block">
              {pastOrders.length === 0 ? (
                <div className="orders-empty-card mini">
                  <div className="empty-icon-box">📦</div>
                  <h3>No Past Orders</h3>
                  <p>You don't have any past order history yet.</p>
                  <button
                    className="primary-order-btn"
                    onClick={() => navigate("/")}
                  >
                    Explore Menu
                  </button>
                </div>
              ) : (
                <div className="orders-cards-grid">
                  {pastOrders.map((order) => {
                    const isExpanded = expandedOrder === order._id;

                    return (
                      <div
                        key={order._id}
                        className="order-card past-order-card"
                      >
                        {/* Past Card Header */}
                        <div className="card-top-bar">
                          <div className="order-id-group">
                            <span className="order-type-tag past-tag">
                              Completed
                            </span>
                            <span className="order-id">
                              Order #{order._id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                          <div className="order-meta-right">
                            <span className="order-time">
                              {formatDate(order.date)}
                            </span>
                            <span className="order-status-pill status-delivered">
                              <svg
                                viewBox="0 0 24 24"
                                width="12"
                                height="12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              {order.status || "Delivered"}
                            </span>
                          </div>
                        </div>

                        {/* Items Summary */}
                        <div className="order-items-snippet">
                          <div className="items-icon-wrap past-icon-wrap">
                            <img src={assets.parcel_icon} alt="Items" />
                          </div>
                          <div className="items-text-flow">
                            <p className="items-line">
                              {order.items.map((it, idx) => (
                                <span key={idx} className="item-chip past-chip">
                                  <strong>{it.quantity}x</strong> {it.name}
                                </span>
                              ))}
                            </p>
                            <span className="items-count-label">
                              {order.items.reduce(
                                (sum, i) => sum + (i.quantity || 1),
                                0
                              )}{" "}
                              Items ordered
                            </span>
                          </div>
                        </div>

                        {/* Expandable Item Breakdown */}
                        {isExpanded && (
                          <div className="expanded-breakdown">
                            <div className="breakdown-header">
                              Detailed Breakdown
                            </div>
                            <div className="breakdown-items-list">
                              {order.items.map((item, i) => (
                                <div key={i} className="breakdown-item-row">
                                  <span>
                                    {item.name}{" "}
                                    <span className="item-qty-tag">
                                      × {item.quantity}
                                    </span>
                                  </span>
                                  <span className="breakdown-price">
                                    $
                                    {(
                                      (item.price || 0) * (item.quantity || 1)
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {order.address && (
                              <div className="breakdown-address">
                                Delivered to: {order.address.street},{" "}
                                {order.address.city}, {order.address.state} -{" "}
                                {order.address.zipcode}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Past Card Actions & Total */}
                        <div className="card-footer-row">
                          <div className="order-total-group">
                            <span className="total-label">Paid Amount</span>
                            <span className="total-val past-val">
                              ${order.amount}.00
                            </span>
                          </div>

                          <div className="card-action-btns">
                            <button
                              className="details-toggle-btn"
                              onClick={() => toggleExpand(order._id)}
                            >
                              {isExpanded ? "Hide Details ↑" : "View Details ↓"}
                            </button>
                            <button
                              className="reorder-action-btn"
                              onClick={() => handleReorder(order)}
                              title="Add items to cart"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                <path d="M21 3v5h-5" />
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                <path d="M8 16H3v5" />
                              </svg>
                              Reorder
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
