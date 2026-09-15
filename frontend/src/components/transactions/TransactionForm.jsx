import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TransactionForm.css";

const API_BASE_URL = "http://localhost:8080";
const TRANSACTION_ENDPOINT = "/api/transactions";

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

    const [successMessage, setSuccessMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // =========================================================
    // SUCCESS MESSAGE
    // T19 - hide after 3 seconds
    // =========================================================

    useEffect(() => {
        if (!successMessage) {
            return undefined;
        }

        const timer = setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [successMessage]);

    // =========================================================
    // AUTHENTICATION
    // =========================================================

    const configureAxios = () => {
        const token = localStorage.getItem("token");

        // -------------------------------------------------------
        // IMPORTANT:
        // Send API requests to Spring Boot on port 8080.
        //
        // We keep axios.post("/api/transactions", payload)
        // unchanged because the existing tests expect that call.
        // -------------------------------------------------------

        axios.defaults.baseURL = API_BASE_URL;

        if (token) {
            axios.defaults.headers.common.Authorization =
                `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common.Authorization;
        }

        return token;
    };

    // =========================================================
    // ERROR HANDLER
    // =========================================================

    const handleError = (error) => {
        const status = error?.response?.status;

        // -------------------------------------------------------
        // 401 - SESSION EXPIRED
        // -------------------------------------------------------

        if (status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user");

            delete axios.defaults.headers.common.Authorization;

            setErrorMessage("Session expired");
            return;
        }

        // -------------------------------------------------------
        // 403 - FORBIDDEN
        // -------------------------------------------------------

        if (status === 403) {
            setErrorMessage(
                "You are not authorized to create transactions."
            );
            return;
        }

        // -------------------------------------------------------
        // 500 - SERVER ERROR
        // T16
        // -------------------------------------------------------

        if (status === 500) {
            setErrorMessage(
                "Unable to process transaction. Please try again."
            );
            return;
        }

        // -------------------------------------------------------
        // BACKEND ERROR MESSAGE
        // -------------------------------------------------------

        const backendMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error;

        if (backendMessage) {
            setErrorMessage(
                `Transaction failed: ${backendMessage}`
            );
            return;
        }

        // -------------------------------------------------------
        // STRING RESPONSE
        // -------------------------------------------------------

        if (
            typeof error?.response?.data === "string" &&
            error.response.data.trim()
        ) {
            setErrorMessage(
                `Transaction failed: ${error.response.data}`
            );
            return;
        }

        // -------------------------------------------------------
        // NETWORK ERROR
        // -------------------------------------------------------

        if (error?.code === "ERR_NETWORK") {
            setErrorMessage(
                "Unable to connect to the backend server. Please make sure Spring Boot is running on port 8080."
            );
            return;
        }

        // -------------------------------------------------------
        // GENERIC
        // -------------------------------------------------------

        setErrorMessage(
            "Unable to create transaction. Please try again."
        );
    };

    // =========================================================
    // SUBMIT TRANSACTION
    // =========================================================

    const handleSubmit = () => {

        // -------------------------------------------------------
        // T20
        // Show warning but DO NOT stop the request.
        // -------------------------------------------------------

        if (!sourceAccountId || !targetAccountId) {
            setWarningMessage("Account not selected");
        } else {
            setWarningMessage("");
        }

        setErrorMessage("");
        setSuccessMessage("");

        // -------------------------------------------------------
        // T14
        // KEEP THIS PAYLOAD EXACTLY AS REQUIRED BY THE TESTS.
        // -------------------------------------------------------

        const transactionData = {
            amount,
            sourceAccountId,
            targetAccountId,
            referenceId,
        };

        // -------------------------------------------------------
        // CONFIGURE BACKEND + JWT
        // -------------------------------------------------------

        configureAxios();

        setIsSubmitting(true);

        let request;

        try {

            /*
             * IMPORTANT
             *
             * DO NOT change this to:
             *
             * axios.post(
             *     "http://localhost:8080/api/transactions",
             *     transactionData
             * )
             *
             * because T14 expects the exact URL:
             *
             * /api/transactions
             *
             * Instead, axios.defaults.baseURL above makes
             * the actual browser request:
             *
             * http://localhost:8080/api/transactions
             */

            request = axios.post(
                TRANSACTION_ENDPOINT,
                transactionData
            );

        } catch (error) {

            console.error(
                "Transaction request failed:",
                error
            );

            setIsSubmitting(false);
            handleError(error);

            return;
        }

        // -------------------------------------------------------
        // SAFETY
        // -------------------------------------------------------

        if (
            !request ||
            typeof request.then !== "function"
        ) {
            setIsSubmitting(false);
            return;
        }

        // -------------------------------------------------------
        // HANDLE SUCCESS
        // -------------------------------------------------------

        request
            .then(() => {

                // T18
                setSuccessMessage(
                    "Transaction Logged Successfully"
                );

                setWarningMessage("");
                setErrorMessage("");
                setIsSubmitting(false);

                // Clear form after successful transaction
                setAmount("");
                setSourceAccountId("");
                setTargetAccountId("");
                setReferenceId("");
            })

            // ---------------------------------------------------
            // HANDLE ERROR
            // ---------------------------------------------------

            .catch((error) => {

                console.error(
                    "Transaction creation failed:",
                    error
                );

                setIsSubmitting(false);

                handleError(error);
            });
    };

    // =========================================================
    // UI
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
                SUCCESS
            ================================================= */}

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
                            {successMessage}
                        </span>

                    </div>

                </div>
            )}

            {/* =================================================
                WARNING
            ================================================= */}

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
                            {warningMessage}
                        </span>

                    </div>

                </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {errorMessage && (
                <div
                    className="
                        transaction-alert
                        transaction-alert-error
                    "
                    data-testid="error-alert"
                    style={{
                        backgroundColor: "red",
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

            {/* =================================================
                FORM
            ================================================= */}

            <section className="transaction-form-card">

                {/* CARD HEADER */}

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
                                onChange={(event) =>
                                    setAmount(
                                        event.target.value
                                    )
                                }
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
                            <span>*</span>
                        </label>

                        <div className="transaction-input-wrapper">

                            <span className="field-prefix">
                                ACC
                            </span>

                            <input
                                id="sourceAccount"
                                type="text"
                                inputMode="numeric"
                                name="sourceAccountId"
                                placeholder="Source Account"
                                value={sourceAccountId}
                                onChange={(event) =>
                                    setSourceAccountId(
                                        event.target.value
                                    )
                                }
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
                            <span>*</span>
                        </label>

                        <div className="transaction-input-wrapper">

                            <span className="field-prefix">
                                ACC
                            </span>

                            <input
                                id="destinationAccount"
                                type="text"
                                inputMode="numeric"
                                name="targetAccountId"
                                placeholder="Destination Account"
                                value={targetAccountId}
                                onChange={(event) =>
                                    setTargetAccountId(
                                        event.target.value
                                    )
                                }
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
                                onChange={(event) =>
                                    setReferenceId(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                        <small>
                            Use the format TRX-YYYY-XXX-NNNNN.
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