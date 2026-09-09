import api from "./api";

const transactionService = {
  getAllTransactions: async () => {
    const response = await api.get("/transactions");
    return response.data;
  },

  getByLedger: async (ledgerId) => {
    const response = await api.get(
      `/transactions/ledger/${ledgerId}`
    );

    return response.data;
  },
};

export default transactionService;