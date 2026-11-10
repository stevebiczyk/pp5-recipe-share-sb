import axios from "axios";
import { localApiRequestUrl, usesLocalApiProxy } from "./localApi";

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error(
    "VITE_API_URL is missing. Check your environment configuration.",
  );
}

const useLocalProxy = usesLocalApiProxy(apiUrl, window.location.hostname, import.meta.env.DEV);
const apiConfig = {
  baseURL: useLocalProxy ? "/api/" : `${apiUrl.replace(/\/+$/, "")}/`,
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  withXSRFToken: true,
};

axios.defaults.baseURL = apiConfig.baseURL;
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = apiConfig.xsrfCookieName;
axios.defaults.xsrfHeaderName = apiConfig.xsrfHeaderName;
axios.defaults.withXSRFToken = true;

// Authentication and retried requests use a client without refresh interceptors.
export const api = axios.create(apiConfig);
export const axiosReq = axios.create(apiConfig);
export const axiosRes = axios.create(apiConfig);

let csrfToken;
let csrfPromise;

export const clearCsrfToken = () => {
  csrfToken = undefined;
};

const getCsrfToken = () => {
  if (csrfToken) return Promise.resolve(csrfToken);
  if (!csrfPromise) {
    csrfPromise = api.get("/csrf/").then(({ data }) => {
      if (!data.csrfToken) throw new Error("Could not initialize CSRF protection.");
      csrfToken = data.csrfToken;
      return csrfToken;
    }).finally(() => {
      csrfPromise = undefined;
    });
  }
  return csrfPromise;
};

for (const client of [api, axiosReq, axiosRes]) {
  client.interceptors.request.use(async (config) => {
    if (useLocalProxy) config.url = localApiRequestUrl(config.url, apiUrl);
    if (!["get", "head", "options"].includes((config.method || "get").toLowerCase())) {
      config.headers["X-CSRFToken"] = await getCsrfToken();
    }
    return config;
  });
}
