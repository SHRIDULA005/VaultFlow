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

    useEffect(() => {
        const result = getAllTransactions();

        if (result && typeof result.then === "function") {
            result
                .then((data) => {
                    setTransactions(
                        Array.isArray(data) ? data : []
                    );
                })
                .catch(() => {
                    setTransactions([]);
                });
        }
    }, []);

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
                .catch(() => {
                    setTransactions([]);
                });
        }
    }, [ledgerId]);

    const filteredTransactions = transactions.filter((transaction) => {
        const search = searchTerm.toLowerCase();

        return (
            String(transaction.id || "")
                .toLowerCase()
                .includes(search) ||
            String(transaction.sourceAccountId || "")
                .toLowerCase()
                .includes(search) ||
            String(transaction.targetAccountId || "")
                .toLowerCase()
                .includes(search) ||
            String(transaction.amount || "")
                .toLowerCase()
                .includes(search)
        );
    });

    return (
        <div className="transaction-list-page">

            <div className="transaction-list-header">
                <div>
                    <h2>Transaction List</h2>
                    <p>View and manage all recorded transactions</p>
                </div>
            </div>

            <div className="transaction-filters">

                <div className="transaction-filter-group">
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

                <div className="transaction-filter-group">
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
                    />
                </div>

            </div>

            <div className="transaction-count">
                Showing {filteredTransactions.length} transaction
                {filteredTransactions.length !== 1 ? "s" : ""}
            </div>

            <div className="transaction-cards">

                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                        <div
                            className="transaction-card"
                            key={transaction.id}
                        >
                            <div className="transaction-card-header">
                                <div>
                                    <span className="transaction-label">
                                        Transaction ID
                                    </span>

                                    <h3>
                                        #{transaction.id}
                                    </h3>
                                </div>

                                <span className="transaction-status">
                                    {transaction.status || "PENDING"}
                                </span>
                            </div>

                            <div className="transaction-card-body">

                                <div className="transaction-info">
                                    <span>Amount</span>
                                    <strong>
                                        ₹ {transaction.amount ?? "0"}
                                    </strong>
                                </div>

                                <div className="transaction-info">
                                    <span>Source Account</span>
                                    <strong>
                                        {transaction.sourceAccountId || "-"}
                                    </strong>
                                </div>

                                <div className="transaction-info">
                                    <span>Destination Account</span>
                                    <strong>
                                        {transaction.targetAccountId || "-"}
                                    </strong>
                                </div>

                                <div className="transaction-info">
                                    <span>Reference ID</span>
                                    <strong>
                                        {transaction.referenceId || "-"}
                                    </strong>
                                </div>

                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-transactions">
                        <div className="empty-icon">↔</div>
                        <h3>No transactions found</h3>
                        <p>
                            There are no transactions matching your search.
                        </p>
                    </div>
                )}

            </div>

        </div>
    );
};

export default TransactionList;