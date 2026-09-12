import api from "./api";

export const getAccounts = async () => {
    const response = await api.get("/accounts");
    return response.data;
};

export const createAccount = async (accountData) => {
    const response = await api.post(
        "/accounts",
        accountData
    );

    return response.data;
};

export const updateAccount = async (id, accountData) => {
    const response = await api.put(
        `/accounts/${id}`,
        accountData
    );

    return response.data;
};

export const deleteAccount = async (id) => {
    const response = await api.delete(
        `/accounts/${id}`
    );

    return response.data;
};

const accountService = {
    getAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
};

export default accountService;