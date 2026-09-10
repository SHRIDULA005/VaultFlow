
import React, { useEffect, useState } from "react";
import axios from "axios";

const TransactionForm = () => {
    const [amount, setAmount] = useState("");
    const [sourceAccountId, setSourceAccountId] = useState("");
    const [targetAccountId, setTargetAccountId] = useState("");
    const [referenceId, setReferenceId] = useState("");

    const [successMessage, setSuccessMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // T19 - Automatically remove success message after 3 seconds
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

        // T20 - Account validation
        if (!sourceAccountId || !targetAccountId) {
            setWarningMessage("Account not selected");
            setSuccessMessage("");
            setErrorMessage("");
            return;
        }

        setWarningMessage("");
        setErrorMessage("");

        const transactionData = {
            amount: amount,
            sourceAccountId: sourceAccountId,
            targetAccountId: targetAccountId,
            referenceId: referenceId
        };

        // T14 - Create transaction
        axios
            .post("/api/transactions", transactionData)
            .then(() => {
                // T18 - Successful transaction
                setSuccessMessage(
                    "Transaction Logged Successfully"
                );
                setErrorMessage("");
                setWarningMessage("");
            })
            .catch((error) => {
                // T16 - Server error
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

            {/* T18 / T19 */}
            {successMessage && (
                <div
                    data-testid="success-alert"
                    style={{ backgroundColor: "green" }}
                >
                    {successMessage}
                </div>
            )}

            {/* T20 */}
            {warningMessage && (
                <div
                    data-testid="warning-alert"
                    style={{ backgroundColor: "orange" }}
                >
                    {warningMessage}
                </div>
            )}

            {/* T16 */}
            {errorMessage && (
                <div
                    data-testid="error-alert"
                    style={{ backgroundColor: "red" }}
                >
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit}>
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

                <button type="submit">
                    Submit Transaction
                </button>
            </form>
        </div>
    );
};

export default TransactionForm;

