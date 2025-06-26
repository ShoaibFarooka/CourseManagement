import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/place";

const placeService = {
    getAllPlaces: async () => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/get-all-places`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    addPlace: async (payload) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/add-place`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updatePlace: async (placeId, payload) => {
        try {
            const response = await axiosInstance.put(`${BASE_URL}/update-place/${placeId}`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    deletePlace: async (placeId) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/delete-place/${placeId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default placeService;
