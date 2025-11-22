import { useNavigate, useRoutes, type NavigateFunction } from "react-router-dom";
import { useEffect } from "react";
import routes from "./config";

let navigateResolver: (navigate: NavigateFunction) => void;
declare global {
  interface Window {
    REACT_APP_NAVIGATE: NavigateFunction;
  }
}

// Export Promise để các file ngoài component (axios, utils...) có thể dùng
export const navigatePromise = new Promise<NavigateFunction>((resolve) => {
  navigateResolver = resolve;
});

export function AppRoutes() {
  const element = useRoutes(routes);
  const navigate = useNavigate();

  useEffect(() => {
    window.REACT_APP_NAVIGATE = navigate;
  
    if (navigateResolver) {
      navigateResolver(navigate);
    }
  }, [navigate]);
  return element;
}