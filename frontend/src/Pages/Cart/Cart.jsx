import React, { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../Context/StoreContext";
import { food_list as default_food_list } from "../../assets/assets";
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext);

  const navigate = useNavigate();

  const getImageSrc = (image) => {
    if (!image) return "";
    if (typeof image === "string" && (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:") || image.startsWith("/assets") || image.startsWith("/src") || image.startsWith("/"))) {
      return image;
    }
    return `${url}/images/${image}`;
  };

  const handleImageError = (e, name) => {
    const match = default_food_list.find(
      (f) => f.name && name && f.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
    if (match && match.image && e.target.src !== match.image) {
      e.target.src = match.image;
    }
  };

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
                  <img
                    src={getImageSrc(item.image)}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => handleImageError(e, item.name)}
                  />
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
