import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/payment";

const paymentService = {
    createPayment: async (payload) => {
        try {
            const response = await axiosInstance.post(BASE_URL, payload, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) throw error.response.data;
            else throw new Error("Network error, server not reachable");
        }
    },

    getAllPayments: async () => {
        try {
            const response = await axiosInstance.get(BASE_URL, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) throw error.response.data;
            else throw new Error("Network error, server not reachable");
        }
    },

    getPaymentById: async (paymentId) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/${paymentId}`, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) throw error.response.data;
            else throw new Error("Network error, server not reachable");
        }
    },

    getPaymentsByUser: async (userId) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/user/${userId}`, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) throw error.response.data;
            else throw new Error("Network error, server not reachable");
        }
    },

    updatePayment: async (paymentId, payload) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/${paymentId}`, payload, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) throw error.response.data;
            else throw new Error("Network error, server not reachable");
        }
    },

    deletePayment: async (paymentId) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/${paymentId}`, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) throw error.response.data;
            else throw new Error("Network error, server not reachable");
        }
    },
};

export default paymentService;
