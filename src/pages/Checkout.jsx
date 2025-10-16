import React, { useState, useRef, useEffect, useMemo } from "react";
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
import apiService from "../services/api";
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
  const [promoCode, setPromoCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [discountInfo, setDiscountInfo] = useState(null);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const clearTimerRef = useRef(null);
  const summaryRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

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
      setCouponError("");
      setOrderMessage("");
      setDiscountInfo(null);
      // Create order via backend and use its summary for PDF
      const summary = await apiService.createOrder({
        userName: customerInfo.name,
        userMobile: customerInfo.mobile,
        couponCode: promoCode,
        cartItems,
      });

      // If summary includes net_total and possibly adjusted items, use it
      const itemsForPdf = Array.isArray(summary.cart_items)
        ? summary.cart_items.map((i) => ({
            id: i.id,
            name: i.name,
            price: Number(i.price),
            quantity: Number(i.qty || i.quantity || 1),
            image:
              cartItems.find((c) => String(c.id) === String(i.id))?.image || "",
          }))
        : cartItems;

      const totalForPdf = Number(
        summary.net_total ?? summary.order_total ?? totalPrice
      );

      if (summary.coupon_applied) {
        setDiscountInfo({
          percent: Number(summary.discount_percent || 0),
          amount: Number(summary.discount_amount || 0),
          netTotal: Number(summary.net_total || totalForPdf),
        });
      } else {
        setDiscountInfo(null);
      }

      setOrderMessage(
        summary.coupon_applied
          ? "Coupon applied. PDF will download now — please share it with us to confirm your order."
          : "PDF will download now — please share it with us to confirm your order."
      );

      await generateOrderPDF(itemsForPdf, customerInfo, totalForPdf, {
        couponApplied: !!summary.coupon_applied,
        couponCode: summary.coupon_code,
        orderTotal: Number(summary.order_total ?? totalForPdf),
        discountPercent: Number(summary.discount_percent ?? 0),
        discountAmount: Number(summary.discount_amount ?? 0),
        netTotal: Number(summary.net_total ?? totalForPdf),
      });

      // Keep cart for 30s to show discounted totals; then clear
      setOrderPlaced(true);
      setSecondsLeft(30);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(countdownRef.current);
          }
          return Math.max(0, s - 1);
        });
      }, 1000);
      clearTimerRef.current = setTimeout(() => {
        dispatch(clearCart());
        setCustomerInfo({ name: "", mobile: "" });
        setPromoCode("");
        setOrderPlaced(false);
        setSecondsLeft(0);
      }, 30000);

      // Scroll summary note into view
      try {
        summaryRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } catch {}
      // Alert with discount info after successful order
      if (summary.coupon_applied) {
        alert(
          `Order placed! Discount ${Number(
            summary.discount_percent || 0
          )}% (Rs ${Number(summary.discount_amount || 0).toFixed(
            2
          )}). Net: Rs ${Number(summary.net_total || totalForPdf).toFixed(2)}`
        );
      } else {
        alert("Order placed! PDF downloaded.");
      }

      // Prepare WhatsApp share link and summary message
      try {
        const lines = [];
        lines.push(`Order for: ${customerInfo.name} (${customerInfo.mobile})`);
        if (summary.coupon_applied) {
          lines.push(`Coupon: ${summary.coupon_code}`);
          lines.push(
            `Order Total: Rs ${Number(
              summary.order_total || totalForPdf
            ).toFixed(2)}`
          );
          lines.push(
            `Discount: ${Number(summary.discount_percent || 0)}% (Rs ${Number(
              summary.discount_amount || 0
            ).toFixed(2)})`
          );
          lines.push(
            `Net Total: Rs ${Number(summary.net_total || totalForPdf).toFixed(
              2
            )}`
          );
        } else {
          lines.push(`Total: Rs ${Number(totalForPdf).toFixed(2)}`);
        }
        lines.push("");
        lines.push("Items:");
        (summary.cart_items || itemsForPdf).forEach((i) => {
          const qty = Number(i.qty || i.quantity || 1);
          lines.push(`- ${i.name} x ${qty} @ Rs ${Number(i.price).toFixed(2)}`);
        });
        lines.push("");
        lines.push(
          "Please find the downloaded PDF invoice attached to confirm the order."
        );

        const msg = encodeURIComponent(lines.join("\n"));
        setShareUrl(`https://wa.me/919274427122?text=${msg}`);
      } catch {}
    } catch (error) {
      console.error("Error generating order PDF:", error);
      setCouponError(error?.message || "Failed to create order");
      setPromoCode("");
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      dispatch(clearCart());
      setCustomerInfo({ name: "", mobile: "" });
    }
  };

  // Client-side coupon preview for known 15% codes
  const previewCoupon = useMemo(() => {
    const known = ["vishnu331", "firstsale15", "aditya311"]; // case-insensitive
    const code = (promoCode || "").trim().toLowerCase();
    if (!orderPlaced && code && known.includes(code)) {
      const percent = 15;
      const amount = (totalPrice * percent) / 100;
      const net = Math.max(0, totalPrice - amount);
      return { percent, amount, net };
    }
    return null;
  }, [promoCode, totalPrice, orderPlaced]);

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

                {orderPlaced ? (
                  <div className="item-quantity">
                    <span className="qty-value">{item.quantity}</span>
                  </div>
                ) : (
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
                )}

                <div className="item-total">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>

                {!orderPlaced && (
                  <button
                    className="remove-button"
                    onClick={() => dispatch(removeFromCart(item.id))}
                    title="Remove item"
                  >
                    ❌
                  </button>
                )}
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
            <div className="promo-section">
              <div className="form-group">
                <label htmlFor="promo">Promo Code</label>
                <input
                  type="text"
                  id="promo"
                  name="promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                />
                {couponError && (
                  <span className="error-message" style={{ marginTop: 6 }}>
                    {couponError}
                  </span>
                )}
              </div>
            </div>
            <div className="total-section">
              <div className="total-label">Total:</div>
              <div className="total-amount">₹{totalPrice.toFixed(2)}</div>
            </div>

            {/* Preview discount before ordering if coupon matches known list */}
            {!orderPlaced && previewCoupon && (
              <>
                <div className="total-section" style={{ marginTop: 8 }}>
                  <div className="total-label">Discount (preview):</div>
                  <div className="total-amount">
                    {previewCoupon.percent}% (₹{previewCoupon.amount.toFixed(2)}
                    )
                  </div>
                </div>
                <div className="total-section" style={{ marginTop: 4 }}>
                  <div className="total-label">Net Total (preview):</div>
                  <div className="total-amount">
                    ₹{previewCoupon.net.toFixed(2)}
                  </div>
                </div>
              </>
            )}
            {discountInfo && (
              <>
                <div className="total-section" style={{ marginTop: 8 }}>
                  <div className="total-label">Discount:</div>
                  <div className="total-amount">
                    {discountInfo.percent}% (₹{discountInfo.amount.toFixed(2)})
                  </div>
                </div>
                <div className="total-section" style={{ marginTop: 4 }}>
                  <div className="total-label">Net Total:</div>
                  <div className="total-amount">
                    ₹{discountInfo.netTotal.toFixed(2)}
                  </div>
                </div>
              </>
            )}
            {orderMessage && (
              <div
                className="info-message"
                style={{ marginTop: 10, color: "#2e7d32" }}
                ref={summaryRef}
              >
                {orderMessage}
                {orderPlaced && (
                  <>
                    <br />
                    Please share the downloaded PDF on WhatsApp to confirm your
                    order: <strong>+91 92744 27122</strong>
                    {shareUrl && (
                      <>
                        <br />
                        <a
                          href={shareUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="download-pdf-button"
                          style={{ display: "inline-block", marginTop: 8 }}
                        >
                          Share Order on WhatsApp
                        </a>
                      </>
                    )}
                    <br />
                    Clearing cart in {secondsLeft}s...
                  </>
                )}
              </div>
            )}

            <div className="checkout-actions">
              <button
                className="download-pdf-button"
                onClick={handleDownloadOrderPDF}
              >
                🧾 Order and Download PDF
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
