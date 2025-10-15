import React from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice";
import "../styles/home.css";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart(product));
  };

  const discountPercentage = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
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

        <div className="product-stock">Stock: {product.stock} units</div>

        <button
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
