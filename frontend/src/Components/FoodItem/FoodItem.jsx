import React, { useContext, useState } from 'react'
import "./FoodItem.css"
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'

const FoodItem = ({id,name,price,description,image}) => {
    const {cartItems,addToCart,removeFromCart,url} = useContext(StoreContext);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Fetch images directly from Database URL
    const getImageSrc = () => {
      if (!image) return assets.logo;
      if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:'))) {
        return image;
      }
      return `${url}/images/${image}`;
    };

    const handleImageError = () => {
      setHasError(true);
      setImageLoaded(true);
    };

  return (
    <div className='food-item'>
      <div className="food-item-img-container">
        {!imageLoaded && <div className="skeleton-image-loader"></div>}
        <img
          src={hasError ? assets.logo : getImageSrc()}
          alt={name || "Food Item"}
          className={`food-item-img ${imageLoaded ? 'loaded' : 'loading'}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
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
