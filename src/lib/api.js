import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// SSR-safe redirect helper
function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;

    const url = originalRequest.url || "";
    const isAuthPath =
      url.includes("/auth/login/") ||
      url.includes("/auth/register/") ||
      url.includes("/auth/refresh/");

    // Handle 401 with token refresh (once)
    if (status === 401 && !originalRequest._retry && !isAuthPath) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().getRefreshToken();
        if (refreshToken) {
          const response = await api.post("/auth/refresh/", {
            refresh: refreshToken,
          });
          const newAccessToken = response.data.access;
          useAuthStore.getState().updateTokens(newAccessToken, refreshToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    // For other 401s (or when no refresh token)
    if (status === 401 && !isAuthPath) {
      useAuthStore.getState().logout();
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => {
    return api.post("/auth/login/", {
      username: data.username,
      password: data.password,
    });
  },
  loginTelegram: (data) => {
    return api.post("/auth/telegram/",data)
  },

  register: (data) => {
    return api.post("/auth/register/", {
      username: data.username,
      password: data.password,
      role: data.role,
      phone: data.phone,
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      email: data.email || "",
    });
  },

  refreshToken: (refreshToken) => {
    return api.post("/auth/refresh/", {
      refresh: refreshToken,
    });
  },

  getProfile: () => {
    return api.get("/auth/me/");
  },

  updateProfile: (data) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== "") {
        formData.append(key, data[key]);
      }
    });

    return api.patch("/auth/me/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    return api.patch("/auth/me/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getUser: (userId) => {
    return api.get(`/auth/users/${userId}/`);
  },
};

export const ridesAPI = {
  getAvailableTrips: (routeId, date) => {
    let url = "/trips/";
    const params = [];

    params.push("status=available");

    if (routeId) {
      params.push(`route=${routeId}`);
    }

    if (date) {
      params.push(`departure_date=${date}`);
    }

    if (params.length > 0) {
      url += "?" + params.join("&");
    }

    return api.get(url);
  },

  getTrip: (tripId) => {
    return api.get(`/trips/${tripId}/`);
  },

  createTrip: (data) => {
    return api.post("/trips/", data);
  },

  updateTripStatus: (tripId, status) => {
    return api.patch(`/trips/${tripId}/`, { status });
  },

  getMyTrips: () => {
    return api.get("/trips/my/");
  },
};

export const bookingAPI = {
  createBooking: (data) => {
    const requestData = {
      trip: data.tripId,
      seats_reserved: data.seatsReserved,
    };
    return api.post("/bookings/", requestData);
  },

  getMyBookings: () => {
    return api.get("/bookings/").then((response) => {
      return response;
    });
  },

  getBooking: (bookingId) => {
    return api.get(`/bookings/${bookingId}/`);
  },

  getMyBookingForTrip: (tripId) => {
    return api.get(`/bookings/`).then((response) => {
      const bookings = response.data || [];
      const tripBooking = bookings.find(
        (booking) => booking.trip === parseInt(tripId)
      );
      return { data: tripBooking || null };
    });
  },

  cancelBooking: (bookingId) => {
    return api.delete(`/bookings/${bookingId}/`, { status: "cancelled" });
  },

  updateBooking: (bookingId, data) => {
    return api.patch(`/bookings/${bookingId}/`, {
      seats_reserved: data.seatsReserved || data.seats_reserved,
    });
  },
};

export const vehiclesAPI = {
  getAllVehicles: () => {
    return api.get("/vehicles/");
  },

  getMyVehicles: () => {
    return api.get("/vehicles/");
  },

  getMyVehicle: async () => {
    try {
      const profileResponse = await api.get("/auth/me/");
      const myUserId = profileResponse.data.id;

      const vehiclesResponse = await api.get("/vehicles/");
      const allVehicles = vehiclesResponse.data;

      const myVehicle = allVehicles.find(
        (vehicle) => vehicle.owner === myUserId
      );

      if (myVehicle) {
        return { data: myVehicle };
      } else {
        return { data: null };
      }
    } catch (error) {
      throw error;
    }
  },

  createVehicle: (data) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== "") {
        if (key === "vehicle_image" && data[key] instanceof File) {
          formData.append(key, data[key]);
        } else if (key !== "vehicle_image") {
          formData.append(key, data[key]);
        }
      }
    });

    return api.post("/vehicles/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateVehicle: (vehicleId, data) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== "") {
        if (key === "vehicle_image" && data[key] instanceof File) {
          formData.append(key, data[key]);
        } else if (key !== "vehicle_image") {
          formData.append(key, data[key]);
        }
      }
    });

    return api.patch(`/vehicles/${vehicleId}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateVehiclePhoto: (vehicleId, file) => {
    const formData = new FormData();
    formData.append("vehicle_image", file); // ИСПРАВЛЕНО: vehicle_image вместо photo

    return api.patch(`/vehicles/${vehicleId}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteVehicle: (vehicleId) => {
    return api.delete(`/vehicles/delete/${vehicleId}/`);
  },
};

export const routesAPI = {
  getAllRoutes: () => {
    return api.get("/routes/");
  },

  createRoute: (routeData) => {
    return api.post("/routes/", routeData);
  },
};

export const ratingsAPI = {
  createRating: (ratingData) => {
    return api.post("/ratings/", {
      trip: ratingData.trip,
      driver: ratingData.driver,
      score: ratingData.score,
      comment: ratingData.comment || "",
    });
  },

  getDriverRatings: (driverId) => {
    return api.get(`/ratings/drivers/${driverId}/`);
  },
};

export default api;
