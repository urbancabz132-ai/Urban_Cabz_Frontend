// src/services/adminService.js
// Small helper wrapper around admin APIs for booking tickets and taxi assignment.

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

function getAuthToken() {
  const userType = localStorage.getItem("userType");
  if (userType === "customer") {
    return localStorage.getItem("customerToken");
  } else if (userType === "business") {
    return localStorage.getItem("businessToken");
  }
  return null;
}

function buildAuthHeaders() {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchAdminMe() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/me`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data.message || "Unable to fetch admin profile",
      };
    }
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("fetchAdminMe error:", error);
    return {
      success: false,
      message: "Network error while fetching admin profile",
      error: error.message,
    };
  }
}

export async function fetchAdminBookings() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data.message || "Unable to load booking tickets",
      };
    }
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("fetchAdminBookings error:", error);
    return {
      success: false,
      message: "Network error while loading bookings",
      error: error.message,
    };
  }
}

export async function fetchAdminBookingTicket(bookingId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/bookings/${bookingId}`,
      {
        method: "GET",
        headers: buildAuthHeaders(),
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data.message || "Unable to load booking ticket",
      };
    }
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("fetchAdminBookingTicket error:", error);
    return {
      success: false,
      message: "Network error while loading booking ticket",
      error: error.message,
    };
  }
}

export async function upsertTaxiAssignment(bookingId, payload) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/bookings/${bookingId}/assign-taxi`,
      {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data.message || "Unable to save taxi assignment",
      };
    }
    return {
      success: true,
      data,
      message: data.message || "Taxi assignment saved",
    };
  } catch (error) {
    console.error("upsertTaxiAssignment error:", error);
    return {
      success: false,
      message: "Network error while saving taxi assignment",
      error: error.message,
    };
  }
}


