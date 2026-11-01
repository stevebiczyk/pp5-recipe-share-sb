import axios from "axios";

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const apiBaseUrl =
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
  (isLocalhost
    ? "http://127.0.0.1:8000/"
    : "https://ci-pp5-backendapi-sb-1f7f0e4a782e.herokuapp.com/");

axios.defaults.baseURL = apiBaseUrl;
axios.defaults.withCredentials = true;

export const axiosReq = axios.create();
export const axiosRes = axios.create();
