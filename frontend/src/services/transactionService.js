import axios from "axios";

export const getAllTransactions = () => {
    const request = axios.get("/api/transactions");

    if (!request || typeof request.then !== "function") {
        return Promise.resolve([]);
    }

    return request.then((response) => response.data);
};

export const getByLedger = (ledgerId) => {
    const request = axios.get(
        `/api/transactions/ledger/${ledgerId}`
    );

    if (!request || typeof request.then !== "function") {
        return Promise.resolve([]);
    }

    return request.then((response) => response.data);
};

export const createTransaction = (transaction) => {
    const request = axios.post(
        "/api/transactions",
        transaction
    );

    if (!request || typeof request.then !== "function") {
        return Promise.resolve([]);
    }

    return request.then((response) => response.data);
};

export const updateTransaction = (id, transaction) => {
    const request = axios.put(
        `/api/transactions/${id}`,
        transaction
    );

    if (!request || typeof request.then !== "function") {
        return Promise.resolve([]);
    }

    return request.then((response) => response.data);
};

export const deleteTransaction = (id) => {
    const request = axios.delete(
        `/api/transactions/${id}`
    );

    if (!request || typeof request.then !== "function") {
        return Promise.resolve([]);
    }

    return request.then((response) => response.data);
};

const TransactionService = {
    getAllTransactions,
    getByLedger,
    createTransaction,
    updateTransaction,
    deleteTransaction
};

export default TransactionService;
