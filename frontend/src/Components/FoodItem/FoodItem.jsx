import React, { useContext, useState } from 'react'
import "./FoodItem.css"
import { assets, food_images } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'

const FoodItem = ({id,name,price,description,image}) => {
    const {cartItems,addToCart,removeFromCart,url} = useContext(StoreContext);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Resolve image instantly: check bundled assets first, then direct URL, then backend upload
    const getImageSrc = () => {
      if (!image) return assets.logo;
      // If already a full URL or base64 data
      if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:'))) {
        return image;
      }
      // Check if image filename contains food_X (e.g. "1740055358609food_14.png" or "food_14.png")
      if (typeof image === 'string') {
        const match = image.match(/(food_\d+)/);
        if (match && food_images[match[1]]) {
          return food_images[match[1]];
        }
      }
      return `${url}/images/${image}`;
    };

    const handleImageError = (e) => {
      // If backend image fails or isn't loaded yet, try matching bundled image by name/filename
      if (typeof image === 'string') {
        const match = image.match(/(food_\d+)/);
        if (match && food_images[match[1]] && e.target.src !== food_images[match[1]]) {
          e.target.src = food_images[match[1]];
          return;
        }
      }
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
