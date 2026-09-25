import { createContext, useEffect, useState } from "react";
import { food_list as default_food_list } from "../assets/assets";
import axios from "axios";

// Global Context
export const StoreContext = createContext(null);

// Global State
const StoreContextProvider = ({ children }) => {

  const [cartItems, setCartItems] = useState({});
  const url = "https://food-delivery-backend-vewv.onrender.com";
  const [token, setToken] = useState("");

  // Instant Hydration: load from localStorage cache or fallback default list immediately (0ms wait)
  const [food_list, setFoodlist] = useState(() => {
    try {
      const cached = localStorage.getItem("cached_food_list");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load cached food list:", e);
    }
    return default_food_list;
  });

  const [loadingFood, setLoadingFood] = useState(false);

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
    if (token) {
      try {
        await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
      } catch (err) {
        console.error("Error adding to cart:", err);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const current = prev[itemId] || 0;
      if (current <= 1) {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }
      return { ...prev, [itemId]: current - 1 };
    });
    if (token) {
      try {
        await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
      } catch (err) {
        console.error("Error removing from cart:", err);
      }
    }
  };

  const getTotalCartAmount = () => {
    let toatlAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => {
          return product._id === item;
        });
        if (itemInfo) {
          toatlAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return toatlAmount;
  }

  const fetchFoodList = async () => {
    try {
      setLoadingFood(true);
      const response = await axios.get(url + "/api/food/list", { timeout: 20000 });
      if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
        setFoodlist(response.data.data);
        try {
          localStorage.setItem("cached_food_list", JSON.stringify(response.data.data));
        } catch (e) {
          console.warn("Could not save food list to cache:", e);
        }
      }
    } catch (err) {
      console.warn("Backend warming up or network issue. Using cached/default food list:", err.message);
    } finally {
      setLoadingFood(false);
    }
  }

  const loadCartData = async (token) => {
    try {
      const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
      if (response.data && response.data.cartData) {
        setCartItems(response.data.cartData);
      }
    } catch (err) {
      console.error("Error loading cart data:", err);
    }
  }

  useEffect(() => {
    // 1. Fetch fresh list from MongoDB in the background (non-blocking)
    fetchFoodList();

    // 2. Ping backend to wake Render free tier up immediately
    axios.get(url + "/").catch(() => {});

    // 3. Load user token and cart data
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      loadCartData(storedToken);
    }
  }, []);

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
    loadingFood,
    fetchFoodList,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
