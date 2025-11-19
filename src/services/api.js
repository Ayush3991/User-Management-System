// src/services/api.js

/**
 * This file contains simple wrapper functions
 * to communicate with the JSONPlaceholder API.
 *
 * JSONPlaceholder simulates a backend:
 * - POST /users   → creates a fake user (simulated)
 * - GET /users    → returns list of demo users
 * - PUT /users/:id → updates user (simulated)
 * - DELETE /users/:id → deletes user (simulated)
 */

const BASE_URL = "https://jsonplaceholder.typicode.com";

/** Fetch all users */
export async function fetchUsers() {
  const response = await fetch(`${BASE_URL}/users`);

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}

/** Fetch single user by ID */
export async function fetchUser(id) {
  const response = await fetch(`${BASE_URL}/users/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch the selected user");
  }

  return response.json();
}

/** Create user (POST request - simulated) */
export async function createUserApi(userData) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  // JSONPlaceholder returns the same data with a simulated ID
  return response.json();
}

/** Update user (PUT request - simulated) */
export async function updateUserApi(id, userData) {
  const response = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  return response.json();
}

/** Delete user (simulated) */
export async function deleteUserApi(id) {
  const response = await fetch(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }

  return { success: true };
}
