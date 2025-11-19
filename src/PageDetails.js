import { useNavigate } from "react-router-dom";
import "./PageDetails.css";
import { useEffect, useState } from "react";
import { fetchUsers, deleteUserApi } from "./services/api";

function PageDetails() {
  const navigate = useNavigate();

  // State
  const [users, setUsers] = useState([]); 
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("name");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // fetch users
        const remote = await fetchUsers(); 

        let local = [];
        try {
          local = JSON.parse(localStorage.getItem("localUsers") || "[]");
          if (!Array.isArray(local)) local = [];
        } catch (err) {
          console.error("localStorage read error:", err);
          local = [];
        }

        const merged = [...local, ...remote];

        setUsers(merged);
        setFilteredUsers(merged);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  // Filter logic
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter((u) => {
      if (filterBy === "email") return (u.email || "").toLowerCase().includes(term);
      if (filterBy === "phone") return (u.phone || "").toLowerCase().includes(term);
      return (u.name || "").toLowerCase().includes(term);
    });

    setFilteredUsers(filtered);
  }, [searchTerm, filterBy, users]);

  // Navigation helpers
  const handleBackToHome = () => navigate("/homepage");
  const clearSearch = () => setSearchTerm("");

  const handleEdit = (userId) => {
    navigate(`/Edit/${userId}`);
  };

   // Delete a user
  const handleDelete = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      setLoading(true);

      try {
        await deleteUserApi(userId);
      } catch (apiErr) {
        console.warn("API delete failed (simulated), continuing to remove locally:", apiErr);
      }

      const updatedUsers = users.filter((u) => String(u.id) !== String(userId));
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

      try {
        const local = JSON.parse(localStorage.getItem("localUsers") || "[]");
        if (Array.isArray(local) && local.length > 0) {
          const newLocal = local.filter((l) => String(l.id) !== String(userId));
          localStorage.setItem("localUsers", JSON.stringify(newLocal));
        }
      } catch (lsErr) {
        console.error("localStorage cleanup error:", lsErr);
      }

      alert("User deleted (simulated).");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete the user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pd-dashboard-container">
      {/* Animated background elements */}
      <div className="pd-background-container">
        {[...Array(14)].map((_, i) => (
          <div key={i} className={`pd-floating-ball pd-ball-${i + 1}`}></div>
        ))}
      </div>

      <div className="pd-content-container">
        <div className="pd-card">
          <div className="pd-header">
            <div className="pd-title-container">
              <div className="pd-user-icon">
                <svg className="pd-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h1 className="pd-title">User Details</h1>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="pd-search-filter-container">
            <div className="pd-search-box">
              <div className="pd-search-input-container">
                <svg className="pd-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={`Search by ${filterBy}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pd-search-input"
                />
                {searchTerm && (
                  <button onClick={clearSearch} className="pd-clear-search" aria-label="Clear search">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="pd-filter-container">
              <button className="pd-filter-button" onClick={() => setShowFilterDropdown((s) => !s)}>
                <svg className="pd-filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
                <svg className={`pd-dropdown-arrow ${showFilterDropdown ? "rotated" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showFilterDropdown && (
                <div className="pd-filter-dropdown">
                  <button
                    className={`pd-filter-option ${filterBy === "name" ? "active" : ""}`}
                    onClick={() => {
                      setFilterBy("name");
                      setShowFilterDropdown(false);
                    }}
                  >
                    By Name
                  </button>
                  <button
                    className={`pd-filter-option ${filterBy === "email" ? "active" : ""}`}
                    onClick={() => {
                      setFilterBy("email");
                      setShowFilterDropdown(false);
                    }}
                  >
                    By Email
                  </button>
                  <button
                    className={`pd-filter-option ${filterBy === "phone" ? "active" : ""}`}
                    onClick={() => {
                      setFilterBy("phone");
                      setShowFilterDropdown(false);
                    }}
                  >
                    By Phone
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="pd-content-box">
            <div className="pd-corner-decoration pd-top-right"></div>
            <div className="pd-corner-decoration pd-bottom-left"></div>

            {loading ? (
              <p className="pd-loading">Loading...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="pd-no-data">{searchTerm ? `No users found matching "${searchTerm}"` : "No user data found."}</p>
            ) : (
              <ul className="pd-user-list slide-in-left">
                {filteredUsers.map((user) => (
                  <li key={user.id} className="pd-user-item">
                    <div className="pd-action-buttons">
                      <button className="pd-edit-button" onClick={() => handleEdit(user.id)} title="Edit User">
                        <svg className="pd-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button className="pd-delete-button" onClick={() => handleDelete(user.id)} title="Delete User">
                        <svg className="pd-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Phone:</strong> {user.phone}</p>
                    <p><strong>Email:</strong> {user.email}</p>

                    <hr />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Back button */}
          <div className="pd-button-container">
            <button className="pd-back-button" onClick={handleBackToHome}>
              <svg className="pd-arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageDetails;
