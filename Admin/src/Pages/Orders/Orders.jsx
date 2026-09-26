import React, { useState, useEffect } from "react";
import "./Orders.css";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets.js";

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAllOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      if (!isManual) setLoading(true);
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data && response.data.success) {
        // Sort newest orders first
        const sorted = (response.data.data || []).sort((a, b) => {
          return new Date(b.date || 0) - new Date(a.date || 0);
        });
        setOrders(sorted);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server");
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
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
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
          <div className="metric-icon-box total">📦</div>
          <div className="metric-info">
            <span className="metric-label">Total Orders</span>
            <span className="metric-value">{orders.length}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box active">🛵</div>
          <div className="metric-info">
            <span className="metric-label">Active Deliveries</span>
            <span className="metric-value active-val">{activeOrdersCount}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box completed">✓</div>
          <div className="metric-info">
            <span className="metric-label">Completed Orders</span>
            <span className="metric-value completed-val">{deliveredCount}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box revenue">💰</div>
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
                      <span className="customer-full-name">
                        👤 {order.address ? `${order.address.firstName || ""} ${order.address.lastName || ""}` : "Customer"}
                      </span>
                      {order.address?.phone && (
                        <span className="customer-phone">
                          📞 {order.address.phone}
                        </span>
                      )}
                      {order.address && (
                        <span className="customer-address-line">
                          📍 {order.address.street}, {order.address.city}, {order.address.state} - {order.address.zipcode}
                        </span>
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
