import { createContext, useEffect, useState } from "react";
// import { food_list } from "../assets/assets";
import axios from "axios"

// Global Context
export const StoreContext = createContext(null);

// Global State
const StoreContextProvider = ({ children }) => {

  const [cartItems, setCartItems] = useState({});
  const url = "https://food-delivery-backend-vewv.onrender.com";
  const [token,setToken] = useState("");
  const [food_list,setFoodlist] = useState([]);

  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems({
        ...cartItems,
        [itemId]: 1,
      });
    } else {
      setCartItems({
        ...cartItems,
        [itemId]: cartItems[itemId] + 1,
      });
    }
    if (token) {
      await axios.post(url+"/api/cart/add",{itemId},{headers:{token}})
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems({
      ...cartItems,
      [itemId]: cartItems[itemId] - 1,
    });
    if (token) {
      await axios.post(url+"/api/cart/remove",{itemId},{headers:{token}})
    }
  };

  const getTotalCartAmount = () => {
    let toatlAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => {
          return product._id === item;
        });
        toatlAmount += itemInfo.price * cartItems[item];
      }
    }
    return toatlAmount;
  }

  const fetchFoodList = async () => {
    const response = await axios.get(url+"/api/food/list");
    setFoodlist(response.data.data);
  }

  const loadCartData = async (token) => {
      const response = await axios.post(url+"/api/cart/get",{},{headers:{token}});
      setCartItems(response.data.cartData);
  }

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
        await loadCartData(localStorage.getItem("token"));
      }
    }
    loadData();
  },[]);

  // Improving Cart Functionality On Login & LogOut Of User

  // When The User Logged In, We Should Display The Cart Items That Are Already Added By The User To The Cart
  // ISSUE : But When The User Logged In, 
  // We Are Displaying The Cart Items That Are Already Added By The User To The Cart -->> Only When The Page Loads( Refreshing The Page (Manually) ).
  // IMPROVEMENT : Fetching The CartItems Of The Logged In User From The DataBase 
  // Displaying The Cart Items Of The Logged In User In The Cart Immediately When The User Logged In.
  // Instead Of Displaying The Cart Items Of The Logged In User In The Cart After The Page Loads( Refreshing The Page (Manually) ).
  

  // When The User Logged Out , We Will Be Considered As A New User & ReDirect To The Sign Up Page.
  // Since The User Logged Out -->>
  // The Cart Items Added By The User Should Be Removed From The Cart, As We Are Considered As a New User
  // (The CartItems Data Is Stored In The Data Base When The User Again Logged In, The Cart Items Of The User Will Be Displayed)
  // ISSUE : The Cart Items Are Not Removed From The Cart When The User Logged Out.
  // IMPROVEMENT :  When The User Logged Out , We Will Display The Empty Cart -->> Since The User Is Considered As A New User.


  useEffect(() => {
    if (token) {
      async function LoadCart_Login(){
        await loadCartData(localStorage.getItem("token"));
      }
      LoadCart_Login();
    }
    else {
      setCartItems({});
    }
  },[token]);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
