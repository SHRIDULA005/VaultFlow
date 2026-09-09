import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import accountReducer from "./slices/accountSlice";
import ledgerReducer from "./slices/ledgerSlice";
import transactionReducer from "./slices/transactionSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountReducer,
    ledgers: ledgerReducer,
    transactions: transactionReducer,
  },
});

export default store;