import { createContext, useEffect, useState } from "react";
import { food_list as default_food_list } from "../assets/assets";
import axios from "axios";

// Global Context
export const StoreContext = createContext(null);

// Global State
const StoreContextProvider = ({ children }) => {

  // Persist cart items in localStorage so guest cart is never lost on refresh
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cartItems");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load cart from localStorage:", e);
    }
    return {};
  });
  const url = "https://food-delivery-backend-vewv.onrender.com";
  const [token, setToken] = useState("");

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } catch (e) {
      console.warn("Could not save cart to localStorage:", e);
    }
  }, [cartItems]);

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

  const loadCartData = async (userToken) => {
    try {
      const response = await axios.post(url + "/api/cart/get", {}, { headers: { token: userToken } });
      if (response.data && response.data.cartData && typeof response.data.cartData === 'object') {
        // If server has cart items, sync them
        if (Object.keys(response.data.cartData).length > 0) {
          setCartItems(response.data.cartData);
        }
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

  useEffect(() => {
    if (token) {
      loadCartData(token);
    }
  }, [token]);

  const clearCart = () => {
    setCartItems({});
    try {
      localStorage.removeItem("cartItems");
    } catch (e) {
      console.warn("Could not remove cart from localStorage:", e);
    }
  };

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    clearCart,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    loadingFood,
    fetchFoodList,
    showLogin,
    setShowLogin,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
