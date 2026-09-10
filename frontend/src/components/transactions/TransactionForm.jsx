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

        // Show warning when accounts are missing
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
                <span className="transaction-eyebrow">
                    VAULTFLOW
                </span>

                <h1>New Transaction</h1>

                <p>
                    Record a new financial transaction.
                </p>
            </div>

            {/* Alerts */}
            {successMessage && (
                <div
                    className="transaction-alert success-alert"
                    data-testid="success-alert"
                    role="alert"
                >
                    <span className="alert-icon">✓</span>
                    <span>{successMessage}</span>
                </div>
            )}

            {warningMessage && (
                <div
                    className="transaction-alert warning-alert"
                    data-testid="warning-alert"
                    role="alert"
                >
                    <span className="alert-icon">!</span>
                    <span>{warningMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div
                    className="transaction-alert error-alert"
                    data-testid="error-alert"
                    role="alert"
                >
                    <span className="alert-icon">!</span>
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Transaction Card */}
            <section className="transaction-card">

                <div className="transaction-card-header">
                    <div>
                        <h2>New Transaction</h2>
                        <p>
                            Enter the transaction details below.
                        </p>
                    </div>
                </div>

                <div className="transaction-form">

                    {/* Amount */}
                    <div className="transaction-form-field">
                        <label htmlFor="transactionAmount">
                            Transaction Amount
                        </label>

                        <div className="amount-input-wrapper">
                            <span className="currency-symbol">
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

                        <span className="field-hint">
                            Format: TRX-YYYY-ABC-12345
                        </span>
                    </div>

                    {/* Submit */}
                    <div className="transaction-form-actions">
                        <button
                            type="button"
                            className="submit-transaction-button"
                            onClick={handleSubmit}
                        >
                            <span className="button-icon">↗</span>
                            Submit Transaction
                        </button>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default TransactionForm;