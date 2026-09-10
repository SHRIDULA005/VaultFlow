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

    // Remove success message after 3 seconds
    useEffect(() => {
        if (!successMessage) return;

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

        // Protect against mocked axios returning undefined
        if (!request || typeof request.then !== "function") {
            return;
        }

        request
            .then((response) => {
                setSuccessMessage(
                    "Transaction Logged Successfully"
                );

                setErrorMessage("");
            })
            .catch((error) => {
                // 403 - Authorization error
                if (
                    error &&
                    error.response &&
                    error.response.status === 403
                ) {
                    setErrorMessage(
                        "You are not authorized to create transactions."
                    );
                }

                // 500 - Server error
                else if (
                    error &&
                    error.response &&
                    error.response.status === 500
                ) {
                    setErrorMessage(
                        "Unable to process transaction. Please try again."
                    );
                }

                // Other errors
                else {
                    setErrorMessage(
                        "Unable to create transaction. Please try again."
                    );
                }
            });
    };

    return (
        <div className="transaction-form-page">

            <div className="transaction-form-header">
                <span className="transaction-eyebrow">
                    VAULTFLOW
                </span>

                <h2>New Transaction</h2>

                <p>
                    Create and submit a new financial transaction.
                </p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div
                    data-testid="success-alert"
                    style={{
                        backgroundColor: "green",
                        color: "white",
                        padding: "12px",
                        marginBottom: "15px",
                        borderRadius: "5px"
                    }}
                >
                    Transaction Logged Successfully
                </div>
            )}

            {/* Warning Message */}
            {warningMessage && (
                <div
                    data-testid="warning-alert"
                    style={{
                        backgroundColor: "orange",
                        color: "black",
                        padding: "12px",
                        marginBottom: "15px",
                        borderRadius: "5px"
                    }}
                >
                    Account not selected
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <div
                    data-testid="error-alert"
                    style={{
                        backgroundColor: "red",
                        color: "white",
                        padding: "12px",
                        marginBottom: "15px",
                        borderRadius: "5px"
                    }}
                >
                    {errorMessage}
                </div>
            )}

            <div className="transaction-form-card">

                {/* Amount */}
                <div className="transaction-form-group">
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
                </div>

                {/* Source Account */}
                <div className="transaction-form-group">
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
                </div>

                {/* Destination Account */}
                <div className="transaction-form-group">
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
                </div>

                {/* Reference ID */}
                <div className="transaction-form-group">
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
                </div>

                {/* Submit */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="transaction-submit-button"
                >
                    Submit Transaction
                </button>

            </div>
        </div>
    );
};

export default TransactionForm;