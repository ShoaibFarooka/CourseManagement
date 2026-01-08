import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/request";

const deviceRequestService = {
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

    getAllRequests: async (page = 1, limit = 5, filter = "all") => {
        try {
            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", limit);
            params.append("filter", filter);

            const response = await axiosInstance.get(
                `${BASE_URL}?${params.toString()}`,
                { withCredentials: true }
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    },


    approveDeviceRequest: async (requestId) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/${requestId}/approve`, {}, { withCredentials: true });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    rejectDeviceRequest: async (requestId) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/${requestId}/reject`, {}, { withCredentials: true });
            return response.data;
        } catch (error) {
            throw error;
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
            throw error;
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
            throw error;
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
            throw error;
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
            throw error;
        }
    },


    getUserDevices: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/user/devices`, {
                withCredentials: true,
            });
            return { devices: response.data }
        } catch (error) {
            throw error;
        }
    },

    deleteDeviceRequest: async (requestId) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/delete/${requestId}`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },


    fetchUserDevicesById: async (userId) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/${userId}/devices`, {
                withCredentials: true,
            });
            return { devices: response.data }
        } catch (error) {
            throw error;
        }
    },
};

export default deviceRequestService;
