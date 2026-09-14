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

    /*
     * =========================================================
     * EDIT STATE
     * =========================================================
     */

    const [editingTransaction, setEditingTransaction] =
        useState(null);

    const [editAmount, setEditAmount] =
        useState("");

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


    /* =========================================================
       LOAD TRANSACTIONS
    ========================================================= */

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
                     * T10 expects getAllTransactions()
                     * to be called exactly once when mounted.
                     */

                    data = await getAllTransactions();

                } catch (serviceError) {

                    /*
                     * Authenticated fallback
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

                } else if (
                    err?.response?.status === 403
                ) {

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


    /* =========================================================
       LEDGER FILTER
    ========================================================= */

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


    /* =========================================================
       SEARCH
    ========================================================= */

    const filteredTransactions =
        transactions.filter((transaction) => {

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
                    .includes(search)

                ||

                String(transaction?.sourceAccountId || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(transaction?.targetAccountId || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(transaction?.referenceId || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(transaction?.amount || "")
                    .toLowerCase()
                    .includes(search)
            );
        });


    /* =========================================================
       CREATE
    ========================================================= */

    const handleCreateTransaction = () => {

        window.location.href =
            "/transactions/new";

    };


    /* =========================================================
       EDIT TRANSACTION
    ========================================================= */

    const handleEditTransaction = (transaction) => {

        if (!transaction) {
            return;
        }

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


    /* =========================================================
       CLOSE EDIT
    ========================================================= */

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


    /* =========================================================
       UPDATE TRANSACTION
    ========================================================= */

    const handleUpdateTransaction = async () => {

        if (!editingTransaction?.id) {

            setError(
                "Transaction ID is missing."
            );

            return;
        }


        /*
         * Validate fields
         */

        if (
            editAmount === "" ||
            editSourceAccountId === "" ||
            editTargetAccountId === "" ||
            editReferenceId.trim() === ""
        ) {

            setError(
                "Please complete all transaction fields."
            );

            return;
        }


        /*
         * Validate amount
         */

        const numericAmount =
            Number(editAmount);

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {

            setError(
                "Transaction amount must be greater than zero."
            );

            return;
        }


        /*
         * Validate account IDs
         */

        const numericSourceAccount =
            Number(editSourceAccountId);

        const numericTargetAccount =
            Number(editTargetAccountId);

        if (
            !Number.isInteger(numericSourceAccount) ||
            numericSourceAccount <= 0
        ) {

            setError(
                "Source Account must be a valid account ID."
            );

            return;
        }

        if (
            !Number.isInteger(numericTargetAccount) ||
            numericTargetAccount <= 0
        ) {

            setError(
                "Destination Account must be a valid account ID."
            );

            return;
        }


        /*
         * Same source/target validation
         */

        if (
            numericSourceAccount ===
            numericTargetAccount
        ) {

            setError(
                "Source and destination accounts cannot be the same."
            );

            return;
        }


        setActionLoading(true);

        setError("");
        setSuccessMessage("");


        /*
         * =====================================================
         * EXACT UPDATE PAYLOAD
         * =====================================================
         */

        const transactionData = {

            amount:
                numericAmount,

            sourceAccountId:
                numericSourceAccount,

            targetAccountId:
                numericTargetAccount,

            referenceId:
                editReferenceId.trim(),

            status:
                editStatus,

            ledgerId:
                editLedgerId.trim() || null
        };


        /*
         * =====================================================
         * JWT
         * =====================================================
         */

        const token =
            localStorage.getItem("token");

        if (token) {

            axios.defaults.headers.common.Authorization =
                `Bearer ${token}`;
        }


        try {

            /*
             * =================================================
             * UPDATE BACKEND
             * =================================================
             */

            const response =
                await axios.put(
                    `/api/transactions/${editingTransaction.id}`,
                    transactionData
                );


            /*
             * =================================================
             * BUILD THE UPDATED TRANSACTION
             * =================================================
             *
             * Do NOT blindly use response.data.
             *
             * Some Spring Boot endpoints return a message
             * instead of the complete updated transaction.
             *
             * Always preserve the original transaction and
             * overlay the fields we just updated.
             */

            const backendData =
                response?.data;

            const backendTransaction =
                backendData &&
                typeof backendData === "object" &&
                !Array.isArray(backendData)
                    ? backendData
                    : {};


            const updatedTransaction = {

                ...editingTransaction,

                ...transactionData,

                ...backendTransaction,

                /*
                 * Always preserve the correct ID.
                 */

                id:
                    editingTransaction.id
            };


            /*
             * =================================================
             * IMMEDIATE UI UPDATE
             * =================================================
             */

            setTransactions((previous) =>
                previous.map((transaction) => {

                    if (
                        String(transaction?.id) ===
                        String(editingTransaction.id)
                    ) {

                        return updatedTransaction;
                    }

                    return transaction;
                })
            );


            /*
             * =================================================
             * SUCCESS MESSAGE
             * =================================================
             */

            setSuccessMessage(
                "Transaction updated successfully."
            );


            /*
             * Close editor
             */

            setEditingTransaction(null);


            /*
             * =================================================
             * REFRESH FROM BACKEND
             * =================================================
             *
             * This makes sure the displayed transaction matches
             * the actual database state after the PUT request.
             *
             * If refresh fails, we keep the local successful
             * update instead of showing an error after a valid PUT.
             */

            try {

                const refreshedData =
                    await getAllTransactions();

                const refreshedTransactions =
                    Array.isArray(refreshedData)
                        ? refreshedData
                        : refreshedData?.content || [];

                if (
                    Array.isArray(refreshedTransactions) &&
                    refreshedTransactions.length > 0
                ) {

                    setTransactions(
                        refreshedTransactions
                    );
                }

            } catch (refreshError) {

                console.warn(
                    "Transaction updated, but refresh failed:",
                    refreshError
                );
            }


        } catch (err) {

            console.error(
                "Unable to update transaction:",
                err
            );


            const status =
                err?.response?.status;


            /*
             * 401
             */

            if (status === 401) {

                localStorage.removeItem("token");

                setError(
                    "Session expired. Please log in again."
                );

                return;
            }


            /*
             * 403
             */

            if (status === 403) {

                setError(
                    "You are not authorized to edit transactions."
                );

                return;
            }


            /*
             * 404
             */

            if (status === 404) {

                setError(
                    "Transaction not found."
                );

                return;
            }


            /*
             * Backend message
             */

            if (err?.response?.data) {

                const responseData =
                    err.response.data;


                if (
                    typeof responseData ===
                    "string"
                ) {

                    setError(
                        responseData
                    );

                    return;
                }


                if (
                    responseData.message
                ) {

                    setError(
                        responseData.message
                    );

                    return;
                }
            }


            /*
             * Generic error
             */

            setError(
                "Unable to update transaction. Please try again."
            );

        } finally {

            setActionLoading(false);

        }
    };


    /* =========================================================
       DELETE / REVERSE TRANSACTION
    ========================================================= */

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
                        String(transaction?.id) !==
                        String(id)
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


            if (
                err?.response?.status ===
                403
            ) {

                setError(
                    "You are not authorized to reverse this transaction."
                );

            } else if (
                err?.response?.status ===
                404
            ) {

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


    /* =========================================================
       RENDER
    ========================================================= */

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
                        Search, review and manage
                        your financial transactions.
                    </p>

                </div>


                <button
                    type="button"
                    className="transaction-create-button"
                    onClick={
                        handleCreateTransaction
                    }
                >

                    <span className="create-button-icon">
                        +
                    </span>

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

                    <div className="transaction-search-input-wrapper">

                        <span
                            className="transaction-search-icon"
                            aria-hidden="true"
                        >
                            ⌕
                        </span>

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

            </div>


            {/* =================================================
                FILTER
            ================================================= */}

            <div className="transaction-filter-bar">

                <div className="transaction-filter-left">

                    <span className="transaction-filter-icon">
                        ◈
                    </span>

                    <label
                        htmlFor="ledgerFilter"
                    >
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
                    />

                </div>


                <div className="transaction-count">

                    Showing{" "}

                    <strong>
                        {
                            filteredTransactions.length
                        }
                    </strong>

                    {" "}

                    transaction
                    {
                        filteredTransactions.length !== 1
                            ? "s"
                            : ""
                    }

                </div>

            </div>


            {/* =================================================
                SUCCESS
            ================================================= */}

            {successMessage && (

                <div
                    className="transaction-success"
                    role="status"
                >

                    <span>
                        ✓
                    </span>

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

                    <span>
                        !
                    </span>

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
                                                    {
                                                        transaction?.id ??
                                                        "-"
                                                    }
                                                </h3>

                                            </div>


                                            <span
                                                className={
                                                    `transaction-status transaction-status-${String(
                                                        transaction?.status ||
                                                        "PENDING"
                                                    ).toLowerCase()}`
                                                }
                                            >
                                                {
                                                    transaction?.status ||
                                                    "PENDING"
                                                }
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
                                                    {
                                                        Number(
                                                            transaction?.amount ??
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )
                                                    }
                                                </strong>

                                            </div>


                                            <div className="transaction-info">

                                                <span>
                                                    Source Account
                                                </span>

                                                <strong>
                                                    {
                                                        transaction?.sourceAccountId ??
                                                        "-"
                                                    }
                                                </strong>

                                            </div>


                                            <div className="transaction-info">

                                                <span>
                                                    Destination Account
                                                </span>

                                                <strong>
                                                    {
                                                        transaction?.targetAccountId ??
                                                        "-"
                                                    }
                                                </strong>

                                            </div>


                                            <div className="transaction-info">

                                                <span>
                                                    Reference ID
                                                </span>

                                                <strong>
                                                    {
                                                        transaction?.referenceId ??
                                                        "-"
                                                    }
                                                </strong>

                                            </div>

                                        </div>


                                        {/* ACTIONS */}

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

                                                <span
                                                    className="transaction-action-icon"
                                                    aria-hidden="true"
                                                >
                                                    ✎
                                                </span>

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

                                                <span
                                                    className="transaction-action-icon"
                                                    aria-hidden="true"
                                                >
                                                    ×
                                                </span>

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
                                matching your current search.
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
                EDIT MODAL
            ================================================= */}

            {editingTransaction && (

                <div
                    className="transaction-edit-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="transaction-edit-title"
                >

                    <section
                        className="transaction-edit-panel"
                    >

                        {/* EDIT HEADER */}

                        <div className="transaction-edit-header">

                            <div>

                                <span className="transaction-eyebrow">
                                    TRANSACTION SETTINGS
                                </span>

                                <h2
                                    id="transaction-edit-title"
                                >
                                    Edit Transaction #
                                    {
                                        editingTransaction.id
                                    }
                                </h2>

                                <p>
                                    Update the transaction details
                                    and save them securely.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="transaction-close-button"
                                onClick={
                                    handleCloseEdit
                                }
                                disabled={
                                    actionLoading
                                }
                                aria-label="Close edit transaction"
                            >
                                ×
                            </button>

                        </div>


                        {/* EDIT FORM */}

                        <div className="transaction-edit-form">


                            {/* AMOUNT */}

                            <div className="transaction-form-group">

                                <label htmlFor="editTransactionAmount">
                                    Transaction Amount
                                </label>

                                <div className="transaction-edit-input-wrapper">

                                    <span>
                                        ₹
                                    </span>

                                    <input
                                        id="editTransactionAmount"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={
                                            editAmount
                                        }
                                        onChange={(e) =>
                                            setEditAmount(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>


                            {/* SOURCE */}

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


                            {/* DESTINATION */}

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


                            {/* REFERENCE */}

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


                            {/* STATUS */}

                            <div className="transaction-form-group">

                                <label htmlFor="editTransactionStatus">
                                    Transaction Status
                                </label>

                                <select
                                    id="editTransactionStatus"
                                    value={
                                        editStatus
                                    }
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


                            {/* LEDGER */}

                            <div className="transaction-form-group">

                                <label htmlFor="editLedgerId">
                                    Ledger ID
                                </label>

                                <input
                                    id="editLedgerId"
                                    type="text"
                                    placeholder="Ledger ID"
                                    value={
                                        editLedgerId
                                    }
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
                                disabled={
                                    actionLoading
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="transaction-save-button"
                                onClick={
                                    handleUpdateTransaction
                                }
                                disabled={
                                    actionLoading
                                }
                            >

                                {actionLoading ? (

                                    <>
                                        <span className="button-spinner"></span>
                                        Saving...
                                    </>

                                ) : (

                                    <>
                                        <span>
                                            ✓
                                        </span>
                                        Save Changes
                                    </>

                                )}

                            </button>

                        </div>

                    </section>

                </div>

            )}

        </div>
    );
};

export default TransactionList;