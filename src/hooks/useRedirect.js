import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../contexts/CurrentUserContext";

export const useRedirect = (userAuthStatus) => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (userAuthStatus === "loggedIn" && currentUser) {
      navigate("/", { replace: true });
    }
  }, [currentUser, navigate, userAuthStatus]);
};
