import axiosInstance from "./axiosInstance";

const BASE_URL = "/api/progress";

const progressService = {

    recordAnswerBatch: async (answers, language) => {
        const response = await axiosInstance.post(`${BASE_URL}/record-answer`, {
            answers,
            language
        });

        return response.data;
    },

    getUnitProgress: async ({
        courseId,
        partId,
        publisherId,
        unitId,
        selectedSubunits,
        language
    }) => {
        try {
            const response = await axiosInstance.get(
                `${BASE_URL}/single-unit-progress`,
                {
                    params: {
                        courseId,
                        partId,
                        publisherId,
                        unitId,
                        selectedSubunits,
                        language
                    },
                    paramsSerializer: (params) => {
                        const searchParams = new URLSearchParams();
                        Object.entries(params).forEach(([key, value]) => {
                            if (Array.isArray(value)) {
                                value.forEach(v => searchParams.append(key, v));
                            } else if (value !== undefined && value !== null) {
                                searchParams.append(key, value);
                            }
                        });
                        return searchParams.toString();
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getAllUnitsProgress: async ({
        courseId,
        partId,
        publisherId,
        language
    }) => {

        try {
            const response = await axiosInstance.get(
                `${BASE_URL}/unit-progress`,
                {
                    params: {
                        courseId,
                        partId,
                        publisherId,
                        language
                    },
                }
            );

            return response.data;

        } catch (error) {
            throw error;
        }
    },

    getSelectedUnitsProgress: async ({
        courseId,
        partId,
        publisherId,
        selectedUnits,
        selectedSubunits,
        language
    }) => {

        try {

            const response = await axiosInstance.post(
                `${BASE_URL}/selected-units-progress`,
                {
                    courseId,
                    partId,
                    publisherId,
                    selectedUnits,
                    selectedSubunits,
                    language
                }
            );

            return response.data;

        } catch (error) {
            throw error;
        }
    },

    getAllSubunitsProgress: async ({
        courseId,
        partId,
        publisherId,
        unitId,
        language
    }) => {

        try {
            const response = await axiosInstance.get(
                `${BASE_URL}/subunit-progress`,
                {
                    params: {
                        courseId,
                        partId,
                        publisherId,
                        unitId,
                        language
                    },
                }
            );

            return response.data;

        } catch (error) {
            throw error;
        }
    },
    getContinueSession: async ({ courseId, partId, publisherId, selectedUnits, selectedSubunits, language, questionLimit }) => {
        const response = await axiosInstance.get(`${BASE_URL}/session/continue`, {
            params: {
                courseId, partId, publisherId,
                selectedUnits: JSON.stringify(selectedUnits || []),
                selectedSubunits: JSON.stringify(selectedSubunits || {}),
                language,
                questionLimit: questionLimit || undefined,
            },
        });
        return response.data;
    },

    getStartOverSession: async ({ courseId, partId, publisherId, selectedUnits, selectedSubunits, language, questionLimit }) => {
        const response = await axiosInstance.post(`${BASE_URL}/session/start-over`, {
            courseId, partId, publisherId,
            selectedUnits, selectedSubunits, language,
            questionLimit: questionLimit || undefined,
        });
        return response.data;
    },

    getLimitedSession: async ({
        courseId,
        partId,
        publisherId,
        selectedUnits,
        selectedSubunits,
        language,
        questionLimit
    }) => {
        const response = await axiosInstance.post(
            `${BASE_URL}/session/limited`,
            {
                courseId,
                partId,
                publisherId,
                selectedUnits,
                selectedSubunits,
                language,
                questionLimit: questionLimit || undefined,
            }
        );

        return response.data;
    },

    getWrongOnlySession: async ({ courseId, partId, publisherId, selectedUnits, selectedSubunits, language, questionLimit }) => {
        const response = await axiosInstance.get(`${BASE_URL}/session/wrong-only`, {
            params: {
                courseId, partId, publisherId,
                selectedUnits: JSON.stringify(selectedUnits || []),
                selectedSubunits: JSON.stringify(selectedSubunits || {}),
                language,
                questionLimit: questionLimit || undefined,
            },
        });
        return response.data;
    },


    getUnitPerformance: async ({
        courseId,
        partId,
        publisherId,
        unitId,
        language
    }) => {

        const response = await axiosInstance.get(
            `${BASE_URL}/unit-performance`,
            {
                params: {
                    courseId,
                    partId,
                    publisherId,
                    unitId,
                    language
                },
            }
        );

        return response.data;
    },
};

export default progressService;