import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data
    }
    return response
  },
  (error) => {
    // Handle errors
    if (error.response.status === 401) {
      //store.dispatch(setUnAuthorized(true))
      throw error
    }
    throw error
  }
)
export default api

