import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutAsync } from "../store/authSlice";
import {
  addProduct,
  updateProduct,
  deleteProduct,
} from "../store/productsSlice";
import { fileToBase64, validateImageFile } from "../utils/base64Helper";
import CategoryManagement from "./CategoryManagement";
import "../styles/admin.css";
import "../styles/categoryManagement.css";

const AdminPanel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, adminUser } = useSelector((state) => state.auth);
  const products = useSelector((state) => state.products.products);

  const [activeTab, setActiveTab] = useState("products");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    stock: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate("/admin-login");
    }
  }, [isLoggedIn, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setErrors((prev) => ({
          ...prev,
          image: validation.error,
        }));
        return;
      }

      setImageFile(file);
      setErrors((prev) => ({
        ...prev,
        image: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.originalPrice || formData.originalPrice <= 0)
      newErrors.originalPrice = "Valid original price is required";
    if (!formData.stock || formData.stock < 0)
      newErrors.stock = "Valid stock quantity is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!imageFile) newErrors.image = "Image file is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Convert uploaded image to base64
      const base64Image = await fileToBase64(imageFile);

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
        stock: parseInt(formData.stock),
        image: base64Image, // Always use uploaded image as base64
      };

      if (editingProduct) {
        dispatch(updateProduct({ id: editingProduct.id, ...productData }));
        setEditingProduct(null);
      } else {
        dispatch(addProduct(productData));
      }

      resetForm();
      setShowAddForm(false);
    } catch (error) {
      setErrors({ image: "Error processing image file" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      originalPrice: "",
      stock: "",
      description: "",
    });
    setImageFile(null);
    setErrors({});
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice.toString(),
      stock: product.stock.toString(),
      description: product.description,
    });
    setImageFile(null); // Clear previous image file
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id));
    }
  };

  const handleLogout = () => {
    dispatch(logoutAsync());
    navigate("/");
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🛠️ Admin Panel</h1>
        <div className="admin-actions">
          <span className="welcome-text">Welcome, {adminUser?.username}</span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="admin-content">
        {/* Admin Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            📦 Products ({products.length})
          </button>
          <button
            className={`admin-tab ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            🏷️ Categories
          </button>
        </div>

        {/* Products Tab Content */}
        {activeTab === "products" && (
          <>
            <div className="admin-actions-bar">
              <button
                className="add-product-button"
                onClick={() => {
                  resetForm();
                  setEditingProduct(null);
                  setShowAddForm(true);
                }}
              >
                ➕ Add New Product
              </button>
            </div>

        {showAddForm && (
          <div className="product-form-container">
            <div className="product-form">
              <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <span className="error">{errors.name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Current Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                    {errors.price && (
                      <span className="error">{errors.price}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Original Price (₹) *</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                    {errors.originalPrice && (
                      <span className="error">{errors.originalPrice}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                    />
                    {errors.stock && (
                      <span className="error">{errors.stock}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows="3"
                  />
                  {errors.description && (
                    <span className="error">{errors.description}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Product Image *</label>
                  <div className="image-input-container">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                    />
                    <div className="file-input-info">
                      <p>📁 Select an image file (JPG, PNG, GIF, WebP)</p>
                      <p className="file-size-info">Max size: 5MB</p>
                    </div>
                  </div>
                  {errors.image && (
                    <span className="error">{errors.image}</span>
                  )}

                  {imageFile && (
                    <div className="image-preview">
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                      />
                      <div className="image-info">
                        <p><strong>File:</strong> {imageFile.name}</p>
                        <p><strong>Size:</strong> {(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <p><strong>Type:</strong> {imageFile.type}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button">
                    {editingProduct ? "Update Product" : "Add Product"}
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                      setEditingProduct(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

            <div className="products-list">
              <h2>Products ({products.length})</h2>
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.id} className="admin-product-card">
                    <div className="product-image">
                      <img
                        src={product.image}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/200x200/d32f2f/ffffff?text=Firework";
                        }}
                      />
                    </div>

                    <div className="product-details">
                      <h3>{product.name}</h3>
                      <p className="product-description">{product.description}</p>

                      <div className="product-pricing">
                        <span className="current-price">₹{product.price}</span>
                        <span className="original-price">
                          ₹{product.originalPrice}
                        </span>
                      </div>

                      <div className="product-stock">
                        Stock: {product.stock} units
                      </div>
                    </div>

                    <div className="product-actions">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(product)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(product.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Categories Tab Content */}
        {activeTab === "categories" && <CategoryManagement />}
      </div>
    </div>
  );
};

export default AdminPanel;
