import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Adjust the path to your useAuth hook

const PrivateRoute = () => {
  const { token } = useAuth(); // Retrieve the token from your custom hook

  // Check if the user is authenticated (e.g., if a token exists).
  // The token is of type string | null, so a simple check works.
  if (!token) {
    // If not authenticated, redirect them to the login page.
    // The `replace` prop prevents going back to the protected page with the back button.
    return <Navigate to="/signin" replace />;
  }

  // If authenticated, render the child routes using <Outlet>.
  return <Outlet />;
};

export default PrivateRoute;