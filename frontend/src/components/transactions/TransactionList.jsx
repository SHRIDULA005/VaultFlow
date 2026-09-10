import React, { useEffect, useState } from "react";
import TransactionService from "../../services/transactionService";

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [ledgerId, setLedgerId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        TransactionService.getAllTransactions()
            .then((data) => {
                setTransactions(data || []);
            })
            .catch((error) => {
                console.error("Failed to load transactions:", error);
                setTransactions([]);
            });
    }, []);

    useEffect(() => {
        if (!ledgerId) {
            return;
        }

        TransactionService.getByLedger(ledgerId)
            .then((data) => {
                setTransactions(data || []);
            })
            .catch((error) => {
                console.error("Failed to load ledger transactions:", error);
                setTransactions([]);
            });
    }, [ledgerId]);

    const filteredTransactions = transactions.filter((transaction) => {
        if (!searchTerm) {
            return true;
        }

        const value = searchTerm.toLowerCase();

        return (
            String(transaction.id || "")
                .toLowerCase()
                .includes(value) ||
            String(transaction.referenceId || "")
                .toLowerCase()
                .includes(value) ||
            String(transaction.sourceAccountId || "")
                .toLowerCase()
                .includes(value) ||
            String(transaction.targetAccountId || "")
                .toLowerCase()
                .includes(value) ||
            String(transaction.sourceAccount || "")
                .toLowerCase()
                .includes(value) ||
            String(transaction.targetAccount || "")
                .toLowerCase()
                .includes(value)
        );
    });

    return (
        <div>
            <h2>Transaction List</h2>

            <div>
                <label htmlFor="transactionSearch">
                    Search Transactions
                </label>

                <input
                    id="transactionSearch"
                    type="text"
                    placeholder="Search by Transaction ID or Account Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="ledgerFilter">
                    Filter by Ledger
                </label>

                <input
                    id="ledgerFilter"
                    type="text"
                    placeholder="Ledger ID"
                    value={ledgerId}
                    onChange={(e) => setLedgerId(e.target.value)}
                />
            </div>

            <div>
                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                        <div key={transaction.id}>
                            <p>
                                Transaction ID: {transaction.id}
                            </p>

                            <p>
                                Amount: {transaction.amount}
                            </p>

                            <p>
                                Reference ID: {transaction.referenceId}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>No transactions found.</p>
                )}
            </div>
        </div>
    );
};

export default TransactionList;
