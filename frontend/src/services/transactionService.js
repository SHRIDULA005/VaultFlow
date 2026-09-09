import axios from "axios";

const TransactionService = {
    getAllTransactions: () => {
        return axios.get("/api/transactions")
            .then((response) => response.data);
    },

    getByLedger: (ledgerId) => {
        return axios.get(`/api/transactions/ledger/${ledgerId}`)
            .then((response) => response.data);
    },

    createTransaction: (transaction) => {
        return axios.post("/api/transactions", transaction)
            .then((response) => response.data);
    },

    updateTransaction: (id, transaction) => {
        return axios.put(`/api/transactions/${id}`, transaction)
            .then((response) => response.data);
    },

    deleteTransaction: (id) => {
        return axios.delete(`/api/transactions/${id}`)
            .then((response) => response.data);
    }
};

export default TransactionService;