import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children, requireApproved = false }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute - Auth state:', { user, loading, isAuthenticated, path: location.pathname });
  }, [user, loading, isAuthenticated, location.pathname]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute - Redirecting to login, auth failed');
    return <Navigate to="/login" replace />;
  }

  // Check if account approval is required
  if (requireApproved && user.status !== "Approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Account Pending Approval</h2>
          <p className="text-gray-600 mb-4">
            Your account is currently under review. Please wait for admin approval before accessing the dashboard.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Status: <span className="font-semibold text-yellow-600">{user.status}</span>
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition"
            >
              Refresh Status
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('ProtectedRoute - Rendering protected content for user:', user.storename);
  
  // Render protected content
  return children;
};

export default ProtectedRoute; 