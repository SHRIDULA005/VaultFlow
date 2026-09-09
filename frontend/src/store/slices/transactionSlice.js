import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import transactionService from "../../services/transactionService";

// Fetch all transactions
export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions",
  async (_, thunkAPI) => {
    try {
      return await transactionService.getAllTransactions();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch transactions"
      );
    }
  }
);

// Fetch transactions by ledger
export const fetchTransactionsByLedger =
  createAsyncThunk(
    "transactions/fetchTransactionsByLedger",
    async (ledgerId, thunkAPI) => {
      try {
        return await transactionService.getByLedger(
          ledgerId
        );
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch ledger transactions"
        );
      }
    }
  );

// Create transaction
export const createTransaction = createAsyncThunk(
  "transactions/createTransaction",
  async (transactionData, thunkAPI) => {
    try {
      const response = await transactionService.createTransaction(
        transactionData
      );

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create transaction"
      );
    }
  }
);

// Reverse transaction
export const reverseTransaction = createAsyncThunk(
  "transactions/reverseTransaction",
  async (transactionId, thunkAPI) => {
    try {
      const response =
        await transactionService.reverseTransaction(
          transactionId
        );

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to reverse transaction"
      );
    }
  }
);

const initialState = {
  list: [],
  status: "idle",
  error: null,
};

const transactionSlice = createSlice({
  name: "transactions",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      // Fetch
      .addCase(
        fetchTransactions.pending,
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )

      .addCase(
        fetchTransactions.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.list = action.payload;
        }
      )

      .addCase(
        fetchTransactions.rejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        }
      )

      // Fetch by ledger
      .addCase(
        fetchTransactionsByLedger.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.list = action.payload;
        }
      )

      // Create
      .addCase(
        createTransaction.fulfilled,
        (state, action) => {
          state.list.push(action.payload);
        }
      )

      // Reverse
      .addCase(
        reverseTransaction.fulfilled,
        (state, action) => {
          const index = state.list.findIndex(
            (transaction) =>
              transaction.id === action.payload.id
          );

          if (index !== -1) {
            state.list[index] = action.payload;
          }
        }
      );
  },
});

export default transactionSlice.reducer;