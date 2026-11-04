import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error(
    "VITE_API_URL is missing. Check your environment configuration.",
  );
}

const apiConfig = {
  baseURL: `${apiUrl.replace(/\/+$/, "")}/`,
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

export const axiosReq = axios.create(apiConfig);
export const axiosRes = axios.create(apiConfig);
