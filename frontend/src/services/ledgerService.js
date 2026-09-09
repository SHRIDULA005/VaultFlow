import api from "./api";

const ledgerService = {
  getLedgers: async () => {
    const response = await api.get("/ledgers");
    return response.data;
  },

  createLedger: async (ledgerData) => {
    const response = await api.post(
      "/ledgers",
      ledgerData
    );

    return response.data;
  },
};

export default ledgerService;