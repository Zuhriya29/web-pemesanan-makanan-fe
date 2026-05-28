import axios from "axios";
import Swal from "sweetalert2";
import "../styles/global.css";

const api = axios.create({
  baseURL: "https://web-pemesanan-makanan-be.vercel.app/api",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isSessionExpiredHandled = false;

api.interceptors.response.use(
  (response) => {
    // Reset flag saat ada response sukses
    isSessionExpiredHandled = false;
    return response;
  },

  (error) => {
    const isLoggedIn = localStorage.getItem("token");

    if (error.response?.status === 401 && isLoggedIn) {
      if (!isSessionExpiredHandled) {
        isSessionExpiredHandled = true;

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        Swal.fire({
          icon: "warning",
          title: "Sesi Anda Telah Berakhir",
          text: "Silakan login kembali untuk melanjutkan",
          confirmButtonText: "Login",
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
            confirmButton: "custom-cancel-button",
          },
        }).then(() => {
          isSessionExpiredHandled = false;
          window.location.href = "/login";
        });
      }
    }

    return Promise.reject(error);
  },
);

export default api;
