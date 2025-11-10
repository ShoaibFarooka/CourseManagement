import { createSlice } from '@reduxjs/toolkit';

const progressSlice = createSlice({
    name: "progress",
    initialState: {
        result: null,
    },
    reducers: {
        setProgress: (state, action) => {
            state.result = action.payload;
        },
        clearProgress: (state) => {
            state.result = null;
        }
    }
});

export const { setProgress, clearProgress } = progressSlice.actions;
export default progressSlice.reducer;