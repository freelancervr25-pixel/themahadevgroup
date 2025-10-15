import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/checkout.css";

const CheckoutHeader = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="checkout-header">
      <button className="back-button" onClick={handleBackToHome}>
        ← Back to Home
      </button>
      <h1 className="checkout-title">Checkout 🧾</h1>
    </div>
  );
};

export default CheckoutHeader;
