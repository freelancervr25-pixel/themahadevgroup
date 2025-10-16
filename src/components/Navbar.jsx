import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCartTotalItems } from "../store/cartSlice";
import "../styles/navbar.css";

const Navbar = () => {
  const location = useLocation();
  const cartItemsCount = useSelector(selectCartTotalItems);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🎆</span>
          Fire Cracker catalogue
        </Link>

        <div className="navbar-links">
          {isLoggedIn && (
            <>
              <Link
                to="/"
                className={`navbar-link ${
                  location.pathname === "/" ? "active" : ""
                }`}
              >
                Home
              </Link>
              <Link
                to="/admin"
                className={`navbar-link ${
                  location.pathname === "/admin" ? "active" : ""
                }`}
              >
                Admin Panel
              </Link>
            </>
          )}

          {/* No admin login link when not logged in */}

          <Link to="/checkout" className="navbar-link cart-link">
            <span className="cart-icon">🛒</span>
            Cart
            {cartItemsCount > 0 && (
              <span className="cart-badge">{cartItemsCount}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
