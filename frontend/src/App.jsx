import React, { Fragment, useContext } from "react";
import Navbar from "./Components/Navbar/Navbar.jsx";
import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home/Home.jsx";
import Cart from "./Pages/Cart/Cart.jsx";
import PlaceOrder from "./Pages/PlaceOrder/PlaceOrder.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import LoginPopUp from "./Components/LoginPopUp/LoginPopUp.jsx";
import Verify from "./Pages/Verify/Verify.jsx";
import MyOrders from "./Pages/MyOrders/MyOrders.jsx";
import { StoreContext } from "./Context/StoreContext.jsx";

const App = () => {
  const { showLogin, setShowLogin } = useContext(StoreContext);

  return (
    <Fragment>
      {
        showLogin ? <LoginPopUp setShowLogin={setShowLogin} /> : <></>
      }
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/myorders" element={<MyOrders />} />
        </Routes>
      </div>
      <Footer />
    </Fragment>
  );
};

export default App;
