import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import accountService from "../../services/accountService";

// Fetch accounts
export const fetchAccounts = createAsyncThunk(
  "accounts/fetchAccounts",
  async (_, thunkAPI) => {
    try {
      return await accountService.getAccounts();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch accounts"
      );
    }
  }
);

// Create account
export const createAccount = createAsyncThunk(
  "accounts/createAccount",
  async (accountData, thunkAPI) => {
    try {
      return await accountService.createAccount(
        accountData
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create account"
      );
    }
  }
);

const initialState = {
  list: [],
  status: "idle",
  error: null,
};

const accountSlice = createSlice({
  name: "accounts",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      // Fetch accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(
        fetchAccounts.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.list = action.payload;
        }
      )

      .addCase(
        fetchAccounts.rejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        }
      )

      // Create account
      .addCase(createAccount.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(
        createAccount.fulfilled,
        (state, action) => {
          state.status = "succeeded";

          state.list.push(action.payload);
        }
      )

      .addCase(
        createAccount.rejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        }
      );
  },
});

export default accountSlice.reducer;