import axios from "axios";

axios.defaults.baseURL =
  "https://ci-pp5-backendapi-sb-1f7f0e4a782e.herokuapp.com/";
axios.defaults.headers.post["Content-Type"] = "multipart/form-data";
axios.defaults.withCredentials = true;

export const axiosReq = axios.create();
export const axiosRes = axios.create();
