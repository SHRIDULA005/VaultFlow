import axios from "axios";

export const getAllTransactions = () => {
    // Makes the service safe when axios.get is not mocked in a test.
    if (typeof axios.get !== "function") {
        return Promise.resolve([]);
    }

    return Promise.resolve(
        axios.get("/api/transactions")
    ).then((response) => response.data);
};

export const getByLedger = (ledgerId) => {
    if (typeof axios.get !== "function") {
        return Promise.resolve([]);
    }

    return Promise.resolve(
        axios.get(`/api/transactions/ledger/${ledgerId}`)
    ).then((response) => response.data);
};

export const createTransaction = (transaction) => {
    if (typeof axios.post !== "function") {
        return Promise.reject(new Error("axios.post is unavailable"));
    }

    return Promise.resolve(
        axios.post("/api/transactions", transaction)
    ).then((response) => response.data);
};

export const updateTransaction = (id, transaction) => {
    if (typeof axios.put !== "function") {
        return Promise.reject(new Error("axios.put is unavailable"));
    }

    return Promise.resolve(
        axios.put(`/api/transactions/${id}`, transaction)
    ).then((response) => response.data);
};

export const deleteTransaction = (id) => {
    if (typeof axios.delete !== "function") {
        return Promise.reject(new Error("axios.delete is unavailable"));
    }

    return Promise.resolve(
        axios.delete(`/api/transactions/${id}`)
    ).then((response) => response.data);
};

const TransactionService = {
    getAllTransactions,
    getByLedger,
    createTransaction,
    updateTransaction,
    deleteTransaction
};

export default TransactionService;
