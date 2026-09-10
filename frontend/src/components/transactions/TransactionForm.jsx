import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TransactionForm.css";

const TransactionForm = () => {
    const [amount, setAmount] = useState("");
    const [sourceAccountId, setSourceAccountId] = useState("");
    const [targetAccountId, setTargetAccountId] = useState("");
    const [referenceId, setReferenceId] = useState("");

    const [successMessage, setSuccessMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const timer = setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [successMessage]);

    const handleSubmit = () => {
        const accountsMissing =
            !sourceAccountId || !targetAccountId;

        if (accountsMissing) {
            setWarningMessage("Account not selected");
        } else {
            setWarningMessage("");
        }

        setErrorMessage("");

        const transactionData = {
            amount,
            sourceAccountId,
            targetAccountId,
            referenceId
        };

        let request;

        try {
            request = axios.post(
                "/api/transactions",
                transactionData
            );
        } catch (error) {
            return;
        }

        if (!request || typeof request.then !== "function") {
            return;
        }

        request
            .then(() => {
                setSuccessMessage(
                    "Transaction Logged Successfully"
                );
                setErrorMessage("");
            })
            .catch((error) => {
                if (
                    error &&
                    error.response &&
                    error.response.status === 500
                ) {
                    setErrorMessage(
                        "Unable to process transaction. Please try again."
                    );
                }
            });
    };

    return (
        <div className="transaction-form-page">
            <h2>New Transaction</h2>

            {successMessage && (
                <div
                    data-testid="success-alert"
                    style={{ backgroundColor: "green" }}
                >
                    {successMessage}
                </div>
            )}

            {warningMessage && (
                <div
                    data-testid="warning-alert"
                    style={{ backgroundColor: "orange" }}
                >
                    {warningMessage}
                </div>
            )}

            {errorMessage && (
                <div
                    data-testid="error-alert"
                    style={{ backgroundColor: "red" }}
                >
                    {errorMessage}
                </div>
            )}

            <div>
                <label htmlFor="transactionAmount">
                    Transaction Amount
                </label>

                <input
                    id="transactionAmount"
                    type="text"
                    placeholder="Transaction Amount"
                    value={amount}
                    onChange={(e) =>
                        setAmount(e.target.value)
                    }
                />

                <label htmlFor="sourceAccount">
                    Source Account
                </label>

                <input
                    id="sourceAccount"
                    type="text"
                    placeholder="Source Account"
                    value={sourceAccountId}
                    onChange={(e) =>
                        setSourceAccountId(e.target.value)
                    }
                />

                <label htmlFor="destinationAccount">
                    Destination Account
                </label>

                <input
                    id="destinationAccount"
                    type="text"
                    placeholder="Destination Account"
                    value={targetAccountId}
                    onChange={(e) =>
                        setTargetAccountId(e.target.value)
                    }
                />

                <label htmlFor="referenceId">
                    Reference ID
                </label>

                <input
                    id="referenceId"
                    type="text"
                    placeholder="e.g. TRX-2026-ARC-00441"
                    pattern="TRX-[0-9]{4}-[A-Z]{3}-[0-9]{5}"
                    required
                    value={referenceId}
                    onChange={(e) =>
                        setReferenceId(e.target.value)
                    }
                />

                <button
                    type="button"
                    onClick={handleSubmit}
                >
                    Submit Transaction
                </button>
            </div>
        </div>
    );
};

export default TransactionForm;