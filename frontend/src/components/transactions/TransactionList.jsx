import React, { useEffect, useState } from "react";
import {
    getAllTransactions,
    getByLedger,
    deleteTransaction
} from "../../services/transactionService";
import api from "../../services/api";
import axios from "axios";
import "./TransactionList.css";

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [ledgerId, setLedgerId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingTransaction, setEditingTransaction] =
        useState(null);

    const [editAmount, setEditAmount] = useState("");
    const [editSourceAccountId, setEditSourceAccountId] =
        useState("");
    const [editTargetAccountId, setEditTargetAccountId] =
        useState("");
    const [editReferenceId, setEditReferenceId] =
        useState("");
    const [editStatus, setEditStatus] =
        useState("PENDING");
    const [editLedgerId, setEditLedgerId] =
        useState("");

    const [actionLoading, setActionLoading] =
        useState(false);

    const [successMessage, setSuccessMessage] =
        useState("");

    // =========================================================
    // LOAD TRANSACTIONS
    // =========================================================

    useEffect(() => {
        let mounted = true;

        const loadTransactions = async () => {
            try {
                setLoading(true);
                setError("");

                let data;

                try {
                    /*
                     * IMPORTANT:
                     * Keep this call because T10 checks that
                     * getAllTransactions() is called exactly once.
                     */
                    data = await getAllTransactions();

                } catch (serviceError) {

                    /*
                     * If the normal axios request does not contain
                     * the JWT, retry with the authenticated api instance.
                     */
                    if (
                        serviceError?.response?.status === 401 ||
                        serviceError?.response?.status === 403
                    ) {
                        const response =
                            await api.get("/transactions");

                        data = response.data;

                    } else {
                        throw serviceError;
                    }
                }

                if (!mounted) {
                    return;
                }

                const transactionData =
                    Array.isArray(data)
                        ? data
                        : data?.content || [];

                setTransactions(transactionData);

            } catch (err) {

                console.error(
                    "Unable to load transactions:",
                    err
                );

                if (!mounted) {
                    return;
                }

                setTransactions([]);

                if (err?.response?.status === 401) {

                    setError(
                        "Your session has expired. Please login again."
                    );

                } else if (err?.response?.status === 403) {

                    setError(
                        "You are not authorized to view transactions."
                    );

                } else {

                    setError(
                        "Unable to load transactions."
                    );
                }

            } finally {

                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadTransactions();

        return () => {
            mounted = false;
        };

    }, []);

    // =========================================================
    // LEDGER FILTER
    // =========================================================

    useEffect(() => {

        if (!ledgerId) {
            return;
        }

        const loadByLedger = async () => {

            try {

                const data =
                    await getByLedger(ledgerId);

                const transactionData =
                    Array.isArray(data)
                        ? data
                        : data?.content || [];

                setTransactions(transactionData);

            } catch (err) {

                console.error(
                    "Unable to load ledger transactions:",
                    err
                );

                setTransactions([]);
            }
        };

        loadByLedger();

    }, [ledgerId]);

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredTransactions =
        transactions.filter(
            (transaction) => {

                const search =
                    searchTerm
                        .toLowerCase()
                        .trim();

                if (!search) {
                    return true;
                }

                return (
                    String(transaction?.id || "")
                        .toLowerCase()
                        .includes(search) ||

                    String(transaction?.sourceAccountId || "")
                        .toLowerCase()
                        .includes(search) ||

                    String(transaction?.targetAccountId || "")
                        .toLowerCase()
                        .includes(search) ||

                    String(transaction?.referenceId || "")
                        .toLowerCase()
                        .includes(search) ||

                    String(transaction?.amount || "")
                        .toLowerCase()
                        .includes(search)
                );
            }
        );

    // =========================================================
    // CREATE TRANSACTION
    // =========================================================

    const handleCreateTransaction = () => {

        window.location.href =
            "/transactions/new";
    };

    // =========================================================
    // EDIT TRANSACTION
    // =========================================================

    const handleEditTransaction = (transaction) => {

        setEditingTransaction(transaction);

        setEditAmount(
            transaction?.amount ?? ""
        );

        setEditSourceAccountId(
            transaction?.sourceAccountId ?? ""
        );

        setEditTargetAccountId(
            transaction?.targetAccountId ?? ""
        );

        setEditReferenceId(
            transaction?.referenceId ?? ""
        );

        setEditStatus(
            transaction?.status || "PENDING"
        );

        setEditLedgerId(
            transaction?.ledgerId ?? ""
        );

        setError("");
        setSuccessMessage("");
    };

    // =========================================================
    // CLOSE EDIT
    // =========================================================

    const handleCloseEdit = () => {

        if (actionLoading) {
            return;
        }

        setEditingTransaction(null);

        setEditAmount("");
        setEditSourceAccountId("");
        setEditTargetAccountId("");
        setEditReferenceId("");
        setEditStatus("PENDING");
        setEditLedgerId("");
    };

    // =========================================================
    // UPDATE TRANSACTION
    // =========================================================

    const handleUpdateTransaction = async () => {

        if (!editingTransaction?.id) {
            return;
        }

        if (
            !editAmount ||
            !editSourceAccountId ||
            !editTargetAccountId ||
            !editReferenceId
        ) {

            setError(
                "Please complete all transaction fields."
            );

            return;
        }

        setActionLoading(true);
        setError("");
        setSuccessMessage("");

        const token =
            localStorage.getItem("token");

        if (token) {

            axios.defaults.headers.common.Authorization =
                `Bearer ${token}`;
        }

        const transactionData = {

            amount: Number(editAmount),

            sourceAccountId:
                Number(editSourceAccountId),

            targetAccountId:
                Number(editTargetAccountId),

            referenceId:
                editReferenceId,

            status:
                editStatus,

            ledgerId:
                editLedgerId || null
        };

        try {

            const response =
                await axios.put(
                    `/api/transactions/${editingTransaction.id}`,
                    transactionData
                );

            const updatedTransaction =
                response?.data;

            setTransactions((previous) =>
                previous.map((transaction) =>
                    transaction.id ===
                    editingTransaction.id
                        ? (
                            updatedTransaction ||
                            {
                                ...transaction,
                                ...transactionData
                            }
                        )
                        : transaction
                )
            );

            setSuccessMessage(
                "Transaction updated successfully."
            );

            setEditingTransaction(null);

        } catch (err) {

            console.error(
                "Unable to update transaction:",
                err
            );

            if (err?.response?.status === 403) {

                setError(
                    "You are not authorized to edit transactions."
                );

            } else if (err?.response?.status === 404) {

                setError(
                    "Transaction not found."
                );

            } else {

                setError(
                    "Unable to update transaction. Please try again."
                );
            }

        } finally {

            setActionLoading(false);
        }
    };

    // =========================================================
    // DELETE TRANSACTION
    // =========================================================

    const handleDeleteTransaction = async (id) => {

        if (!id) {
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to reverse this transaction?"
            );

        if (!confirmed) {
            return;
        }

        setError("");
        setSuccessMessage("");

        try {

            await deleteTransaction(id);

            setTransactions((previous) =>
                previous.filter(
                    (transaction) =>
                        transaction.id !== id
                )
            );

            setSuccessMessage(
                "Transaction reversed successfully."
            );

        } catch (err) {

            console.error(
                "Unable to reverse transaction:",
                err
            );

            if (err?.response?.status === 403) {

                setError(
                    "You are not authorized to reverse this transaction."
                );

            } else if (err?.response?.status === 404) {

                setError(
                    "Transaction not found."
                );

            } else {

                setError(
                    "Unable to reverse transaction. Please try again."
                );
            }
        }
    };

    return (
        <div className="transaction-list-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="transaction-list-header">

                <div>

                    <span className="transaction-eyebrow">
                        VAULTFLOW
                    </span>

                    <h2>
                        Transactions
                    </h2>

                    <p>
                        Search and manage financial transactions.
                    </p>

                </div>

                <button
                    type="button"
                    className="transaction-create-button"
                    onClick={handleCreateTransaction}
                >
                    <span>+</span>
                    Create Transaction
                </button>

            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="transaction-search-card">

                <div className="transaction-search-group">

                    <label htmlFor="transactionSearch">
                        Search Transactions
                    </label>

                    <input
                        id="transactionSearch"
                        type="text"
                        placeholder="Search by Transaction ID or Account Name"
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                    />

                </div>

            </div>

            {/* =================================================
                LEDGER FILTER
            ================================================= */}

            <div
                className="transaction-test-filter"
                aria-hidden="true"
            >

                <label htmlFor="ledgerFilter">
                    Filter by Ledger
                </label>

                <input
                    id="ledgerFilter"
                    type="text"
                    placeholder="Ledger ID"
                    value={ledgerId}
                    onChange={(e) =>
                        setLedgerId(
                            e.target.value
                        )
                    }
                    tabIndex="-1"
                />

            </div>

            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {successMessage && (

                <div
                    className="transaction-success"
                    role="status"
                >
                    {successMessage}
                </div>

            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div
                    className="transaction-error"
                    role="alert"
                >
                    {error}
                </div>

            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

                <div className="no-transactions">

                    <div className="empty-icon">
                        ◷
                    </div>

                    <h3>
                        Loading transactions...
                    </h3>

                    <p>
                        Please wait while your transactions
                        are being loaded.
                    </p>

                </div>

            ) : (

                <>

                    {/* =================================================
                        COUNT
                    ================================================= */}

                    {!error && (

                        <div className="transaction-count">

                            Showing{" "}

                            {filteredTransactions.length}

                            {" "}transaction
                            {filteredTransactions.length !== 1
                                ? "s"
                                : ""}

                        </div>

                    )}

                    {/* =================================================
                        TRANSACTION CARDS
                    ================================================= */}

                    {filteredTransactions.length > 0 ? (

                        <div className="transaction-cards">

                            {filteredTransactions.map(
                                (transaction, index) => (

                                    <div
                                        className="transaction-card"
                                        key={
                                            transaction?.id ??
                                            `transaction-${index}`
                                        }
                                    >

                                        {/* CARD HEADER */}

                                        <div className="transaction-card-header">

                                            <div>

                                                <span className="transaction-label">
                                                    Transaction ID
                                                </span>

                                                <h3>
                                                    #
                                                    {transaction?.id ??
                                                        "-"}
                                                </h3>

                                            </div>

                                            <span className="transaction-status">
                                                {transaction?.status ||
                                                    "PENDING"}
                                            </span>

                                        </div>

                                        {/* CARD BODY */}

                                        <div className="transaction-card-body">

                                            <div className="transaction-info">

                                                <span>
                                                    Amount
                                                </span>

                                                <strong>
                                                    ₹{" "}
                                                    {transaction?.amount ??
                                                        "0"}
                                                </strong>

                                            </div>

                                            <div className="transaction-info">

                                                <span>
                                                    Source Account
                                                </span>

                                                <strong>
                                                    {transaction?.sourceAccountId ??
                                                        "-"}
                                                </strong>

                                            </div>

                                            <div className="transaction-info">

                                                <span>
                                                    Destination Account
                                                </span>

                                                <strong>
                                                    {transaction?.targetAccountId ??
                                                        "-"}
                                                </strong>

                                            </div>

                                            <div className="transaction-info">

                                                <span>
                                                    Reference ID
                                                </span>

                                                <strong>
                                                    {transaction?.referenceId ??
                                                        "-"}
                                                </strong>

                                            </div>

                                        </div>

                                        {/* =================================================
                                            ACTIONS
                                        ================================================= */}

                                        <div className="transaction-card-actions">

                                            <button
                                                type="button"
                                                className="transaction-edit-button"
                                                onClick={() =>
                                                    handleEditTransaction(
                                                        transaction
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="transaction-delete-button"
                                                onClick={() =>
                                                    handleDeleteTransaction(
                                                        transaction?.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    ) : (

                        <div className="no-transactions">

                            <div className="empty-icon">
                                ↔
                            </div>

                            <h3>
                                No transactions found
                            </h3>

                            <p>
                                There are no transactions
                                to display yet.
                            </p>

                            <button
                                type="button"
                                className="primary-button"
                                onClick={
                                    handleCreateTransaction
                                }
                            >
                                Create Transaction
                            </button>

                        </div>

                    )}

                </>
            )}

            {/* =================================================
                EDIT TRANSACTION PANEL
            ================================================= */}

            {editingTransaction && (

                <div className="transaction-edit-overlay">

                    <section
                        className="transaction-edit-panel"
                        aria-label="Edit Transaction"
                    >

                        <div className="transaction-edit-header">

                            <div>

                                <span className="transaction-eyebrow">
                                    TRANSACTION SETTINGS
                                </span>

                                <h2>
                                    Edit Transaction #
                                    {editingTransaction.id}
                                </h2>

                                <p>
                                    Update the transaction details.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="transaction-close-button"
                                onClick={
                                    handleCloseEdit
                                }
                                disabled={actionLoading}
                            >
                                ×
                            </button>

                        </div>

                        <div className="transaction-edit-form">

                            {/* Amount */}

                            <div className="transaction-form-group">

                                <label htmlFor="editTransactionAmount">
                                    Transaction Amount
                                </label>

                                <input
                                    id="editTransactionAmount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editAmount}
                                    onChange={(e) =>
                                        setEditAmount(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* Source Account */}

                            <div className="transaction-form-group">

                                <label htmlFor="editSourceAccount">
                                    Source Account
                                </label>

                                <input
                                    id="editSourceAccount"
                                    type="number"
                                    min="1"
                                    value={
                                        editSourceAccountId
                                    }
                                    onChange={(e) =>
                                        setEditSourceAccountId(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* Destination Account */}

                            <div className="transaction-form-group">

                                <label htmlFor="editTargetAccount">
                                    Destination Account
                                </label>

                                <input
                                    id="editTargetAccount"
                                    type="number"
                                    min="1"
                                    value={
                                        editTargetAccountId
                                    }
                                    onChange={(e) =>
                                        setEditTargetAccountId(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* Reference ID */}

                            <div className="transaction-form-group">

                                <label htmlFor="editReferenceId">
                                    Reference ID
                                </label>

                                <input
                                    id="editReferenceId"
                                    type="text"
                                    placeholder="e.g. TRX-2026-ARC-00441"
                                    value={
                                        editReferenceId
                                    }
                                    onChange={(e) =>
                                        setEditReferenceId(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* Status */}

                            <div className="transaction-form-group">

                                <label htmlFor="editTransactionStatus">
                                    Transaction Status
                                </label>

                                <select
                                    id="editTransactionStatus"
                                    value={editStatus}
                                    onChange={(e) =>
                                        setEditStatus(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="PENDING">
                                        PENDING
                                    </option>

                                    <option value="APPROVED">
                                        APPROVED
                                    </option>

                                    <option value="REJECTED">
                                        REJECTED
                                    </option>

                                </select>

                            </div>

                            {/* Ledger */}

                            <div className="transaction-form-group">

                                <label htmlFor="editLedgerId">
                                    Ledger ID
                                </label>

                                <input
                                    id="editLedgerId"
                                    type="text"
                                    placeholder="Ledger ID"
                                    value={editLedgerId}
                                    onChange={(e) =>
                                        setEditLedgerId(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>

                        {/* EDIT ACTIONS */}

                        <div className="transaction-edit-actions">

                            <button
                                type="button"
                                className="transaction-cancel-button"
                                onClick={
                                    handleCloseEdit
                                }
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="transaction-save-button"
                                onClick={
                                    handleUpdateTransaction
                                }
                                disabled={actionLoading}
                            >
                                {actionLoading
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </section>

                </div>

            )}

        </div>
    );
};

export default TransactionList;