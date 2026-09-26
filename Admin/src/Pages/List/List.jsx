import React, { useEffect, useState } from 'react';
import "./List.css";
import axios from 'axios';
import { toast } from "react-toastify";

const List = ({ url }) => {
  const [list, setList] = useState(() => {
    try {
      const cached = localStorage.getItem("admin_cached_food_list");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not parse cached admin food list:", e);
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem("admin_cached_food_list");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return false;
      }
    } catch (e) {}
    return true;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deletingId, setDeletingId] = useState(null);

  const fetchList = async (showLoadingSpinner = false) => {
    try {
      if (showLoadingSpinner || list.length === 0) setLoading(true);
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data && response.data.success) {
        const data = response.data.data || [];
        setList(data);
        try {
          localStorage.setItem("admin_cached_food_list", JSON.stringify(data));
        } catch (e) {}
      } else {
        toast.error("Failed to load food list");
      }
    } catch (err) {
      console.error(err);
      if (list.length === 0) {
        toast.error("Network error loading food list");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFood = async (foodId, foodName) => {
    if (!window.confirm(`Are you sure you want to remove "${foodName}" from the menu?`)) {
      return;
    }
    setDeletingId(foodId);
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      if (response.data.success) {
        toast.success(`Removed "${foodName}" successfully`);
        // Optimistically update list
        setList((prev) => {
          const updated = prev.filter((item) => item._id !== foodId);
          try {
            localStorage.setItem("admin_cached_food_list", JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else {
        toast.error(response.data.message || "Error removing food");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error removing item");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const categories = ["All", ...Array.from(new Set(list.map((item) => item.category).filter(Boolean)))];

  const filteredList = list.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !searchTerm.trim() ||
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className='admin-page-container'>
      {/* Header & Stats */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Menu Items Management</h1>
          <p className="page-subtitle">View, search, and manage all food items listed on your platform</p>
        </div>

        <div className="list-stats-badges">
          <span className="stat-pill">
            <strong>{list.length}</strong> Total Dishes
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="list-controls-card">
        <div className="search-input-wrap">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search dishes by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="table-search-input"
          />
          {searchTerm && (
            <button className="clear-search-mini" onClick={() => setSearchTerm("")}>✕</button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="category-filter-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-chip-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items Table */}
      <div className="list-table-card">
        {loading ? (
          <div className="table-loading-skeleton">
            <div className="skeleton-table-row"></div>
            <div className="skeleton-table-row"></div>
            <div className="skeleton-table-row"></div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="table-empty-state">
            <div className="empty-table-icon">🍲</div>
            <h3>No Food Items Found</h3>
            <p>{searchTerm || selectedCategory !== "All" ? "No items match your filter criteria." : "Your menu is empty. Add some delicious dishes!"}</p>
          </div>
        ) : (
          <div className="admin-custom-table">
            <div className="table-row-header">
              <span className="col-thumb">Image</span>
              <span className="col-name">Dish Name</span>
              <span className="col-cat">Category</span>
              <span className="col-price">Price</span>
              <span className="col-action">Action</span>
            </div>

            <div className="table-body">
              {filteredList.map((item) => (
                <div key={item._id} className="table-row-item">
                  <div className="col-thumb">
                    <img
                      src={`${url}/images/${item.image}`}
                      alt={item.name}
                      className="food-thumb-img"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/100x100?text=Food";
                      }}
                    />
                  </div>

                  <div className="col-name">
                    <span className="food-row-name">{item.name}</span>
                    <span className="food-row-desc">{item.description}</span>
                  </div>

                  <div className="col-cat">
                    <span className="category-badge">{item.category || "General"}</span>
                  </div>

                  <div className="col-price">
                    <span className="price-tag">${item.price}</span>
                  </div>

                  <div className="col-action">
                    <button
                      className="delete-item-btn"
                      onClick={() => removeFood(item._id, item.name)}
                      disabled={deletingId === item._id}
                      title="Remove Dish"
                    >
                      {deletingId === item._id ? (
                        "..."
                      ) : (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default List;
