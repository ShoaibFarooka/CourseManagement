import { createSlice } from "@reduxjs/toolkit";

export const loaderSlice = createSlice({
    name: "loader",
    initialState: {
        counter: 0,
    },
    reducers: {
        ShowLoading(state) {
            state.counter += 1;
        },
        HideLoading(state) {
            state.counter = Math.max(state.counter - 1, 0);
        },
    },
});

export const { ShowLoading, HideLoading } = loaderSlice.actions;

export default loaderSlice.reducer;