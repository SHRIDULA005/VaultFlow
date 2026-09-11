import React, { useEffect, useState } from "react";
import {
    getAllTransactions,
    getByLedger
} from "../../services/transactionService";
import "./TransactionList.css";

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [ledgerId, setLedgerId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Load all transactions when component mounts
    useEffect(() => {
        const result = getAllTransactions();

        if (result && typeof result.then === "function") {
            result
                .then((data) => {
                    setTransactions(
                        Array.isArray(data) ? data : []
                    );
                })
                .catch((error) => {
                    console.error(
                        "Error loading transactions:",
                        error
                    );
                    setTransactions([]);
                });
        }
    }, []);

    // Filter by ledger
    useEffect(() => {
        if (!ledgerId) {
            return;
        }

        const result = getByLedger(ledgerId);

        if (result && typeof result.then === "function") {
            result
                .then((data) => {
                    setTransactions(
                        Array.isArray(data) ? data : []
                    );
                })
                .catch((error) => {
                    console.error(
                        "Error loading ledger transactions:",
                        error
                    );
                    setTransactions([]);
                });
        }
    }, [ledgerId]);

    // SEARCH
    const filteredTransactions = transactions.filter(
        (transaction) => {
            const search = searchTerm
                .trim()
                .toLowerCase();

            // Show everything when search is empty
            if (!search) {
                return true;
            }

            const id = String(
                transaction.id ?? ""
            ).toLowerCase();

            const sourceAccountId = String(
                transaction.sourceAccountId ??
                transaction.sourceAccount ??
                ""
            ).toLowerCase();

            const targetAccountId = String(
                transaction.targetAccountId ??
                transaction.targetAccount ??
                ""
            ).toLowerCase();

            const amount = String(
                transaction.amount ?? ""
            ).toLowerCase();

            const referenceId = String(
                transaction.referenceId ?? ""
            ).toLowerCase();

            const status = String(
                transaction.status ?? ""
            ).toLowerCase();

            return (
                id.includes(search) ||
                sourceAccountId.includes(search) ||
                targetAccountId.includes(search) ||
                amount.includes(search) ||
                referenceId.includes(search) ||
                status.includes(search)
            );
        }
    );

    return (
        <div className="transaction-list-page">

            {/* HEADER */}

            <div className="transaction-list-header">

                <div>
                    <span className="section-eyebrow">
                        VAULTFLOW
                    </span>

                    <h2>Transaction List</h2>

                    <p>
                        Search and manage your financial
                        transactions.
                    </p>
                </div>

                <div className="transaction-count">
                    {filteredTransactions.length}
                    <span>
                        Transactions
                    </span>
                </div>

            </div>

            {/* FILTERS */}

            <div className="transaction-filters">

                <div className="transaction-search">

                    <label htmlFor="transactionSearch">
                        Search Transactions
                    </label>

                    <input
                        id="transactionSearch"
                        type="text"
                        placeholder="Search by Transaction ID"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />

                </div>

                <div className="transaction-ledger-filter">

                    <label htmlFor="ledgerFilter">
                        Ledger ID
                    </label>

                    <input
                        id="ledgerFilter"
                        type="text"
                        placeholder="Enter Ledger ID"
                        value={ledgerId}
                        onChange={(event) =>
                            setLedgerId(
                                event.target.value
                            )
                        }
                    />

                </div>

                {ledgerId && (
                    <button
                        type="button"
                        className="clear-ledger-button"
                        onClick={() => {
                            setLedgerId("");
                            setSearchTerm("");
                        }}
                    >
                        Clear
                    </button>
                )}

            </div>

            {/* TRANSACTIONS */}

            {filteredTransactions.length === 0 ? (

                <div className="transaction-empty">

                    <div className="empty-transaction-icon">
                        —
                    </div>

                    <h3>
                        No transactions found
                    </h3>

                    <p>
                        {searchTerm
                            ? `No transaction matches "${searchTerm}".`
                            : "There are no transactions to display."}
                    </p>

                </div>

            ) : (

                <div className="transactions-grid">

                    {filteredTransactions.map(
                        (transaction) => (

                            <div
                                className="transaction-card"
                                key={transaction.id}
                            >

                                <div className="transaction-card-header">

                                    <div>
                                        <span className="transaction-label">
                                            TRANSACTION ID
                                        </span>

                                        <h3>
                                            #{transaction.id}
                                        </h3>
                                    </div>

                                    <span
                                        className={`transaction-status ${
                                            String(
                                                transaction.status ||
                                                "PENDING"
                                            ).toLowerCase()
                                        }`}
                                    >
                                        {transaction.status ||
                                            "PENDING"}
                                    </span>

                                </div>

                                <div className="transaction-card-body">

                                    <div className="transaction-amount">
                                        <span>
                                            AMOUNT
                                        </span>

                                        <strong>
                                            ₹
                                            {Number(
                                                transaction.amount ||
                                                0
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2
                                                }
                                            )}
                                        </strong>
                                    </div>

                                    <div className="transaction-details">

                                        <div>
                                            <span>
                                                SOURCE ACCOUNT
                                            </span>

                                            <strong>
                                                {transaction.sourceAccountId ??
                                                    transaction.sourceAccount ??
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                DESTINATION ACCOUNT
                                            </span>

                                            <strong>
                                                {transaction.targetAccountId ??
                                                    transaction.targetAccount ??
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                REFERENCE ID
                                            </span>

                                            <strong>
                                                {transaction.referenceId ||
                                                    "-"}
                                            </strong>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}

        </div>
    );
};

export default TransactionList;