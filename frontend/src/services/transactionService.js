import axios from "axios";

export const getAllTransactions = () => {
    return axios
        .get("/api/transactions")
        .then((response) => response.data);
};

export const getByLedger = (ledgerId) => {
    return axios
        .get(`/api/transactions/ledger/${ledgerId}`)
        .then((response) => response.data);
};

export const createTransaction = (transaction) => {
    return axios
        .post("/api/transactions", transaction)
        .then((response) => response.data);
};

export const updateTransaction = (id, transaction) => {
    return axios
        .put(`/api/transactions/${id}`, transaction)
        .then((response) => response.data);
};

export const deleteTransaction = (id) => {
    return axios
        .delete(`/api/transactions/${id}`)
        .then((response) => response.data);
};

const TransactionService = {
    getAllTransactions,
    getByLedger,
    createTransaction,
    updateTransaction,
    deleteTransaction
};

export default TransactionService;