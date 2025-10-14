import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';


const refreshclient = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true
});


// Request interceptor for refresh token: Adding the access token to the Authorization header
refreshclient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken'); 
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Create a custom Axios instance
const apiClient = axios.create({
  baseURL: SERVER_URL, //backend URL
  withCredentials: true //  allows sending and receiving cookies
});

// This variable will be used to hold the refresh token promise to prevent multiple refresh calls
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

// Request interceptor: Adding the access token to the Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken'); // Or from your React context/state
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    console.log('api in line 42');
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 Unauthorized errors and trigger a token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Check for 401 status and prevent infinite loops on the refresh endpoint
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If a refresh is already in progress, wait for it to complete
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((accessToken) => {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {

        const response = await refreshclient.post('/refresh_token');
        const {data} = response;
        const newAccessToken = data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        isRefreshing = false;
        onRefreshed(newAccessToken);
        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
export default apiClient;
