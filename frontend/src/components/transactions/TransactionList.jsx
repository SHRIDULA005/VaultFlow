
import React, { useEffect, useState } from "react";
import TransactionService from "../../services/transactionService";

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [ledgerId, setLedgerId] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        TransactionService.getAllTransactions()
            .then((response) => {
                setTransactions(response || []);
            })
            .catch((error) => {
                console.error(
                    "Failed to load transactions:",
                    error
                );
            });
    }, []);

    useEffect(() => {
        if (!ledgerId) {
            return;
        }

        TransactionService.getByLedger(ledgerId)
            .then((response) => {
                setTransactions(response || []);
            })
            .catch((error) => {
                console.error(
                    "Failed to load ledger transactions:",
                    error
                );
            });
    }, [ledgerId]);

    return (
        <div>
            <h2>Transaction List</h2>

            <input
                type="text"
                placeholder="Search by Transaction ID or Account Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <label htmlFor="ledgerFilter">
                Filter by Ledger
            </label>

            <input
                id="ledgerFilter"
                type="text"
                value={ledgerId}
                onChange={(e) =>
                    setLedgerId(e.target.value)
                }
            />

            <div>
                {transactions.map((transaction) => (
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

                        <p>
                            Status: {transaction.status}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionList;

