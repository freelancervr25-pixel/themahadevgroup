import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, increaseQty, decreaseQty } from "../store/cartSlice";
import ProductImage from "./ProductImage";
import "../styles/home.css";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const cartItem = cartItems.find((i) => i.id === product.id);

  const handleAddToCart = () => {
    dispatch(addToCart(product));
  };

  const discountPercentage = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="product-card">
      <div className="product-image-container">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/300x300/d32f2f/ffffff?text=Firework";
          }}
        />
        {discountPercentage > 0 && (
          <div className="discount-badge">{discountPercentage}% OFF</div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-pricing">
          <span className="current-price">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="original-price">₹{product.originalPrice}</span>
          )}
        </div>

        {/* 15% promo preview for all items */}
        {(() => {
          const basePrice = Number(product.price || 0);
          const percent = 15;
          const amount = (basePrice * percent) / 100;
          const net = Math.max(0, basePrice - amount);
          return (
            <div className="promo-preview">
              <div className="promo-save">
                Save {percent}%: ₹{amount.toFixed(2)}
              </div>
              <div className="promo-net">You pay: ₹{net.toFixed(2)}</div>
            </div>
          );
        })()}

        <div className="product-stock">Stock: {product.stock} units</div>

        {cartItem ? (
          <>
            <div className="qty-controls">
              <button
                className="qty-button"
                onClick={() => dispatch(decreaseQty(product.id))}
                disabled={cartItem.quantity <= 1}
              >
                –
              </button>
              <span className="qty-value">{cartItem.quantity}</span>
              <button
                className="qty-button"
                onClick={() => dispatch(increaseQty(product.id))}
                disabled={cartItem.quantity >= product.stock}
              >
                +
              </button>
            </div>
            {product.stock > 0 && product.stock < 5 && (
              <div className="low-stock-note">Low in stock — order fast!</div>
            )}
          </>
        ) : (
          <>
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            {product.stock === 0 && (
              <div className="restock-note">
                We’ll restock this item soon. Please check back!
              </div>
            )}
            {product.stock > 0 && product.stock < 5 && (
              <div className="low-stock-note">Low in stock — order fast!</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
