import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllProducts,
  selectProductsLoading,
  selectProductsError,
  loadProductsAsync,
} from "../store/productsSlice";
import { generateCataloguePDF } from "../utils/pdfHelpers";
import apiService from "../services/api";
import ProductCard from "../components/ProductCard";
import FloatingCartButton from "../components/FloatingCartButton";
import SafetyPopup from "../components/SafetyPopup";
import SafetyFooter from "../components/SafetyFooter";
import "../styles/home.css";

const Home = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [safetyAccepted, setSafetyAccepted] = useState(false);

  useEffect(() => {
    // If this page load was a hard reload, clear session acceptance
    try {
      const nav =
        performance && performance.getEntriesByType
          ? performance.getEntriesByType("navigation")[0]
          : null;
      if (nav && nav.type === "reload") {
        sessionStorage.removeItem("safetyAccepted");
      }
    } catch (_) {
      // no-op
    }

    // Check if safety has been accepted in this session
    const accepted = sessionStorage.getItem("safetyAccepted");
    if (accepted === "true") {
      setSafetyAccepted(true);
    }

    // Load products from API on component mount
    dispatch(loadProductsAsync());
  }, [dispatch]);

  // Local search effect - filter products by name as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchQuery]);

  const handleDownloadCatalogue = async () => {
    try {
      // Always fetch fresh products for the PDF to ensure content
      const latest = await apiService.loadHomeProducts();
      const list = Array.isArray(latest) && latest.length ? latest : products;
      if (!list || list.length === 0) {
        alert("No products available to include in the catalogue.");
        return;
      }
      await generateCataloguePDF(list);
    } catch (error) {
      console.error("Error generating catalogue PDF:", error);
      alert("Error generating catalogue PDF. Please try again.");
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleSafetyAccept = () => {
    setSafetyAccepted(true);
  };

  const handleSafetyReject = () => {
    // Show alert and keep popup open
    alert(
      "You must accept the safety instructions to access the fireworks catalogue. Please read and accept to continue."
    );
  };

  return (
    <div className="home-page">
      {/* Safety Popup - shows if not accepted yet */}
      {!safetyAccepted && (
        <SafetyPopup
          onAccept={handleSafetyAccept}
          onReject={handleSafetyReject}
        />
      )}

      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">🎆 Fireworks 🎆</h1>
          <p className="hero-subtitle">
            Premium Firecrackers for Every Celebration
          </p>
          <button
            className="catalogue-button"
            onClick={handleDownloadCatalogue}
          >
            📘 Download Full Catalogue
          </button>
          <div
            className="coupon-highlight"
            role="note"
            aria-label="Coupon offer"
          >
            Use code <strong>FIRSTSALE15</strong> for an extra{" "}
            <strong>15% OFF</strong>
          </div>
        </div>
      </div>

      <div className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Products</h2>

            {/* Search Bar */}
            <div className="search-form">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="clear-search-button"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-container">
              <p>⚠️ {error}</p>
              <button
                onClick={() => dispatch(loadProductsAsync())}
                className="retry-button"
              >
                Retry
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <div className="products-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="no-products">
                  <p>
                    {searchQuery
                      ? `No products found for "${searchQuery}".`
                      : "No products found."}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="clear-search-button"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SafetyFooter />
      <FloatingCartButton />
    </div>
  );
};

export default Home;
