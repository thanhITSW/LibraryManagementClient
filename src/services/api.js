import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_SERVER_URL || "http://localhost:9000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

const getAccessToken = () => localStorage.getItem("token");
const getRefreshToken = () => localStorage.getItem("refresh_token");

api.interceptors.request.use(
    (config) => {
        if (config.requiresAuth) {
            const token = getAccessToken();
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest.requiresAuth && error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers["Authorization"] = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }

                const refreshResponse = await axios.post(
                    `${API_BASE_URL}/common/auth/refresh`,
                    { token: refreshToken },
                    { headers: { "Content-Type": "application/json" } }
                );

                const newAccessToken = refreshResponse.data.access_token;
                const newRefreshToken = refreshResponse.data.refresh_token;

                localStorage.setItem("token", newAccessToken);
                localStorage.setItem("refresh_token", newRefreshToken);

                api.defaults.headers["Authorization"] = `Bearer ${newAccessToken}`;
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;