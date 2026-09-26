import React from 'react';
import Navbar from './Components/Navbar/Navbar';
import Sidebar from './Components/Sidebar/Sidebar';
import { Route, Routes, Navigate } from 'react-router-dom';
import Add from './Pages/Add/Add.jsx';
import List from './Pages/List/List.jsx';
import Orders from './Pages/Orders/Orders.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const url = "https://food-delivery-backend-vewv.onrender.com";

  return (
    <div className="admin-app-root">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main className="main-content-panel">
          <Routes>
            <Route path="/" element={<Navigate to="/orders" replace />} />
            <Route path="/add" element={<Add url={url} />} />
            <Route path="/list" element={<List url={url} />} />
            <Route path="/orders" element={<Orders url={url} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
