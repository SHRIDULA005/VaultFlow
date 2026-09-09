import React, { useEffect, useState } from "react";
import TransactionService from "../../services/transactionService";

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [ledgerId, setLedgerId] = useState("");
    const [search, setSearch] = useState("");

    // T10: Load all transactions once when component mounts
    useEffect(() => {
        TransactionService.getAllTransactions()
            .then((response) => {
                setTransactions(response || []);
            })
            .catch((error) => {
                console.error("Unable to load transactions:", error);
            });
    }, []);

    // T11: Load transactions when Ledger ID changes
    useEffect(() => {
        if (ledgerId.trim() !== "") {
            TransactionService.getByLedger(ledgerId)
                .then((response) => {
                    setTransactions(response || []);
                })
                .catch((error) => {
                    console.error("Unable to load ledger transactions:", error);
                });
        }
    }, [ledgerId]);

    return (
        <div>
            <h2>Transactions</h2>

            {/* T29 */}
            <input
                type="text"
                placeholder="Search by Transaction ID or Account Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* T11 */}
            <label htmlFor="ledgerFilter">
                Filter by Ledger
            </label>

            <input
                id="ledgerFilter"
                type="text"
                value={ledgerId}
                onChange={(e) => setLedgerId(e.target.value)}
                placeholder="Ledger ID"
            />

            <div>
                {transactions.length === 0 ? (
                    <p>No transactions found.</p>
                ) : (
                    transactions.map((transaction) => (
                        <div key={transaction.id}>
                            <p>
                                Transaction ID: {transaction.id}
                            </p>
                            <p>
                                Amount: {transaction.amount}
                            </p>
                            <p>
                                Status: {transaction.status}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TransactionList;