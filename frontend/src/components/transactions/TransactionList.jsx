import React, { useEffect, useState } from "react";
import TransactionService from "../../services/transactionService";

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [ledgerId, setLedgerId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const result =
            TransactionService.getAllTransactions();

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

        const result =
            TransactionService.getByLedger(ledgerId);

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
                    onChange={(e) =>
                        setSearchTerm(e.target.value)
                    }
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
                    onChange={(e) =>
                        setLedgerId(e.target.value)
                    }
                />
            </div>

            <div>
                {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                        <div key={transaction.id}>
                            <p>
                                Transaction ID:{" "}
                                {transaction.id}
                            </p>

                            <p>
                                Amount:{" "}
                                {transaction.amount}
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
