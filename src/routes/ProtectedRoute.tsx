import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import React, { useEffect, useRef } from "react";
import { toast } from "react-toastify";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const toastId = useRef<any>(null);
  if (loading) return null; 
  if (!isAuthenticated) {
    if (!toastId.current) {
      toastId.current = toast.warning("Vui lòng đăng nhập để tiếp tục!", {
        autoClose: 2000,
        onClose: () => { toastId.current = null }
      });
    }
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return <>{children}</>;
};