import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  userId: storedUser
    ? JSON.parse(storedUser).userId
    : null,
  role: storedUser
    ? JSON.parse(storedUser).role
    : null,
  organizationId: storedUser
    ? JSON.parse(storedUser).organizationId
    : null,
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    loginSuccess: (state, action) => {
      const payload = action.payload;

      state.user = payload;
      state.userId = payload.userId;
      state.role = payload.role;
      state.organizationId = payload.organizationId;
      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.user = null;
      state.userId = null;
      state.role = null;
      state.organizationId = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const {
  loginSuccess,
  logout,
} = authSlice.actions;

export default authSlice.reducer;