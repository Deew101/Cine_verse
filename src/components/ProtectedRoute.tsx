import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Film } from "lucide-react";

export const ProtectedRoute = ({
  children,
  requireProfile = false,
}: {
  children: React.ReactNode;
  requireProfile?: boolean;
}) => {
  const { user, loading, activeProfile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Film className="h-10 w-10 animate-pulse text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireProfile && !activeProfile) {
    return <Navigate to="/profiles" replace />;
  }

  return <>{children}</>;
};
