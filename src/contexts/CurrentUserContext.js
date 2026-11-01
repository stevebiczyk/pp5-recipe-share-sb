import { createContext, useContext, useEffect, useState } from "react";
import { api, axiosReq, axiosRes } from "../api/axiosDefaults";

export const CurrentUserContext = createContext(null);
export const SetCurrentUserContext = createContext(() => {});

export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);

let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = api.post("/dj-rest-auth/token/refresh/").finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const { data } = await axiosRes.get("/dj-rest-auth/user/");
        if (active) setCurrentUser(data);
      } catch {
        if (active) setCurrentUser(null);
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleAuthError = async (error) => {
      const request = error.config;
      const url = request?.url || "";

      const isAuthEndpoint = [
        "/dj-rest-auth/login/",
        "/dj-rest-auth/logout/",
        "/dj-rest-auth/registration/",
        "/dj-rest-auth/token/refresh/",
      ].some((path) => url.includes(path));

      if (
        error.response?.status !== 401 ||
        !request ||
        request._retry ||
        isAuthEndpoint
      ) {
        return Promise.reject(error);
      }

      request._retry = true;

      try {
        await refreshAccessToken();
        return api(request);
      } catch {
        setCurrentUser(null);
        return Promise.reject(error);
      }
    };

    const reqInterceptor = axiosReq.interceptors.response.use(
      (response) => response,
      handleAuthError,
    );

    const resInterceptor = axiosRes.interceptors.response.use(
      (response) => response,
      handleAuthError,
    );

    return () => {
      axiosReq.interceptors.response.eject(reqInterceptor);
      axiosRes.interceptors.response.eject(resInterceptor);
    };
  }, []);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <SetCurrentUserContext.Provider value={setCurrentUser}>
        {children}
      </SetCurrentUserContext.Provider>
    </CurrentUserContext.Provider>
  );
};
