import React, { useContext } from 'react'
import "./FoodDisplay.css"
import { StoreContext } from '../../Context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({category}) => {
  const {food_list, loadingFood, searchTerm} = useContext(StoreContext);

  const renderSkeletons = () => {
    return Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="food-item-skeleton">
        <div className="skeleton-img-box"></div>
        <div className="skeleton-info-box">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-desc"></div>
          <div className="skeleton-line skeleton-desc-short"></div>
          <div className="skeleton-line skeleton-price"></div>
        </div>
      </div>
    ));
  };

  const filteredList = food_list.filter((ele) => {
    const matchesCategory = category === "All" || category === ele.category;
    if (!searchTerm || !searchTerm.trim()) return matchesCategory;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      (ele.name && ele.name.toLowerCase().includes(term)) ||
      (ele.category && ele.category.toLowerCase().includes(term)) ||
      (ele.description && ele.description.toLowerCase().includes(term));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="food-display" id="food-display">
      <h2>{searchTerm.trim() ? `Search Results for "${searchTerm}"` : "Top Dishes Near You"}</h2>
      {filteredList.length === 0 && !loadingFood && food_list.length > 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
          <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "6px" }}>No dishes found matching "{searchTerm}"</p>
          <p style={{ fontSize: "14px" }}>Try searching with another dish name or explore all categories.</p>
        </div>
      ) : (
        <div className="food-display-list">
          {food_list.length === 0 && loadingFood ? (
            renderSkeletons()
          ) : (
            filteredList.map((ele, ind) => (
              <FoodItem
                key={ele._id || ind}
                id={ele._id}
                name={ele.name}
                description={ele.description}
                price={ele.price}
                image={ele.image}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FoodDisplay
