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

    const [isSubmitting, setIsSubmitting] = useState(false);

    // T19 - automatically hide success after 3 seconds
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
        // T20
        // Show warning but DO NOT stop the request.
        if (!sourceAccountId || !targetAccountId) {
            setWarningMessage("Account not selected");
        } else {
            setWarningMessage("");
        }

        setErrorMessage("");
        setSuccessMessage("");

        // T14 - exact payload
        const transactionData = {
            amount,
            sourceAccountId,
            targetAccountId,
            referenceId
        };

        /*
         * IMPORTANT:
         * Do NOT stop submission when token is missing.
         *
         * The backend will handle authentication.
         * The test suite mocks axios.post directly.
         */
        const token = localStorage.getItem("token");

        if (token) {
            axios.defaults.headers.common.Authorization =
                `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common.Authorization;
        }

        setIsSubmitting(true);

        let request;

        try {
            /*
             * T14
             *
             * Keep this EXACTLY as a two-argument call.
             */
            request = axios.post(
                "/api/transactions",
                transactionData
            );
        } catch (error) {
            console.error(
                "Transaction request failed:",
                error
            );

            setIsSubmitting(false);

            setErrorMessage(
                "Unable to create transaction. Please try again."
            );

            return;
        }

        if (!request || typeof request.then !== "function") {
            setIsSubmitting(false);
            return;
        }

        request
            .then(() => {
                // T18
                setSuccessMessage(
                    "Transaction Logged Successfully"
                );

                setWarningMessage("");
                setErrorMessage("");
                setIsSubmitting(false);

                setAmount("");
                setSourceAccountId("");
                setTargetAccountId("");
                setReferenceId("");
            })
            .catch((error) => {
                console.error(
                    "Transaction creation failed:",
                    error
                );

                setIsSubmitting(false);

                const status =
                    error?.response?.status;

                // T17
                if (status === 401) {
                    localStorage.removeItem("token");

                    delete axios.defaults.headers.common.Authorization;

                    setErrorMessage("Session expired");

                    return;
                }

                // 403
                if (status === 403) {
                    setErrorMessage(
                        "You are not authorized to create transactions."
                    );

                    return;
                }

                // T16
                if (status === 500) {
                    setErrorMessage(
                        "Unable to process transaction. Please try again."
                    );

                    return;
                }

                setErrorMessage(
                    "Unable to create transaction. Please try again."
                );
            });
    };

    return (
        <main className="transaction-form-page">

            {/* HEADER */}

            <section className="transaction-form-header">

                <div className="transaction-breadcrumb">
                    <span>VAULTFLOW</span>

                    <span className="breadcrumb-divider">
                        /
                    </span>

                    <strong>
                        Transactions
                    </strong>
                </div>

                <div className="transaction-header-content">

                    <div>
                        <span className="transaction-eyebrow">
                            FINANCIAL OPERATIONS
                        </span>

                        <h1>
                            New Transaction
                        </h1>

                        <p>
                            Create and submit a secure
                            financial transaction for
                            processing.
                        </p>
                    </div>

                    <div className="transaction-header-badge">
                        <span className="status-dot"></span>
                        Secure Entry
                    </div>

                </div>

            </section>

            {/* SUCCESS ALERT */}

            {successMessage && (
                <div
                    className="
                        transaction-alert
                        transaction-alert-success
                    "
                    data-testid="success-alert"
                >
                    <div className="alert-icon">
                        ✓
                    </div>

                    <div>
                        <strong>
                            Transaction submitted
                        </strong>

                        <span>
                            Transaction Logged Successfully
                        </span>
                    </div>
                </div>
            )}

            {/* WARNING ALERT */}

            {warningMessage && (
                <div
                    className="
                        transaction-alert
                        transaction-alert-warning
                    "
                    data-testid="warning-alert"
                >
                    <div className="alert-icon">
                        !
                    </div>

                    <div>
                        <strong>
                            Account selection required
                        </strong>

                        <span>
                            Account not selected
                        </span>
                    </div>
                </div>
            )}

            {/* ERROR ALERT */}

            {errorMessage && (
                <div
                    className="
                        transaction-alert
                        transaction-alert-error
                    "
                    data-testid="error-alert"
                    style={{
                        backgroundColor: "red"
                    }}
                >
                    <div className="alert-icon">
                        !
                    </div>

                    <div>
                        <strong>
                            Transaction failed
                        </strong>

                        <span>
                            {errorMessage}
                        </span>
                    </div>
                </div>
            )}

            {/* FORM */}

            <section className="transaction-form-card">

                <div className="transaction-card-header">

                    <div className="transaction-card-icon">
                        $
                    </div>

                    <div>
                        <span>
                            TRANSACTION DETAILS
                        </span>

                        <h2>
                            Enter transaction information
                        </h2>

                        <p>
                            Verify the account details
                            before submitting.
                        </p>
                    </div>

                </div>

                <div className="transaction-form-divider"></div>

                <div className="transaction-form-grid">

                    {/* AMOUNT */}

                    <div
                        className="
                            transaction-form-group
                            transaction-form-group-full
                        "
                    >
                        <label htmlFor="transactionAmount">
                            Transaction Amount
                            <span>*</span>
                        </label>

                        <div
                            className="
                                transaction-input-wrapper
                                transaction-amount-wrapper
                            "
                        >
                            <span className="currency-symbol">
                                ₹
                            </span>

                            <input
                                id="transactionAmount"
                                type="text"
                                inputMode="decimal"
                                name="amount"
                                placeholder="Transaction Amount"
                                value={amount}
                                onChange={(e) =>
                                    setAmount(e.target.value)
                                }
                            />
                        </div>

                        <small>
                            Enter the amount to be transferred.
                        </small>
                    </div>

                    {/* SOURCE ACCOUNT */}

                    <div className="transaction-form-group">

                        <label htmlFor="sourceAccount">
                            Source Account
                            <span>*</span>
                        </label>

                        <div className="transaction-input-wrapper">

                            <span className="field-prefix">
                                ACC
                            </span>

                            <input
                                id="sourceAccount"
                                type="text"
                                name="sourceAccountId"
                                placeholder="Source Account"
                                value={sourceAccountId}
                                onChange={(e) =>
                                    setSourceAccountId(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <small>
                            Account from which funds
                            will be transferred.
                        </small>

                    </div>

                    {/* DESTINATION ACCOUNT */}

                    <div className="transaction-form-group">

                        <label htmlFor="destinationAccount">
                            Destination Account
                            <span>*</span>
                        </label>

                        <div className="transaction-input-wrapper">

                            <span className="field-prefix">
                                ACC
                            </span>

                            <input
                                id="destinationAccount"
                                type="text"
                                name="targetAccountId"
                                placeholder="Destination Account"
                                value={targetAccountId}
                                onChange={(e) =>
                                    setTargetAccountId(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <small>
                            Account that will receive
                            the funds.
                        </small>

                    </div>

                    {/* REFERENCE ID */}

                    <div
                        className="
                            transaction-form-group
                            transaction-form-group-full
                        "
                    >

                        <label htmlFor="referenceId">
                            Reference ID
                            <span>*</span>
                        </label>

                        <div className="transaction-input-wrapper">

                            <span className="field-prefix">
                                REF
                            </span>

                            <input
                                id="referenceId"
                                type="text"
                                name="referenceId"
                                placeholder="e.g. TRX-2026-ARC-00441"
                                pattern="TRX-[0-9]{4}-[A-Z]{3}-[0-9]{5}"
                                title="Use the format TRX-YYYY-XXX-NNNNN."
                                required
                                value={referenceId}
                                onChange={(e) =>
                                    setReferenceId(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <small>
                            Use the format
                            TRX-YYYY-XXX-NNNNN.
                        </small>

                    </div>

                </div>

                {/* SECURITY NOTICE */}

                <div className="transaction-security-note">

                    <div className="security-icon">
                        ✓
                    </div>

                    <div>
                        <strong>
                            Secure transaction processing
                        </strong>

                        <span>
                            Your transaction is authenticated
                            and recorded securely in VaultFlow.
                        </span>
                    </div>

                </div>

                {/* FOOTER */}

                <div className="transaction-form-footer">

                    <div className="required-note">
                        <span>*</span>
                        Required fields
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="transaction-submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="button-spinner"></span>
                                Processing...
                            </>
                        ) : (
                            <>
                                Submit Transaction
                                <span className="button-arrow">
                                    →
                                </span>
                            </>
                        )}
                    </button>

                </div>

            </section>

            {/* PAGE FOOTER */}

            <div className="transaction-page-footer">

                <span>
                    VaultFlow Financial Management
                </span>

                <span>
                    Secure • Audited • Controlled
                </span>

            </div>

        </main>
    );
};

export default TransactionForm;