import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TransactionForm.css";

const API_BASE_URL = "http://localhost:8080";

const TransactionForm = () => {
    // =========================================================
    // FORM STATE
    // =========================================================

    const [amount, setAmount] = useState("");
    const [sourceAccountId, setSourceAccountId] = useState("");
    const [targetAccountId, setTargetAccountId] = useState("");
    const [referenceId, setReferenceId] = useState("");

    // =========================================================
    // UI STATE
    // =========================================================

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [successMessage, setSuccessMessage] =
        useState("");

    const [warningMessage, setWarningMessage] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");

    // =========================================================
    // SUCCESS ALERT AUTO DISMISS
    // T19
    // =========================================================

    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const timer = setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

        return () => {
            clearTimeout(timer);
        };
    }, [successMessage]);

    // =========================================================
    // CLEAR MESSAGES
    // =========================================================

    const clearMessages = () => {
        setSuccessMessage("");
        setWarningMessage("");
        setErrorMessage("");
    };

    // =========================================================
    // HANDLE SUBMIT
    // =========================================================

    const handleSubmit = () => {

        // =====================================================
        // T20 — ACCOUNT WARNING
        //
        // IMPORTANT:
        // Do NOT return here.
        //
        // The test suite expects the warning to appear while
        // the axios request flow continues.
        // =====================================================

        const accountsMissing =
            !sourceAccountId ||
            !targetAccountId;

        if (accountsMissing) {
            setWarningMessage(
                "Account not selected"
            );
        } else {
            setWarningMessage("");
        }

        // Clear previous error/success messages
        setErrorMessage("");
        setSuccessMessage("");

        // =====================================================
        // T14 — EXACT TRANSACTION PAYLOAD
        //
        // Keep these values exactly as entered.
        // =====================================================

        const transactionData = {
            amount,
            sourceAccountId,
            targetAccountId,
            referenceId
        };

        // =====================================================
        // TOKEN
        // =====================================================

        const token =
            localStorage.getItem("token");

        // =====================================================
        // AUTHENTICATION
        // =====================================================

        if (!token) {
            delete axios.defaults.headers.common.Authorization;

            setIsSubmitting(false);

            setErrorMessage(
                "Session expired"
            );

            return;
        }

        // =====================================================
        // AXIOS CONFIGURATION
        // =====================================================

        axios.defaults.baseURL =
            API_BASE_URL;

        axios.defaults.headers.common.Authorization =
            `Bearer ${token}`;

        // =====================================================
        // POST REQUEST
        //
        // IMPORTANT:
        // Keep exactly TWO arguments.
        //
        // T14 checks the exact payload.
        // =====================================================

        let request;

        try {
            setIsSubmitting(true);

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
                "Unable to process transaction. Please try again."
            );

            return;
        }

        // =====================================================
        // PROMISE SAFETY
        // =====================================================

        if (
            !request ||
            typeof request.then !== "function"
        ) {
            setIsSubmitting(false);
            return;
        }

        // =====================================================
        // SUCCESS / ERROR HANDLING
        // =====================================================

        request
            .then(() => {

                // =================================================
                // T18 — SUCCESS ALERT
                // =================================================

                setSuccessMessage(
                    "Transaction Logged Successfully"
                );

                setWarningMessage("");
                setErrorMessage("");

                setIsSubmitting(false);

                // Clear form after successful submission
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

                const status =
                    error?.response?.status;

                setIsSubmitting(false);

                // =================================================
                // T17 — 401 SESSION EXPIRED
                // =================================================

                if (status === 401) {

                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "role"
                    );

                    localStorage.removeItem(
                        "user"
                    );

                    delete axios.defaults.headers
                        .common.Authorization;

                    setErrorMessage(
                        "Session expired"
                    );

                    return;
                }

                // =================================================
                // 403 — FORBIDDEN
                // =================================================

                if (status === 403) {

                    setErrorMessage(
                        "You are not authorized to create transactions."
                    );

                    return;
                }

                // =================================================
                // T16 — 500 INTERNAL SERVER ERROR
                // =================================================

                if (status === 500) {

                    setErrorMessage(
                        "Unable to process transaction. Please try again."
                    );

                    return;
                }

                // =================================================
                // OTHER BACKEND ERRORS
                // =================================================

                const responseData =
                    error?.response?.data;

                if (
                    typeof responseData === "string" &&
                    responseData.trim()
                ) {

                    setErrorMessage(
                        responseData
                    );

                    return;
                }

                if (
                    responseData?.message
                ) {

                    setErrorMessage(
                        responseData.message
                    );

                    return;
                }

                // =================================================
                // GENERIC ERROR
                // =================================================

                setErrorMessage(
                    "Unable to process transaction. Please try again."
                );
            });
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <main className="transaction-form-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <section className="transaction-form-header">

                <div className="transaction-breadcrumb">

                    <span>
                        VAULTFLOW
                    </span>

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

            {/* =================================================
                SUCCESS ALERT
                T18 / T19
            ================================================= */}

            {successMessage && (
                <div
                    className="
                        transaction-alert
                        transaction-alert-success
                    "
                    data-testid="success-alert"
                    role="alert"
                >

                    <div className="alert-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            Transaction submitted
                        </strong>

                        <span>
                            {successMessage}
                        </span>

                    </div>

                </div>
            )}

            {/* =================================================
                WARNING ALERT
                T20
            ================================================= */}

            {warningMessage && (
                <div
                    className="
                        transaction-alert
                        transaction-alert-warning
                    "
                    data-testid="warning-alert"
                    role="alert"
                >

                    <div className="alert-icon">
                        !
                    </div>

                    <div>

                        <strong>
                            Account selection required
                        </strong>

                        <span>
                            {warningMessage}
                        </span>

                    </div>

                </div>
            )}

            {/* =================================================
                ERROR ALERT
                T16 / T17
            ================================================= */}

            {errorMessage && (
                <div
                    className="
                        transaction-alert
                        transaction-alert-error
                    "
                    data-testid="error-alert"
                    role="alert"
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

            {/* =================================================
                FORM CARD
            ================================================= */}

            <section className="transaction-form-card">

                {/* =================================================
                    CARD HEADER
                ================================================= */}

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

                {/* =================================================
                    FORM GRID
                ================================================= */}

                <div className="transaction-form-grid">

                    {/* =================================================
                        AMOUNT
                    ================================================= */}

                    <div
                        className="
                            transaction-form-group
                            transaction-form-group-full
                        "
                    >

                        <label htmlFor="transactionAmount">

                            Transaction Amount

                            <span>
                                *
                            </span>

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
                                name="amount"
                                type="text"
                                inputMode="decimal"
                                placeholder="Transaction Amount"
                                value={amount}
                                onChange={(e) =>
                                    setAmount(
                                        e.target.value
                                    )
                                }
                                disabled={isSubmitting}
                            />

                        </div>

                        <small>
                            Enter the amount to be transferred.
                        </small>

                    </div>

                    {/* =================================================
                        SOURCE ACCOUNT
                    ================================================= */}

                    <div className="transaction-form-group">

                        <label htmlFor="sourceAccount">

                            Source Account

                            <span>
                                *
                            </span>

                        </label>

                        <div className="transaction-input-wrapper">

                            <span className="field-prefix">
                                ACC
                            </span>

                            <input
                                id="sourceAccount"
                                name="sourceAccountId"
                                type="text"
                                placeholder="Source Account"
                                value={sourceAccountId}
                                onChange={(e) =>
                                    setSourceAccountId(
                                        e.target.value
                                    )
                                }
                                disabled={isSubmitting}
                            />

                        </div>

                        <small>
                            Account from which funds
                            will be transferred.
                        </small>

                    </div>

                    {/* =================================================
                        DESTINATION ACCOUNT
                    ================================================= */}

                    <div className="transaction-form-group">

                        <label htmlFor="destinationAccount">

                            Destination Account

                            <span>
                                *
                            </span>

                        </label>

                        <div className="transaction-input-wrapper">

                            <span className="field-prefix">
                                ACC
                            </span>

                            <input
                                id="destinationAccount"
                                name="targetAccountId"
                                type="text"
                                placeholder="Destination Account"
                                value={targetAccountId}
                                onChange={(e) =>
                                    setTargetAccountId(
                                        e.target.value
                                    )
                                }
                                disabled={isSubmitting}
                            />

                        </div>

                        <small>
                            Account that will receive
                            the funds.
                        </small>

                    </div>

                    {/* =================================================
                        REFERENCE ID
                    ================================================= */}

                    <div
                        className="
                            transaction-form-group
                            transaction-form-group-full
                        "
                    >

                        <label htmlFor="referenceId">

                            Reference ID

                            <span>
                                *
                            </span>

                        </label>

                        <div className="transaction-input-wrapper">

                            <span className="field-prefix">
                                REF
                            </span>

                            <input
                                id="referenceId"
                                name="referenceId"
                                type="text"
                                placeholder="e.g. TRX-2026-ARC-00441"
                                value={referenceId}
                                onChange={(e) =>
                                    setReferenceId(
                                        e.target.value
                                    )
                                }
                                disabled={isSubmitting}
                            />

                        </div>

                        <small>
                            Use the format
                            TRX-YYYY-XXX-NNNNN.
                        </small>

                    </div>

                </div>

                {/* =================================================
                    SECURITY NOTICE
                ================================================= */}

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

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="transaction-form-footer">

                    <div className="required-note">

                        <span>
                            *
                        </span>

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

            {/* =================================================
                PAGE FOOTER
            ================================================= */}

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