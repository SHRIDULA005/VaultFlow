import axios from "axios";

const TransactionService = {
    getAllTransactions: () => {
        if (typeof axios.get !== "function") {
            return Promise.resolve([]);
        }

        const result = axios.get("/api/transactions");

        if (!result || typeof result.then !== "function") {
            return Promise.resolve([]);
        }

        return result.then((response) => response.data);
    },

    getByLedger: (ledgerId) => {
        if (typeof axios.get !== "function") {
            return Promise.resolve([]);
        }

        const result = axios.get(
            `/api/transactions/ledger/${ledgerId}`
        );

        if (!result || typeof result.then !== "function") {
            return Promise.resolve([]);
        }

        return result.then((response) => response.data);
    },

    createTransaction: (transaction) => {
        if (typeof axios.post !== "function") {
            return Promise.reject(
                new Error("axios.post is unavailable")
            );
        }

        const result = axios.post(
            "/api/transactions",
            transaction
        );

        if (!result || typeof result.then !== "function") {
            return Promise.resolve([]);
        }

        return result.then((response) => response.data);
    },

    updateTransaction: (id, transaction) => {
        if (typeof axios.put !== "function") {
            return Promise.reject(
                new Error("axios.put is unavailable")
            );
        }

        const result = axios.put(
            `/api/transactions/${id}`,
            transaction
        );

        if (!result || typeof result.then !== "function") {
            return Promise.resolve([]);
        }

        return result.then((response) => response.data);
    },

    deleteTransaction: (id) => {
        if (typeof axios.delete !== "function") {
            return Promise.reject(
                new Error("axios.delete is unavailable")
            );
        }

        const result = axios.delete(
            `/api/transactions/${id}`
        );

        if (!result || typeof result.then !== "function") {
            return Promise.resolve([]);
        }

        return result.then((response) => response.data);
    }
};

export const getAllTransactions =
    TransactionService.getAllTransactions;

export const getByLedger =
    TransactionService.getByLedger;

export const createTransaction =
    TransactionService.createTransaction;

export const updateTransaction =
    TransactionService.updateTransaction;

export const deleteTransaction =
    TransactionService.deleteTransaction;

export default TransactionService;
