import React from "react";
import { useSelector } from "react-redux";
import { selectAllProducts } from "../store/productsSlice";
import { generateCataloguePDF } from "../utils/pdfHelpers";
import ProductCard from "../components/ProductCard";
import FloatingCartButton from "../components/FloatingCartButton";
import "../styles/home.css";

const Home = () => {
  const products = useSelector(selectAllProducts);

  const handleDownloadCatalogue = async () => {
    try {
      await generateCataloguePDF(products);
    } catch (error) {
      console.error("Error generating catalogue PDF:", error);
      alert("Error generating catalogue PDF. Please try again.");
    }
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
          <h2 className="section-title">Our Products</h2>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      <FloatingCartButton />
    </div>
  );
};

export default Home;
