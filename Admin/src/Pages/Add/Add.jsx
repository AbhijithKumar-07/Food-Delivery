import React, { useState } from "react";
import "./Add.css";
import { assets } from "../../assets/assets.js";
import axios from 'axios';
import { toast } from "react-toastify";

const Add = ({ url }) => {
  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!image) {
      toast.error("Please upload an image for the dish");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", Number(data.price));
      formData.append("category", data.category);
      formData.append("image", image);

      const response = await axios.post(`${url}/api/food/add`, formData);
      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "Salad",
        });
        setImage(false);
        toast.success(response.data.message || "Food item added successfully! 🎉");
      } else {
        toast.error(response.data.message || "Failed to add food item");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while adding food");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Add Food Item</h1>
          <p className="page-subtitle">Create and publish a new delicious dish to the menu</p>
        </div>
      </div>

      <div className="admin-form-card">
        <form onSubmit={onSubmitHandler} className="add-food-form">
          {/* Image Upload Dropzone */}
          <div className="form-group">
            <label className="form-label">
              Dish Image <span className="req-star">*</span>
            </label>
            <div className="image-upload-dropzone">
              <label htmlFor="image" className="dropzone-label">
                {image ? (
                  <div className="preview-wrap">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      className="uploaded-preview-img"
                    />
                    <button
                      type="button"
                      className="change-img-overlay"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImage(false);
                      }}
                    >
                      Remove / Change
                    </button>
                  </div>
                ) : (
                  <div className="empty-dropzone-content">
                    <div className="upload-icon-circle">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </div>
                    <span className="dropzone-prompt">Click to browse or drop dish photo</span>
                    <span className="dropzone-hint">PNG, JPG, or WEBP up to 5MB</span>
                  </div>
                )}
              </label>
              <input
                onChange={(e) => setImage(e.target.files[0])}
                type="file"
                id="image"
                accept="image/*"
                hidden
              />
            </div>
          </div>

          {/* Product Name */}
          <div className="form-group">
            <label className="form-label">
              Dish Name <span className="req-star">*</span>
            </label>
            <input
              className="admin-text-input"
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              name="name"
              placeholder="e.g. Greek Salad Deluxe"
              required
            />
          </div>

          {/* Product Description */}
          <div className="form-group">
            <label className="form-label">
              Dish Description <span className="req-star">*</span>
            </label>
            <textarea
              className="admin-textarea"
              onChange={onChangeHandler}
              value={data.description}
              name="description"
              rows="4"
              placeholder="Describe the ingredients, flavors, and culinary highlights..."
              required
            ></textarea>
          </div>

          {/* Category & Price Row */}
          <div className="form-grid-row">
            <div className="form-group flex-1">
              <label className="form-label">Category</label>
              <select
                className="admin-select"
                onChange={onChangeHandler}
                value={data.category}
                name="category"
              >
                <option value="Salad">Salad</option>
                <option value="Rolls">Rolls</option>
                <option value="Deserts">Deserts</option>
                <option value="Sandwich">Sandwich</option>
                <option value="Cake">Cake</option>
                <option value="Pure Veg">Pure Veg</option>
                <option value="Pasta">Pasta</option>
                <option value="Noodles">Noodles</option>
              </select>
            </div>

            <div className="form-group flex-1">
              <label className="form-label">
                Price (USD $) <span className="req-star">*</span>
              </label>
              <div className="price-input-wrap">
                <span className="currency-symbol">$</span>
                <input
                  className="admin-text-input price-input"
                  onChange={onChangeHandler}
                  value={data.price}
                  type="number"
                  name="price"
                  placeholder="14"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions-row">
            <button
              type="submit"
              className={`admin-submit-btn ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Publishing Dish..." : "Publish to Menu 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;
