import React, { useState, useEffect } from "react";
import "./Orders.css";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets.js";

const Orders = ({ url }) => {
  const [orders, setOrders] = useState(() => {
    try {
      const cached = localStorage.getItem("admin_cached_orders");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load cached orders:", e);
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem("admin_cached_orders");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return false;
      }
    } catch (e) {}
    return true;
  });
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAllOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      if (!isManual && orders.length === 0) setLoading(true);
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data && response.data.success) {
        // Sort newest orders first
        const sorted = (response.data.data || []).sort((a, b) => {
          return new Date(b.date || 0) - new Date(a.date || 0);
        });
        setOrders(sorted);
        try {
          localStorage.setItem("admin_cached_orders", JSON.stringify(sorted));
        } catch (e) {}
      } else {
        toast.error("Failed to load orders");
      }
    } catch (err) {
      console.error(err);
      if (orders.length === 0) {
        toast.error("Error connecting to server");
      }
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    setUpdatingId(orderId);
    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId: orderId,
        status: newStatus,
      });
      if (response.data.success) {
        // Optimistic UI update
        setOrders((prev) => {
          const updated = prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o));
          try {
            localStorage.setItem("admin_cached_orders", JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
        toast.success(`Order status updated to "${newStatus}"`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating order status");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Recently";
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

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const activeOrdersCount = orders.filter(
    (o) => (o.status || "").toLowerCase() !== "delivered"
  ).length;
  const deliveredCount = orders.filter(
    (o) => (o.status || "").toLowerCase() === "delivered"
  ).length;

  const filteredOrders = orders.filter((order) => {
    const statusMatches =
      statusFilter === "All" ||
      (order.status || "").toLowerCase() === statusFilter.toLowerCase();

    const term = searchTerm.toLowerCase().trim();
    if (!term) return statusMatches;

    const name = order.address
      ? `${order.address.firstName || ""} ${order.address.lastName || ""}`.toLowerCase()
      : "";
    const phone = order.address?.phone || "";
    const id = order._id ? order._id.toLowerCase() : "";

    const searchMatches =
      name.includes(term) || phone.includes(term) || id.includes(term);

    return statusMatches && searchMatches;
  });

  return (
    <div className="admin-page-container">
      {/* Header & Refresh */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Orders Management</h1>
          <p className="page-subtitle">Track, manage, and update customer food delivery orders</p>
        </div>

        <button
          className={`admin-refresh-btn ${refreshing ? "spinning" : ""}`}
          onClick={() => fetchAllOrders(true)}
          title="Refresh orders"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
          </svg>
          <span>{refreshing ? "Refreshing..." : "Refresh Orders"}</span>
        </button>
      </div>

      {/* Metrics Summary Cards */}
      <div className="orders-metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box total">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Orders</span>
            <span className="metric-value">{orders.length}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box active">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Active Deliveries</span>
            <span className="metric-value active-val">{activeOrdersCount}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box completed">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Completed Orders</span>
            <span className="metric-value completed-val">{deliveredCount}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box revenue">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Revenue</span>
            <span className="metric-value revenue-val">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="orders-filter-bar">
        <div className="filter-tabs-group">
          {["All", "Food Processing", "Out For Delivery", "Delivered"].map((tab) => (
            <button
              key={tab}
              className={`order-tab-btn ${statusFilter === tab ? "active" : ""}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab === "Food Processing" ? "Kitchen Processing" : tab}
              <span className="tab-badge">
                {tab === "All"
                  ? orders.length
                  : orders.filter((o) => (o.status || "").toLowerCase() === tab.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>

        <div className="order-search-box">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search by customer, phone, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="admin-orders-list">
        {loading ? (
          <div className="orders-loading-skeleton">
            <div className="skeleton-order-card"></div>
            <div className="skeleton-order-card"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-empty-box">
            <div className="empty-order-emoji">📋</div>
            <h3>No Orders Found</h3>
            <p>No orders match the selected filter criteria.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isDelivered = (order.status || "").toLowerCase() === "delivered";
            const isOutForDelivery = (order.status || "").toLowerCase() === "out for delivery";
            const items = Array.isArray(order.items) ? order.items : [];

            return (
              <div
                key={order._id}
                className={`admin-order-card ${isDelivered ? "delivered" : "active-order"}`}
              >
                {/* Card Top Meta */}
                <div className="order-card-header">
                  <div className="order-header-left">
                    <span className="order-id-chip">
                      #{order._id ? order._id.slice(-6).toUpperCase() : ""}
                    </span>
                    <span className="order-date-text">{formatDate(order.date)}</span>
                  </div>

                  <div className="order-header-right">
                    <span className={`status-tag ${isDelivered ? "delivered" : isOutForDelivery ? "out-delivery" : "processing"}`}>
                      {order.status || "Food Processing"}
                    </span>
                  </div>
                </div>

                {/* Card Body Grid */}
                <div className="order-card-body">
                  {/* Left: Items Summary */}
                  <div className="order-body-col items-col">
                    <div className="col-heading-label">Items Ordered ({items.length})</div>
                    <div className="order-items-pills">
                      {items.map((it, idx) => (
                        <div key={idx} className="admin-food-pill">
                          <span className="food-qty-chip">{it.quantity || 1}x</span>
                          <span className="food-name-text">{it.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Middle: Customer Details */}
                  <div className="order-body-col customer-col">
                    <div className="col-heading-label">Customer & Delivery</div>
                    <div className="customer-info-block">
                      <div className="customer-detail-row name-row">
                        <span className="customer-icon-capsule user-capsule">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </span>
                        <span className="customer-full-name">
                          {order.address ? `${order.address.firstName || ""} ${order.address.lastName || ""}` : "Customer"}
                        </span>
                      </div>

                      {order.address?.phone && (
                        <div className="customer-detail-row phone-row">
                          <span className="customer-icon-capsule phone-capsule">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                          </span>
                          <span className="customer-phone">
                            {order.address.phone}
                          </span>
                        </div>
                      )}

                      {order.address && (
                        <div className="customer-detail-row address-row">
                          <span className="customer-icon-capsule pin-capsule">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                          </span>
                          <span className="customer-address-line">
                            {order.address.street}, {order.address.city}, {order.address.state} - {order.address.zipcode}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Payment & Status Control */}
                  <div className="order-body-col action-col">
                    <div className="order-price-box">
                      <span className="price-label">Order Total</span>
                      <span className="price-amount">${order.amount}.00</span>
                      <span className="payment-status-tag paid">✓ Paid via Stripe</span>
                    </div>

                    <div className="status-select-wrap">
                      <label className="select-label">Update Status:</label>
                      <select
                        className={`admin-status-dropdown ${isDelivered ? "delivered" : isOutForDelivery ? "out-delivery" : "processing"}`}
                        onChange={(event) => statusHandler(event, order._id)}
                        value={order.status || "Food Processing"}
                        disabled={updatingId === order._id}
                      >
                        <option value="Food Processing">🍳 Food Processing</option>
                        <option value="Out For Delivery">🛵 Out For Delivery</option>
                        <option value="Delivered">✓ Delivered</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Orders;
