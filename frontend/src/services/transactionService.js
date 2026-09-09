import api from "./api";

export const getAllTransactions = async () => {
  const response = await api.get("/transactions");
  return response.data;
};

export const getByLedger = async (ledgerId) => {
  const response = await api.get(
    `/transactions/ledger/${ledgerId}`
  );

  return response.data;
};

export const createTransaction = async (transactionData) => {
  const response = await api.post(
    "/transactions",
    transactionData
  );

  return response.data;
};

export const reverseTransaction = async (transactionId) => {
  const response = await api.post(
    `/transactions/${transactionId}/reverse`
  );

  return response.data;
};

const transactionService = {
  getAllTransactions,
  getByLedger,
  createTransaction,
  reverseTransaction,
};

export default transactionService;