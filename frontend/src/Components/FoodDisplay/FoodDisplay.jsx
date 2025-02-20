import React, { useContext } from 'react'
import "./FoodDisplay.css"
import { StoreContext } from '../../Context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({category}) => {

  const {food_list} = useContext(StoreContext);

  return (
    <div className="food-display" id="food-display">
      <h2>Top Dishes Near You</h2>
      <div className="food-display-list">
        {
          food_list.map((ele,ind) => {
            if(category=="All" || category==ele.category) {
              return (
                <FoodItem key={ind} id={ele._id} name={ele.name} description={ele.description} price={ele.price} image={ele.image}/>
              )
            }
          })
        }
      </div>
    </div>
  )
}

export default FoodDisplay
