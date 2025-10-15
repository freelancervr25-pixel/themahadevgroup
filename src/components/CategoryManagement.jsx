import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCategories,
  selectActiveCategories,
  selectDeletedCategories,
  selectProductsLoading,
  selectProductsError,
  loadCategoriesAsync,
  deleteCategoryAsync,
  restoreCategoryAsync,
} from "../store/productsSlice";

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const activeCategories = useSelector(selectActiveCategories);
  const deletedCategories = useSelector(selectDeletedCategories);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    // Load categories when component mounts
    dispatch(loadCategoriesAsync());
  }, [dispatch]);

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"? This action can be undone.`)) {
      try {
        await dispatch(deleteCategoryAsync(categoryId)).unwrap();
        alert("Category deleted successfully!");
      } catch (error) {
        alert(`Error deleting category: ${error}`);
      }
    }
  };

  const handleRestoreCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to restore "${categoryName}"?`)) {
      try {
        await dispatch(restoreCategoryAsync(categoryId)).unwrap();
        alert("Category restored successfully!");
      } catch (error) {
        alert(`Error restoring category: ${error}`);
      }
    }
  };

  const CategoryCard = ({ category, isDeleted = false }) => (
    <div className={`category-card ${isDeleted ? "deleted" : ""}`}>
      <div className="category-info">
        <h3 className="category-name">{category.name}</h3>
        {category.description && (
          <p className="category-description">{category.description}</p>
        )}
        {category.productCount !== undefined && (
          <p className="category-count">
            {category.productCount} product{category.productCount !== 1 ? "s" : ""}
          </p>
        )}
        {isDeleted && category.deletedAt && (
          <p className="deleted-date">
            Deleted: {new Date(category.deletedAt).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="category-actions">
        {isDeleted ? (
          <button
            onClick={() => handleRestoreCategory(category.id, category.name)}
            className="restore-button"
            disabled={loading}
          >
            {loading ? "⏳" : "♻️"} Restore
          </button>
        ) : (
          <button
            onClick={() => handleDeleteCategory(category.id, category.name)}
            className="delete-button"
            disabled={loading}
          >
            {loading ? "⏳" : "🗑️"} Delete
          </button>
        )}
      </div>
    </div>
  );

  if (loading && categories.length === 0) {
    return (
      <div className="category-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-management">
      <div className="category-header">
        <h2>Category Management</h2>
        <div className="category-tabs">
          <button
            className={`tab-button ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Active ({activeCategories.length})
          </button>
          <button
            className={`tab-button ${activeTab === "deleted" ? "active" : ""}`}
            onClick={() => setActiveTab("deleted")}
          >
            Deleted ({deletedCategories.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="error-container">
          <p>⚠️ {error}</p>
          <button
            onClick={() => dispatch(loadCategoriesAsync())}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      )}

      <div className="categories-container">
        {activeTab === "active" ? (
          <div className="categories-grid">
            {activeCategories.length > 0 ? (
              activeCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))
            ) : (
              <div className="no-categories">
                <p>No active categories found.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="categories-grid">
            {deletedCategories.length > 0 ? (
              deletedCategories.map((category) => (
                <CategoryCard key={category.id} category={category} isDeleted={true} />
              ))
            ) : (
              <div className="no-categories">
                <p>No deleted categories found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
