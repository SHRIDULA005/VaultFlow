import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import ledgerService from "../../services/ledgerService";

// Fetch ledgers
export const fetchLedgers = createAsyncThunk(
  "ledgers/fetchLedgers",
  async (_, thunkAPI) => {
    try {
      return await ledgerService.getLedgers();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch ledgers"
      );
    }
  }
);

// Create ledger
export const createLedger = createAsyncThunk(
  "ledgers/createLedger",
  async (ledgerData, thunkAPI) => {
    try {
      return await ledgerService.createLedger(
        ledgerData
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create ledger"
      );
    }
  }
);

const initialState = {
  list: [],
  selectedLedgerId: null,
  status: "idle",
  error: null,
};

const ledgerSlice = createSlice({
  name: "ledgers",

  initialState,

  reducers: {
    setSelectedLedger: (state, action) => {
      state.selectedLedgerId = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch ledgers
      .addCase(fetchLedgers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(
        fetchLedgers.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.list = action.payload;
        }
      )

      .addCase(
        fetchLedgers.rejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        }
      )

      // Create ledger
      .addCase(createLedger.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(
        createLedger.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.list.push(action.payload);
        }
      )

      .addCase(
        createLedger.rejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        }
      );
  },
});

export const {
  setSelectedLedger,
} = ledgerSlice.actions;

export default ledgerSlice.reducer;