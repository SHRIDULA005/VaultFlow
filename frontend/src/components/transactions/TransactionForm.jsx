import React, { useState, useEffect } from "react";
import axios from "axios";

const TransactionForm = () => {
    const [amount, setAmount] = useState("");
    const [sourceAccountId, setSourceAccountId] = useState("");
    const [targetAccountId, setTargetAccountId] = useState("");
    const [referenceId, setReferenceId] = useState("");

    const [successMessage, setSuccessMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // T19 - automatically remove success alert after 3 seconds
    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const timer = setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [successMessage]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Clear old alerts
        setWarningMessage("");
        setErrorMessage("");

        // T20 - account validation
        if (!sourceAccountId || !targetAccountId) {
            setWarningMessage("Account not selected");
            return;
        }

        const transactionData = {
            amount: amount,
            sourceAccountId: sourceAccountId,
            targetAccountId: targetAccountId,
            referenceId: referenceId
        };

        // T14 - create transaction
        axios
            .post("/api/transactions", transactionData)
            .then(() => {
                // T18
                setSuccessMessage("Transaction Logged Successfully");
            })
            .catch((error) => {
                // T16
                if (
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
        <div>
            <h2>New Transaction</h2>

            {/* Success Alert */}
            {successMessage && (
                <div
                    data-testid="success-alert"
                    style={{ backgroundColor: "green" }}
                >
                    {successMessage}
                </div>
            )}

            {/* Warning Alert */}
            {warningMessage && (
                <div
                    data-testid="warning-alert"
                    style={{ backgroundColor: "orange" }}
                >
                    {warningMessage}
                </div>
            )}

            {/* Error Alert */}
            {errorMessage && (
                <div
                    data-testid="error-alert"
                    style={{ backgroundColor: "red" }}
                >
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                {/* Transaction Amount */}
                <label htmlFor="transactionAmount">
                    Transaction Amount
                </label>

                <input
                    id="transactionAmount"
                    type="text"
                    placeholder="Transaction Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                {/* Source Account */}
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

                {/* Destination Account */}
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

                {/* Reference ID */}
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

                {/* Submit */}
                <button type="submit">
                    Submit Transaction
                </button>
            </form>
        </div>
    );
};

export default TransactionForm;