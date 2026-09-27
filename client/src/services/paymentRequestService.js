import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/payment-request";

const paymentRequestService = {
    createPaymentRequest: async (courseId, partId) => {
        try {
            const response = await axiosInstance.post(
                `${BASE_URL}/create-request`,
                {
                    courseId,
                    partId
                },
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },

    getAllPaymentRequests: async (page = 1, limit = 5, status = "all", search = "") => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/fetch-all-requests`, {
                params: { page, limit, status, search },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw (error);
        }
    },


    approvePaymentRequest: async (requestId, userId, courseId, partId, payload) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/approve-payment-request/${requestId}/${userId}/${courseId}/${partId}`,
                payload,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },

    rejectPaymentRequest: async (requestId, payload) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/reject-payment-request/${requestId}`,
                payload,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },

    getUserPayments: async () => {
        try {
            const response = await axiosInstance.get(
                `${BASE_URL}/fetch-user-payments`,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },


    getPaymentDetails: async (requestId) => {
        try {
            const response = await axiosInstance.get(
                `${BASE_URL}/fetch-payment-details/${requestId}`,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw (error);
        }
    },

    updatePaymentRequest: async (id, data) => {
        try {
            const response = await axiosInstance.put(
                `${BASE_URL}/update-payment/${id}`,
                data,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    cancelPaymentRequest: async (id) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/cancel-payment/${id}`,
                {},
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    uncancelPaymentRequest: async (id) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/uncancel-payment/${id}`,
                {},
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

};

export default paymentRequestService;
