import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/request";

const requestService = {
    createDeviceRequest: async (payload) => {
        try {
            const response = await axiosInstance.post(BASE_URL, payload, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network error, server not reachable");
            }
        }
    },

    getAllRequests: async () => {
        try {
            const response = await axiosInstance.get(BASE_URL, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network error, server not reachable");
            }
        }
    },

    approveDeviceRequest: async (requestId) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/${requestId}/approve`, {}, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network error, server not reachable");
            }
        }
    },

    rejectDeviceRequest: async (requestId) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/${requestId}/reject`, {}, { withCredentials: true });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network error, server not reachable");
            }
        }
    },

    overwriteDeviceRequest: async (requestId, targetDeviceId) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/${requestId}/overwrite`,
                { targetDeviceId },
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network error, server not reachable");
            }
        }
    },

    blockDeviceRequest: async (userId) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/${userId}/block`,
                {},
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network error, server not reachable");
            }
        }
    },

    unblockDeviceRequest: async (userId) => {
        try {
            const response = await axiosInstance.patch(
                `${BASE_URL}/${userId}/unblock`,
                {},
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network error, server not reachable");
            }
        }
    },


    removeUserDevice: async (userId, deviceId) => {
        try {
            const response = await axiosInstance.delete(
                `${BASE_URL}/${userId}/device/${deviceId}`,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network error, server not reachable");
            }
        }
    },


    getUserDevices: async (userId) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/${userId}/devices`, {
                withCredentials: true,
            });
            return response.data.devices;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network error, server not reachable");
            }
        }
    },

    deleteDeviceRequest: async (requestId) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/delete/${requestId}`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network error, server not reachable");
            }
        }
    },


};

export default requestService;
