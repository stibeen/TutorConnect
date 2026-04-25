// src/utils/api.js
import axios from 'axios';
import toast from "react-hot-toast";
// 1. Create a customized Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend API base URL
  timeout: 10000, // Request timeout (10 seconds)
  headers: {
    'Content-Type': 'application/json', // Default content type
  },
});

// 2. Add request interceptor (for auth tokens)
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (or your auth context)
    const token = localStorage.getItem('token'); // Or from cookies/context
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Add response interceptor (for error handling)
api.interceptors.response.use(
  (response) => {
    // Successful response - just return the data
    return response.data;
  },
  (error) => {
    // Handle errors globally
    
    // Server responded with error status (4xx, 5xx)
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        message: error.response.data?.message || 'Unknown error',
      });
      
      // Specific handling for common status codes
      switch (error.response.status) {
        case 401: // Unauthorized
          window.location.href = '/login'; // Redirect to login
          break;
        case 403: // Forbidden
          toast.error('You don\'t have permission');
          break;
        // default:
        //   toast.error(error.response.data?.message || 'Something went wrong');
      }
    } 
    // Request was made but no response received
    else if (error.request) {
      console.error('Network Error:', error.request);
      toast.error('Network error - please check your connection');
    } 
    // Other errors
    else {
      console.error('Request Error:', error.message);
      toast.error('Request failed - please try again');
    }
    
    return Promise.reject(error);
  }
);

// 4. Export the configured instance
export default api;