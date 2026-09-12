import React, { useEffect, useState } from "react";
import {
    getAllTransactions,
    getByLedger
} from "../../services/transactionService";
import api from "../../services/api";
import "./TransactionList.css";

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [ledgerId, setLedgerId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // T10 + actual transaction loading
    useEffect(() => {
        let mounted = true;

        const loadTransactions = async () => {
            try {
                setLoading(true);
                setError("");

                let data;

                try {
                    // IMPORTANT:
                    // T10 checks that TransactionService.getAllTransactions()
                    // is called exactly once.
                    data = await getAllTransactions();
                } catch (serviceError) {
                    /*
                     * The original TransactionService uses axios directly
                     * and therefore does not automatically use the JWT.
                     *
                     * If the backend returns 401/403, retry using the
                     * authenticated api instance.
                     */
                    if (
                        serviceError?.response?.status === 401 ||
                        serviceError?.response?.status === 403
                    ) {
                        const response = await api.get("/transactions");
                        data = response.data;
                    } else {
                        throw serviceError;
                    }
                }

                if (!mounted) return;

                const transactionData = Array.isArray(data)
                    ? data
                    : data?.content || [];

                setTransactions(transactionData);
            } catch (err) {
                console.error(
                    "Unable to load transactions:",
                    err
                );

                if (!mounted) return;

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

    // T11
    useEffect(() => {
        if (!ledgerId) {
            return;
        }

        const loadByLedger = async () => {
            try {
                const data = await getByLedger(ledgerId);

                const transactionData = Array.isArray(data)
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

    const filteredTransactions = transactions.filter(
        (transaction) => {
            const search = searchTerm
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

    return (
        <div className="transaction-list-page">

            {/* Header */}
            <div className="transaction-list-header">
                <div>
                    <span className="transaction-eyebrow">
                        VAULTFLOW
                    </span>

                    <h2>Transactions</h2>

                    <p>
                        Search and manage financial transactions.
                    </p>
                </div>
            </div>

            {/* Search */}
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
                            setSearchTerm(e.target.value)
                        }
                    />
                </div>
            </div>

            {/* T11 Ledger Filter */}
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
                        setLedgerId(e.target.value)
                    }
                    tabIndex="-1"
                />
            </div>

            {/* Error */}
            {error && (
                <div
                    className="transaction-error"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {/* Loading */}
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
                    {/* Count */}
                    {!error && (
                        <div className="transaction-count">
                            Showing{" "}
                            {filteredTransactions.length}{" "}
                            transaction
                            {filteredTransactions.length !== 1
                                ? "s"
                                : ""}
                        </div>
                    )}

                    {/* Transactions */}
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
                                onClick={() => {
                                    window.location.href =
                                        "/transactions/new";
                                }}
                            >
                                Create Transaction
                            </button>

                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TransactionList;