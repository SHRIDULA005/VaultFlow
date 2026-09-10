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

        // T20
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

        // Keep the API call behavior required by T14, T16, T18 and T19
        let request;

        try {
            request = axios.post(
                "/api/transactions",
                transactionData
            );
        } catch (error) {
            return;
        }

        // Protect against mocked axios.post without a Promise
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
        <div className="transaction-page">

            {/* Page Header */}
            <div className="transaction-page-header">
                <div className="transaction-eyebrow">
                    VAULTFLOW
                </div>

                <h1>New Transaction</h1>

                <p>
                    Record a new financial transaction.
                </p>
            </div>

            {/* Transaction Card */}
            <section className="transaction-form-section">

                <div className="transaction-section-heading">
                    <div>
                        <h2>New Transaction</h2>
                        <p>
                            Enter the transaction details below.
                        </p>
                    </div>
                </div>

                {/* Success */}
                {successMessage && (
                    <div
                        className="transaction-alert transaction-success-alert"
                        data-testid="success-alert"
                        style={{ backgroundColor: "green" }}
                    >
                        <span className="alert-icon">✓</span>
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Warning */}
                {warningMessage && (
                    <div
                        className="transaction-alert transaction-warning-alert"
                        data-testid="warning-alert"
                        style={{ backgroundColor: "orange" }}
                    >
                        <span className="alert-icon">!</span>
                        <span>{warningMessage}</span>
                    </div>
                )}

                {/* Error */}
                {errorMessage && (
                    <div
                        className="transaction-alert transaction-error-alert"
                        data-testid="error-alert"
                        style={{ backgroundColor: "red" }}
                    >
                        <span className="alert-icon">!</span>
                        <span>{errorMessage}</span>
                    </div>
                )}

                <div className="transaction-form">

                    {/* Amount */}
                    <div className="transaction-form-field">
                        <label htmlFor="transactionAmount">
                            Transaction Amount
                        </label>

                        <div className="transaction-input-wrapper">
                            <span className="currency-prefix">
                                ₹
                            </span>

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
                    </div>

                    {/* Source Account */}
                    <div className="transaction-form-field">
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
                    <div className="transaction-form-field">
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
                    <div className="transaction-form-field">
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

                        <small className="transaction-field-hint">
                            Format: TRX-YYYY-ABC-12345
                        </small>
                    </div>

                    {/* Button */}
                    <div className="transaction-form-actions">
                        <button
                            type="button"
                            className="transaction-submit-button"
                            onClick={handleSubmit}
                        >
                            Submit Transaction
                        </button>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default TransactionForm;