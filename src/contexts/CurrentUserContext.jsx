import { createContext, useContext, useEffect, useState } from "react";
import { api, axiosReq, axiosRes } from "../api/axiosDefaults";

export const CurrentUserContext = createContext(null);
export const SetCurrentUserContext = createContext(() => {});
const AuthLoadingContext = createContext(true);

export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);
export const useAuthLoading = () => useContext(AuthLoadingContext);

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
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;

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
      } catch (refreshError) {
        // Only a rejected refresh credential proves the session is no longer valid.
        // Network, CSRF and server failures should leave an established user intact.
        if (active && refreshError.response?.status === 401) setCurrentUser(null);
        return Promise.reject(refreshError);
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

    const loadUser = async () => {
      try {
        const { data } = await axiosRes.get("/dj-rest-auth/user/");
        if (active) setCurrentUser(data);
      } catch {
        if (active) setCurrentUser(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    };
    loadUser();

    return () => {
      active = false;
      axiosReq.interceptors.response.eject(reqInterceptor);
      axiosRes.interceptors.response.eject(resInterceptor);
    };
  }, []);

  return (
    <AuthLoadingContext.Provider value={authLoading}>
      <CurrentUserContext.Provider value={currentUser}>
        <SetCurrentUserContext.Provider value={setCurrentUser}>
          {children}
        </SetCurrentUserContext.Provider>
      </CurrentUserContext.Provider>
    </AuthLoadingContext.Provider>
  );
};
