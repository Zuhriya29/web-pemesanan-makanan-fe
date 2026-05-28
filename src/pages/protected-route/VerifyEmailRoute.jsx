import { Navigate } from "react-router-dom";

const VerifyEmailRoute = ({ children }) => {
  const token = localStorage.getItem("verify_token");

  // Jika tidak ada token → tidak boleh akses
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default VerifyEmailRoute;