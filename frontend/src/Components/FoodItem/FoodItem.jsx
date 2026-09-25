import React, { useContext } from 'react'
import "./FoodItem.css"
import { assets, food_list as default_food_list } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'

const FoodItem = ({id,name,price,description,image}) => {
    const {cartItems,addToCart,removeFromCart,url} = useContext(StoreContext);

    const getImageSrc = () => {
      if (!image) return assets.logo;
      if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:') || image.startsWith('/assets') || image.startsWith('/src') || image.startsWith('/'))) {
        return image;
      }
      return `${url}/images/${image}`;
    };

    const handleImageError = (e) => {
      const match = default_food_list.find(
        (f) => f.name && name && f.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
      if (match && match.image && e.target.src !== match.image) {
        e.target.src = match.image;
      }
    };

  return (
    <div className='food-item'>
      <div className="food-item-img-container">
        <img
          src={getImageSrc()}
          alt={name || "Dish"}
          className='food-item-img'
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
        {
            !cartItems[id] ? <img className='add' onClick={ () => addToCart(id) } src= {assets.add_icon_white} alt="Add" /> 
            : <div className="food-item-counter">
                <img onClick={ () => removeFromCart(id) } src={assets.remove_icon_red} alt="Remove" />
                <p> { cartItems[id] } </p>
                <img onClick={ () => addToCart(id) } src={assets.add_icon_green} alt="Add" />
            </div>
            
        }
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
            <p> {name} </p>
            <img src={assets.rating_starts} alt="" />
        </div>
        <p className="food-item-desc">
            {description}
        </p>
        <p className="food-item-price">
            ${price}
        </p>
      </div>
    </div>
  )
}

export default FoodItem
