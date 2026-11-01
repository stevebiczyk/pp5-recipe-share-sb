import axios from "axios";

// const isLocalhost =
//   typeof window !== "undefined" &&
//   (window.location.hostname === "localhost" ||
//     window.location.hostname === "127.0.0.1");

const apiBaseURL = import.meta.env.VITE_API_URL;

if (!apiBaseURL) {
  throw new Error("Missing VITE_API_URL environment variable");
}

const apiConfig = {
  baseURL: apiBaseURL.replace(/\/+$/, "") + "/",
  withCredentials: true,
};

const api = axios.create(apiConfig);
const axiosReq = axios.create(apiConfig);
const axiosRes = axios.create(apiConfig);

export { api, axiosReq, axiosRes };
