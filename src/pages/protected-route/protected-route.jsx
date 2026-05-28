import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAuth from "../../context/useAuth";
import PageLoading from "../PageLoading/pageloading";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const [redirectTo, setRedirectTo] = useState(null);
  const alertedRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (alertedRef.current) return;

    if (!user) {
      alertedRef.current = true;
      Swal.fire({
        icon: "warning",
        title: "Harap login terlebih dahulu!",
        text: "Silakan login untuk melanjutkan.",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button"
        },
      }).then(() => {
        setRedirectTo("/login");
      });
      return;
    }

    if (role && user.role !== role) {
      alertedRef.current = true;
      Swal.fire({
        icon: "info",
        title: "Sudah Login",
        text: `Anda sudah login sebagai ${user.role}`,
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button"
        },
      }).then(() => {
        setRedirectTo(
          user.role === "admin"
            ? "/beranda-admin"
            : "/menu"
        );
      });
      return;
    }

  }, [user, loading, role]);

  if (loading) return <PageLoading />;

  if (redirectTo) return <Navigate to={redirectTo} replace />;

  if (user && (!role || user.role === role)) {
    return children;
  }

  return <PageLoading />;
};

export default ProtectedRoute;