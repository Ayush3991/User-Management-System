import React, { useState } from "react";
import { FaUser, FaPhone, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { createUserApi } from "./services/api"; // JSONPlaceholder wrapper
import "./CreateForm.css";

function CreateForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    // 10-digit phone validation
    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
    }

    // Email check
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Submit 
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate before sending
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };

      const created = await createUserApi(payload);

      try {
        const prev = JSON.parse(localStorage.getItem("localUsers") || "[]");
        prev.unshift(created);
        localStorage.setItem("localUsers", JSON.stringify(prev));
      } catch (lsErr) {
        console.error("localStorage error:", lsErr);
      }

      alert(`User created (simulated). ID: ${created.id}`);
      setIsSubmitted(true);

      // Navigate back to homepage 
      setTimeout(() => navigate("/homepage"), 700);
    } catch (error) {
      // API error
      console.error("Create failed:", error);
      alert("Something went wrong while creating the user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success 
  if (isSubmitted) {
    return (
      <div className="app">
        <div className="background">
          {[...Array(6)].map((_, i) => (
            <div className={`ball ball-${i + 1}`} key={i}></div>
          ))}
        </div>

        <div className="container">
          <div className="form-card success-card">
            <h2 className="success-title">🎉 Form Submitted Successfully!</h2>
            <p className="success-message">Thank you — the user was created (simulated).</p>
            <button className="submit-button" onClick={() => navigate("/homepage")}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main form 
  return (
    <div className="app">
      <div className="background">
        {[...Array(6)].map((_, i) => (
          <div className={`ball ball-${i + 1}`} key={i}></div>
        ))}
      </div>

      <div className="container">
        <div className="form-card">
          <div className="form-header">
            <h1 className="form-title">
              <FaUser className="label-icon1" /> User Information
            </h1>
            <p className="form-description">Please fill all required fields below</p>
          </div>

          <form onSubmit={handleSubmit} className="form" noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">
                <FaUser className="label-icon2" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? "error" : ""}`}
                placeholder="Enter full name"
                required
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label">
                <FaPhone className="label-icon2" /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`form-input ${errors.phone ? "error" : ""}`}
                placeholder="10-digit number"
                required
                inputMode="numeric"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                <FaEnvelope className="label-icon2" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder="example@mail.com"
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`submit-button ${isSubmitting ? "submitting" : ""}`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateForm;
