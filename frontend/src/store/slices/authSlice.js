import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    user: null,
    token: null,
    role: null,
    userId: null,
    organizationId: null
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {

        loginSuccess: (state, action) => {
            const payload = action.payload;

            state.isAuthenticated = true;

            state.token = payload.token || null;
            state.role = payload.role || null;
            state.userId = payload.userId || null;
            state.organizationId =
                payload.organizationId || null;

            state.user = payload.user || {
                userId: payload.userId,
                role: payload.role,
                organizationId:
                    payload.organizationId
            };
        },

        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.role = null;
            state.userId = null;
            state.organizationId = null;
        }
    }
});

export const {
    loginSuccess,
    logout
} = authSlice.actions;

export default authSlice.reducer;