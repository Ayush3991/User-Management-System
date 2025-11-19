import React, { useState, useEffect } from "react";
import { FaUser, FaPhone, FaEnvelope, FaEdit } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { fetchUser, updateUserApi } from "./services/api";
import "./CreateForm.css";

function EditForm() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLocalUser, setIsLocalUser] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        let local = [];
        try {
          local = JSON.parse(localStorage.getItem("localUsers") || "[]");
          if (!Array.isArray(local)) local = [];
        } catch (err) {
          console.error("localStorage read error:", err);
          local = [];
        }

        const foundLocal = local.find((u) => String(u.id) === String(userId));
        if (foundLocal) {
          setFormData({
            name: foundLocal.name || "",
            email: foundLocal.email || "",
            phone: foundLocal.phone || "",
          });
          setIsLocalUser(true);
          setIsLoading(false);
          return;
        }

        const remoteUser = await fetchUser(userId);
        if (!remoteUser) {
          alert("User not found.");
          navigate("/page-details");
          return;
        }

        setFormData({
          name: remoteUser.name || "",
          email: remoteUser.email || "",
          phone: remoteUser.phone || "",
        });
      } catch (err) {
        console.error("Failed to load user:", err);
        alert("Could not load user data. Try again.");
        navigate("/page-details");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) load();
  }, [userId, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters.";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email address.";
    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) newErrors.phone = "Enter a valid 10-digit phone number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    };

    let apiSucceeded = false;
    try {
      const updated = await updateUserApi(userId, payload);
      console.log("Remote update success:", updated);
      apiSucceeded = true;
    } catch (apiErr) {
      // API failed
      console.error("Update failed (remote):", apiErr);
      apiSucceeded = false;
    }

    try {
      const localRaw = localStorage.getItem("localUsers");
      if (localRaw) {
        let local = [];
        try {
          local = JSON.parse(localRaw) || [];
        } catch (pserr) {
          console.error("localStorage parse error:", pserr);
          local = [];
        }

        const existsLocally = local.some((u) => String(u.id) === String(userId));
        if (existsLocally) {
          const newLocal = local.map((u) =>
            String(u.id) === String(userId) ? { ...u, ...payload } : u
          );
          localStorage.setItem("localUsers", JSON.stringify(newLocal));
          console.log("LocalStorage updated for userId:", userId);
        } else if (!apiSucceeded) {
          console.warn("API failed and user not found in localStorage; no local update performed.");
        }
      } else if (!apiSucceeded) {
        alert("Could not update user (network error). Please try again later.");
        setIsSubmitting(false);
        return;
      }
    } catch (lsErr) {
      console.error("Error updating localStorage:", lsErr);
      if (!apiSucceeded) {
        alert("Could not update user due to a local storage error. Check console.");
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitted(true);
    setIsSubmitting(false);
    setTimeout(() => navigate("/page-details"), 700);
  };

  if (isLoading) {
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
                <FaEdit className="label-icon1" /> Loading User Data...
              </h1>
            </div>
            <div className="form" style={{ textAlign: "center", padding: "3rem" }}>
              <div className="spinner" style={{ margin: "0 auto" }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <h2 className="success-title">User Updated Successfully!</h2>
            <p className="success-message">Changes have been saved successfully.</p>
            <button className="submit-button" onClick={() => navigate("/page-details")}>
              Back to User Details
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <FaEdit className="label-icon1" /> Edit User Information
            </h1>
            <p className="form-description">Update the user details below</p>
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
                onChange={(e) => handleInputChange(e)}
                className={`form-input ${errors.name ? "error" : ""}`}
                placeholder="Enter full name"
                required
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">
                <FaPhone className="label-icon2" /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange(e)}
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
                onChange={(e) => handleInputChange(e)}
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder="example@mail.com"
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="button"
                onClick={() => navigate("/page-details")}
                className="submit-button"
                style={{
                  background: "linear-gradient(135deg, #6b7280, #4b5563)",
                  flex: "1",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`submit-button ${isSubmitting ? "submitting" : ""}`}
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  flex: "2",
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditForm;
