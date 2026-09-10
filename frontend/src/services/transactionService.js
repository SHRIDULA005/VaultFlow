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
    return axios.post(
        "/api/transactions",
        transaction
    );
};

export const approveTransaction = (id) => {
    return axios.put(
        `/api/transactions/${id}`,
        {
            status: "APPROVED"
        }
    );
};

export const deleteTransaction = (id) => {
    return axios.delete(
        `/api/transactions/${id}`
    );
};

const TransactionService = {
    getAllTransactions,
    getByLedger,
    createTransaction,
    approveTransaction,
    deleteTransaction
};

export default TransactionService;