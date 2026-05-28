import { Navigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import PageLoading from "../PageLoading/pageloading";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoading />;
  }

  if (user) {
    return user.role === "admin"
      ? <Navigate to="/beranda-admin" replace />
      : <Navigate to="/menu" replace />;
  }

  return children;
};

export default PublicRoute;
