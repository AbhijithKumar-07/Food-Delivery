import React, { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../Context/StoreContext";
import { assets } from "../../assets/assets";
import { useNavigate } from 'react-router-dom';

const CartItemImage = ({ image, name, url }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const getImageSrc = () => {
    if (!image) return assets.logo;
    if (typeof image === "string" && (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:"))) {
      return image;
    }
    return `${url}/images/${image}`;
  };

  return (
    <div className="cart-item-img-container">
      {!loaded && <div className="cart-item-skeleton"></div>}
      <img
        src={error ? assets.logo : getImageSrc()}
        alt={name || "Item"}
        className={`cart-item-img ${loaded ? 'loaded' : 'loading'}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
      />
    </div>
  );
};

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext);

  const navigate = useNavigate();

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={item._id || index}>
                <div className="cart-items-title cart-items-item">
                  <CartItemImage image={item.image} name={item.name} url={url} />
                  <p> {item.name} </p>
                  <p> ${item.price} </p>
                  <p> {cartItems[item._id]} </p>
                  <p> ${item.price * cartItems[item._id]} </p>
                  <p onClick={() => removeFromCart(item._id)} className="cross" >x</p>
                </div>
                <hr />
              </div>
            );
          }
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p> ${getTotalCartAmount()} </p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>
                {
                  getTotalCartAmount() == 0 ? "$0" : "$2"
                }
              </p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>
                {
                  getTotalCartAmount() == 0 ? "$0" : `$${getTotalCartAmount()+2}`
                }
              </b>
            </div>
          </div>
          <button onClick={() => navigate("/order")} > PROCEED TO CHECKOUT </button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="Promo Code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
