import axios from 'axios';
import { showErrorToast } from './toast';

const api = axios.create({
  baseURL: '/api/v1',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const response = await api.post('/auth/refresh');
        const { access_token } = response.data;

        localStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');

        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    if (!error.response) {
      showErrorToast(
        'Network error: Unable to connect to the server. Please check your internet connection.',
      );
      return Promise.reject(error);
    }

    if (error.response?.status && error.response.status !== 401) {
      const responseData = error.response.data as {
        message?: string;
        details?: string[];
        error?: string;
      };

      let errorMessage = responseData.message || 'An error occurred';

      if (error.response.status === 403) {
        errorMessage = "You don't have permission to perform this action";
      } else if (error.response.status === 404) {
        errorMessage = 'Resource not found';
      } else if (error.response.status === 500) {
        errorMessage =
          'Something went wrong on our end. Please try again later.';
      } else if (error.response.status === 400 && responseData.details) {
        errorMessage = responseData.details.join(', ');
      }

      const correlationId = error.response.headers['x-correlation-id'] as
        | string
        | undefined;

      if (correlationId) {
        errorMessage += ` (Ref: ${correlationId})`;
      }

      showErrorToast(errorMessage);
    }

    return Promise.reject(error);
  },
);

export { api };
export default api;
