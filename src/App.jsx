import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store";
import { setInitialAuthState } from "./store/authSlice";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";
import "./styles/global.css";

// Component to initialize auth state
const AppInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setInitialAuthState());
  }, [dispatch]);

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppInitializer />
      </Router>
    </Provider>
  );
}

export default App;
