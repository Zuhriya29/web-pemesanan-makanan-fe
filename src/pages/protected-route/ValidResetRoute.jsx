import { Navigate, useSearchParams } from 'react-router-dom';

const ValidResetRoute = ({ children }) => {
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Jika token atau email tidak ada di URL → redirect ke forgot password
  if (!token || !email) {
    return <Navigate to="/forgot-password" replace />;
  }

  return children;
};

export default ValidResetRoute;