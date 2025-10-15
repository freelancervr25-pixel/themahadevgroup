import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllProducts,
  selectProductsLoading,
  selectProductsError,
  loadProductsAsync,
  searchProductsAsync,
} from "../store/productsSlice";
import { generateCataloguePDF } from "../utils/pdfHelpers";
import ProductCard from "../components/ProductCard";
import FloatingCartButton from "../components/FloatingCartButton";
import "../styles/home.css";

const Home = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Load products from API on component mount
    dispatch(loadProductsAsync());
  }, [dispatch]);

  const handleDownloadCatalogue = async () => {
    try {
      await generateCataloguePDF(products);
    } catch (error) {
      console.error("Error generating catalogue PDF:", error);
      alert("Error generating catalogue PDF. Please try again.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(searchProductsAsync(searchQuery.trim()));
    } else {
      // If search is empty, reload all products
      dispatch(loadProductsAsync());
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    dispatch(loadProductsAsync());
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">🎆 Shree Ram Fireworks 🎆</h1>
          <p className="hero-subtitle">
            Premium Firecrackers for Every Celebration
          </p>
          <button
            className="catalogue-button"
            onClick={handleDownloadCatalogue}
          >
            📘 Download Full Catalogue
          </button>
        </div>
      </div>

      <div className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Products</h2>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  🔍
                </button>
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
            </form>
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
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="no-products">
                  <p>No products found.</p>
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

      <FloatingCartButton />
    </div>
  );
};

export default Home;
