import axios from "axios";

export const Api = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true, // send cookies back to browser and maintain a session
});
