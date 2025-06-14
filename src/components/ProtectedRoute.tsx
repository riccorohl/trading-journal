import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from './AuthForm';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Authenticating..." />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
