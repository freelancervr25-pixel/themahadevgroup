import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartTotalPrice,
  increaseQty,
  decreaseQty,
  removeFromCart,
  clearCart,
} from "../store/cartSlice";
import { generateOrderPDF } from "../utils/pdfHelpers";
import CheckoutHeader from "../components/CheckoutHeader";
import "../styles/checkout.css";

const Checkout = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectCartTotalPrice);

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    mobile: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = "Customer name is required";
    }

    if (!customerInfo.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(customerInfo.mobile)) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDownloadOrderPDF = async () => {
    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      await generateOrderPDF(cartItems, customerInfo, totalPrice);

      // Clear cart after successful PDF generation
      dispatch(clearCart());
      setCustomerInfo({ name: "", mobile: "" });
      alert("Order PDF downloaded successfully! Cart cleared.");
    } catch (error) {
      console.error("Error generating order PDF:", error);
      alert("Error generating order PDF. Please try again.");
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      dispatch(clearCart());
      setCustomerInfo({ name: "", mobile: "" });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <CheckoutHeader />
        <div className="empty-cart">
          <div className="empty-cart-content">
            <h2>🛒 Your cart is empty</h2>
            <p>Add some firecrackers to your cart to proceed with checkout.</p>
            <button
              className="back-to-shop-button"
              onClick={() => window.history.back()}
            >
              Back to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <CheckoutHeader />

      <div className="checkout-content">
        <div className="checkout-items">
          <div className="items-header">
            <h2>Your Items ({cartItems.length})</h2>
          </div>

          <div className="items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-item">
                <div className="item-image">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/80x80/d32f2f/ffffff?text=Firework";
                    }}
                  />
                </div>

                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-price">₹{item.price} each</p>
                </div>

                <div className="item-quantity">
                  <button
                    className="qty-button"
                    onClick={() => dispatch(decreaseQty(item.id))}
                  >
                    –
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-button"
                    onClick={() => dispatch(increaseQty(item.id))}
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>

                <button
                  className="remove-button"
                  onClick={() => dispatch(removeFromCart(item.id))}
                  title="Remove item"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="checkout-footer">
          <div className="customer-info">
            <div className="form-group">
              <label htmlFor="name">Customer Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={customerInfo.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className={errors.name ? "error" : ""}
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="mobile">Mobile Number *</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={customerInfo.mobile}
                onChange={handleInputChange}
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
                className={errors.mobile ? "error" : ""}
              />
              {errors.mobile && (
                <span className="error-message">{errors.mobile}</span>
              )}
            </div>
          </div>

          <div className="checkout-summary">
            <div className="total-section">
              <div className="total-label">Total:</div>
              <div className="total-amount">₹{totalPrice.toFixed(2)}</div>
            </div>

            <div className="checkout-actions">
              <button
                className="download-pdf-button"
                onClick={handleDownloadOrderPDF}
              >
                📥 Download PDF
              </button>
              <button className="clear-cart-button" onClick={handleClearCart}>
                🧹 Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
