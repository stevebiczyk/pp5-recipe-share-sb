import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthLoading, useCurrentUser } from "../contexts/CurrentUserContext";

export const useRedirect = (userAuthStatus) => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const authLoading = useAuthLoading();

  useEffect(() => {
    if (authLoading) return;
    if (userAuthStatus === "loggedIn" && currentUser) {
      navigate("/", { replace: true });
    }
    if (userAuthStatus === "loggedOut" && !currentUser) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, currentUser, navigate, userAuthStatus]);
};
