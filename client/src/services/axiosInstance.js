import axios from 'axios';
import Cookies from 'js-cookie';
import userService from '../services/userServices';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        if (!config.skipAuthRefresh) {
            const token = Cookies.get('truck-jwt-token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
    refreshSubscribers.push(callback);
};

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const { config, response: { status } } = error;
        const originalRequest = config;
        if (status === 401 && !originalRequest._retry && !originalRequest.skipAuthRefresh) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    console.log('Refreshing token...');
                    const response = await userService.refreshToken();
                    const { token } = response;
                    Cookies.set('truck-jwt-token', token);
                    console.log('Refresh token done!');
                    onRefreshed(token);
                    return axiosInstance(originalRequest);
                } catch (err) {
                    console.log('Error in refreshing token: ', err);
                    Cookies.remove('truck-jwt-token');
                    const redirectTo = '/login';
                    window.location.href = redirectTo;
                    return Promise.reject(err);
                }
                finally {
                    isRefreshing = false;
                }
            }
            console.log('Refresh token already in progress, falling back to queue');
            const retryOriginalRequest = new Promise((resolve) => {
                const callback = (token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    resolve(axiosInstance(originalRequest));
                }
                addRefreshSubscriber(callback);
            });

            return retryOriginalRequest;
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;