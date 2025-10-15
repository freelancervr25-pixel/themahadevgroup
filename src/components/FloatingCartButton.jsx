import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCartTotalItems, selectCartTotalPrice } from "../store/cartSlice";
import "../styles/home.css";

const FloatingCartButton = () => {
  const navigate = useNavigate();
  const totalItems = useSelector(selectCartTotalItems);
  const totalPrice = useSelector(selectCartTotalPrice);

  const handleCartClick = () => {
    navigate("/checkout");
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="floating-cart-button" onClick={handleCartClick}>
      <div className="cart-icon">🛒</div>
      <div className="cart-info">
        <div className="cart-items">{totalItems} items</div>
        <div className="cart-total">₹{totalPrice.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default FloatingCartButton;
