import React, { useContext } from 'react'
import "./FoodDisplay.css"
import { StoreContext } from '../../Context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({category}) => {
  const {food_list, loadingFood} = useContext(StoreContext);

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

  return (
    <div className="food-display" id="food-display">
      <h2>Top Dishes Near You</h2>
      <div className="food-display-list">
        {food_list.length === 0 && loadingFood ? (
          renderSkeletons()
        ) : (
          food_list.map((ele,ind) => {
            if(category=="All" || category==ele.category) {
              return (
                <FoodItem key={ele._id || ind} id={ele._id} name={ele.name} description={ele.description} price={ele.price} image={ele.image}/>
              )
            }
          })
        )}
      </div>
    </div>
  )
}

export default FoodDisplay
