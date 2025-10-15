import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutAsync } from "../store/authSlice";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductAsync,
  createProductAsync,
  deleteProductAsync,
  loadAdminProductsAsync,
} from "../store/productsSlice";
import { fileToBase64, validateImageFile } from "../utils/base64Helper";
import {
  getFileSizeKB,
  getBase64SizeKB,
  getCompressionRatio,
} from "../utils/imageCompression";
import ProductImage from "./ProductImage";
import "../styles/admin.css";

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
    category: "sparklers",
  });
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState(null);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate("/admin-login");
      return;
    }
    // Load products after admin login using admin credentials context
    dispatch(loadAdminProductsAsync());
  }, [isLoggedIn, navigate, dispatch]);

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

  const handleImageChange = async (e) => {
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
      setRemoveImage(false); // If new image is uploaded, don't remove existing

      // Show compression info
      try {
        const originalSize = getFileSizeKB(file);
        const compressedBase64 = await fileToBase64(file, true);
        const compressedSize = getBase64SizeKB(compressedBase64);
        const compressionRatio = getCompressionRatio(
          originalSize,
          compressedSize
        );

        setCompressionInfo({
          originalSize,
          compressedSize,
          compressionRatio,
        });
      } catch (error) {
        console.error("Error calculating compression info:", error);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.originalPrice || formData.originalPrice <= 0)
      newErrors.originalPrice = "Valid original price is required";
    if (
      formData.stock === "" ||
      formData.stock === null ||
      Number(formData.stock) < 0
    )
      newErrors.stock = "Valid stock quantity is required";
    // description optional
    // image optional for both create and edit

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let imageData = null;

      if (editingProduct) {
        // When editing, handle different image scenarios
        if (removeImage) {
          imageData = undefined;
        } else if (imageFile) {
          imageData = await fileToBase64(imageFile); // New image uploaded
        } else {
          // Keep existing image (don't send image field)
          imageData = undefined;
        }
      } else {
        // Creating new product: image optional
        imageData = imageFile ? await fileToBase64(imageFile) : undefined;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
        // Always send numeric stock; default to 0 when empty/invalid
        stock: Number(formData.stock) || 0,
        image: imageData, // Can be base64, null, or undefined
      };

      if (editingProduct) {
        // Use async update for backend integration
        try {
          await dispatch(
            updateProductAsync({
              productId: editingProduct.id,
              productData: {
                name: productData.name,
                // description optional
                description: productData.description?.trim()
                  ? productData.description
                  : undefined,
                price: productData.price,
                originalPrice: productData.originalPrice,
                stock: productData.stock,
                image: productData.image,
                category: formData.category,
                inStock: productData.stock > 0,
              },
            })
          ).unwrap();
          setEditingProduct(null);
          alert("Product updated successfully!");
        } catch (error) {
          alert(`Error updating product: ${error}`);
        }
      } else {
        // Use async create for backend integration
        try {
          await dispatch(
            createProductAsync({
              name: productData.name,
              // description optional
              description: productData.description?.trim()
                ? productData.description
                : undefined,
              price: productData.price,
              originalPrice: productData.originalPrice,
              stock: productData.stock,
              image: productData.image,
              category: formData.category,
              inStock: productData.stock > 0,
            })
          ).unwrap();
          alert("Product created successfully!");
        } catch (error) {
          alert(`Error creating product: ${error}`);
        }
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
      category: "sparklers",
    });
    setImageFile(null);
    setRemoveImage(false);
    setCompressionInfo(null);
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
      category: product.category || "sparklers",
    });
    setImageFile(null); // Clear previous image file
    setRemoveImage(false); // Reset remove image option
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await dispatch(deleteProductAsync(id)).unwrap();
        alert("Product deleted successfully!");
      } catch (error) {
        alert(`Error deleting product: ${error}`);
      }
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
        {/* Admin Section Header */}
        <div className="admin-tabs">
          <button
            className={`admin-tab active`}
            onClick={() => setActiveTab("products")}
          >
            📦 Products ({products.length})
          </button>
        </div>

        {/* Products Content */}
        {
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
                      <label>Description (optional)</label>
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
                      <label>Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="category-select"
                      >
                        <option value="sparklers">✨ Sparklers</option>
                        <option value="crackers">💥 Crackers</option>
                        <option value="fountains">🌈 Fountains</option>
                        <option value="rockets">🚀 Rockets</option>
                        <option value="novelties">💨 Novelties</option>
                      </select>
                      {errors.category && (
                        <span className="error">{errors.category}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Product Image (optional)</label>

                      {/* Show current image when editing */}
                      {editingProduct && !imageFile && !removeImage && (
                        <div className="current-image-section">
                          <h4>Current Image:</h4>
                          <div className="current-image-preview">
                            <ProductImage
                              src={editingProduct.image}
                              alt="Current product image"
                              style={{ maxWidth: "200px", maxHeight: "200px" }}
                            />
                          </div>
                        </div>
                      )}

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

                      {/* Remove image option when editing */}
                      {editingProduct && (
                        <div className="remove-image-option">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={removeImage}
                              onChange={(e) => setRemoveImage(e.target.checked)}
                            />
                            <span>🗑️ Remove current image</span>
                          </label>
                        </div>
                      )}

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
                            <p>
                              <strong>File:</strong> {imageFile.name}
                            </p>
                            <p>
                              <strong>Size:</strong>{" "}
                              {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p>
                              <strong>Type:</strong> {imageFile.type}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Compression Info */}
                      {compressionInfo && (
                        <div className="compression-info">
                          <h4>📊 Image Compression Info</h4>
                          <div className="compression-stats">
                            <div className="stat-item">
                              <span className="stat-label">Original Size:</span>
                              <span className="stat-value">
                                {compressionInfo.originalSize} KB
                              </span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">
                                Compressed Size:
                              </span>
                              <span className="stat-value">
                                {compressionInfo.compressedSize} KB
                              </span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Compression:</span>
                              <span className="stat-value success">
                                {compressionInfo.compressionRatio}% smaller
                              </span>
                            </div>
                          </div>
                          <p className="compression-note">
                            ✅ Image will be automatically compressed for
                            optimal API performance
                          </p>
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
                      <ProductImage
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
                      <p className="product-description">
                        {product.description}
                      </p>

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
                      {product.status === "deleted" ? (
                        <span className="deleted-label">Deleted</span>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        }
      </div>
    </div>
  );
};

export default AdminPanel;
