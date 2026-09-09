import api from "./api";

export const getLedgers = async () => {
  const response = await api.get("/ledgers");
  return response.data;
};

export const createLedger = async (ledgerData) => {
  const response = await api.post(
    "/ledgers",
    ledgerData
  );

  return response.data;
};

const ledgerService = {
  getLedgers,
  createLedger,
};

export default ledgerService;