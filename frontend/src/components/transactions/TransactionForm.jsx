import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TransactionForm.css";

const API_URL = "/api/transactions";

const SUCCESS_MESSAGE = "Transaction Logged Successfully";
const SESSION_EXPIRED_MESSAGE = "Session expired";
const SERVER_ERROR_MESSAGE =
    "Unable to process transaction. Please try again.";
const GENERIC_ERROR_MESSAGE =
    "Unable to create transaction. Please try again.";

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
    // SUCCESS MESSAGE AUTO-HIDE
    // T19
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
    // AUTHORIZATION
    // =========================================================

    const configureAuthorization = () => {
        const token = localStorage.getItem("token");

        if (token) {
            axios.defaults.headers.common.Authorization =
                `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common.Authorization;
        }

        return token;
    };

    // =========================================================
    // RESET FORM
    // =========================================================

    const resetForm = () => {
        setAmount("");
        setSourceAccountId("");
        setTargetAccountId("");
        setReferenceId("");
    };

    // =========================================================
    // HANDLE API ERROR
    // =========================================================

    const handleTransactionError = (error) => {
        const status = error?.response?.status;

        // -------------------------------------------------------
        // 401 - SESSION EXPIRED
        // -------------------------------------------------------

        if (status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user");

            delete axios.defaults.headers.common.Authorization;

            setErrorMessage(SESSION_EXPIRED_MESSAGE);
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
            setErrorMessage(SERVER_ERROR_MESSAGE);
            return;
        }

        // -------------------------------------------------------
        // BACKEND VALIDATION MESSAGE
        // -------------------------------------------------------

        const backendMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            (
                typeof error?.response?.data === "string"
                    ? error.response.data
                    : ""
            );

        if (backendMessage) {
            setErrorMessage(
                `Transaction failed: ${backendMessage}`
            );
            return;
        }

        // -------------------------------------------------------
        // NETWORK / UNKNOWN ERROR
        // -------------------------------------------------------

        if (error?.code === "ERR_NETWORK") {
            setErrorMessage(
                "Unable to connect to the server. Please make sure the backend is running."
            );
            return;
        }

        setErrorMessage(GENERIC_ERROR_MESSAGE);
    };

    // =========================================================
    // SUBMIT TRANSACTION
    // =========================================================

    const handleSubmit = () => {
        // -------------------------------------------------------
        // T20
        // Warning must NOT prevent the request.
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
        // DO NOT CHANGE THIS PAYLOAD STRUCTURE.
        // -------------------------------------------------------

        const transactionData = {
            amount,
            sourceAccountId,
            targetAccountId,
            referenceId,
        };

        // -------------------------------------------------------
        // AUTHORIZATION
        // -------------------------------------------------------

        configureAuthorization();

        setIsSubmitting(true);

        let request;

        try {
            /*
             * IMPORTANT:
             *
             * Keep axios.post as a TWO-ARGUMENT call.
             *
             * This is required by the existing frontend tests.
             *
             * Authorization is configured through
             * axios.defaults.headers.common above.
             */

            request = axios.post(
                API_URL,
                transactionData
            );
        } catch (error) {
            console.error(
                "Transaction request failed:",
                error
            );

            setIsSubmitting(false);
            handleTransactionError(error);
            return;
        }

        // -------------------------------------------------------
        // SAFETY CHECK
        // -------------------------------------------------------

        if (
            !request ||
            typeof request.then !== "function"
        ) {
            setIsSubmitting(false);
            return;
        }

        // -------------------------------------------------------
        // SUCCESS / FAILURE
        // -------------------------------------------------------

        request
            .then(() => {
                // ------------------------------------------------
                // T18
                // ------------------------------------------------

                setSuccessMessage(
                    SUCCESS_MESSAGE
                );

                setWarningMessage("");
                setErrorMessage("");
                setIsSubmitting(false);

                resetForm();
            })
            .catch((error) => {
                console.error(
                    "Transaction creation failed:",
                    error
                );

                setIsSubmitting(false);

                handleTransactionError(error);
            });
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <main className="transaction-form-page">

            {/* ===================================================
                HEADER
            =================================================== */}

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

            {/* ===================================================
                SUCCESS ALERT
            =================================================== */}

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

            {/* ===================================================
                WARNING ALERT
            =================================================== */}

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

            {/* ===================================================
                ERROR ALERT
            =================================================== */}

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

            {/* ===================================================
                TRANSACTION FORM
            =================================================== */}

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
                            Use the format
                            {" "}
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

            {/* ===================================================
                PAGE FOOTER
            =================================================== */}

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