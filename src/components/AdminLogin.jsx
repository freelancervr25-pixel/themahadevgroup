import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginAsync, clearError } from "../store/authSlice";
import "../styles/admin.css";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isLoggedIn, loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  React.useEffect(() => {
    if (isLoggedIn) {
      navigate("/admin");
    }
  }, [isLoggedIn, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginAsync(formData));
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <h1>🔐 Admin Login</h1>
          <p>Shree Ram Fireworks Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-info">
          <p>
            <strong>Admin Credentials:</strong>
          </p>
          <p>Username: mahadev</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
