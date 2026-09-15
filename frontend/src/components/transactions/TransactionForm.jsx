import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAccounts } from "../../services/accountService";
import "./TransactionForm.css";

const API_BASE_URL = "http://localhost:8080";
const TRANSACTION_ENDPOINT = "/api/transactions";

const SUCCESS_MESSAGE =
    "Transaction Logged Successfully";

const SESSION_EXPIRED_MESSAGE =
    "Session expired";

const SERVER_ERROR_MESSAGE =
    "Unable to process transaction. Please try again.";

const REFERENCE_PATTERN =
    /^TRX-[0-9]{4}-[A-Z]{3}-[0-9]{5}$/;

const TransactionForm = () => {
    // =========================================================
    // FORM STATE
    // =========================================================

    const [amount, setAmount] = useState("");
    const [sourceAccountId, setSourceAccountId] = useState("");
    const [targetAccountId, setTargetAccountId] = useState("");
    const [referenceId, setReferenceId] = useState("");

    // =========================================================
    // ACCOUNT STATE
    // =========================================================

    const [accounts, setAccounts] = useState([]);
    const [accountsLoading, setAccountsLoading] = useState(false);

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
    // INITIAL AXIOS CONFIGURATION
    // =========================================================

    useEffect(() => {
        axios.defaults.baseURL = API_BASE_URL;

        const token =
            localStorage.getItem("token");

        if (token) {
            axios.defaults.headers.common.Authorization =
                `Bearer ${token}`;
        }
    }, []);

    // =========================================================
    // LOAD ACCOUNTS
    // =========================================================

    useEffect(() => {
        let mounted = true;

        const loadAccounts = async () => {
            setAccountsLoading(true);

            try {
                const token =
                    localStorage.getItem("token");

                if (token) {
                    axios.defaults.baseURL =
                        API_BASE_URL;

                    axios.defaults.headers.common.Authorization =
                        `Bearer ${token}`;
                }

                const response =
                    await getAccounts();

                const accountData =
                    Array.isArray(response)
                        ? response
                        : response?.content || [];

                if (mounted) {
                    setAccounts(
                        Array.isArray(accountData)
                            ? accountData
                            : []
                    );
                }
            } catch (error) {
                console.error(
                    "Unable to load accounts:",
                    error
                );

                if (mounted) {
                    setAccounts([]);
                }
            } finally {
                if (mounted) {
                    setAccountsLoading(false);
                }
            }
        };

        loadAccounts();

        return () => {
            mounted = false;
        };
    }, []);

    // =========================================================
    // SUCCESS ALERT AUTO DISMISS
    // T19
    // =========================================================

    useEffect(() => {
        if (!successMessage) {
            return undefined;
        }

        const timer = setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

        return () => {
            clearTimeout(timer);
        };
    }, [successMessage]);

    // =========================================================
    // ROLE
    // =========================================================

    const getCurrentRole = () => {
        const storedRole =
            localStorage.getItem("role");

        if (!storedRole) {
            return "";
        }

        return String(storedRole)
            .trim()
            .toUpperCase()
            .replace(/^ROLE_/, "");
    };

    const currentRole =
        getCurrentRole();

    const canCreateTransaction =
        currentRole === "TREASURER" ||
        currentRole === "ADMIN";

    // =========================================================
    // CLEAR MESSAGES
    // =========================================================

    const clearMessages = () => {
        setSuccessMessage("");
        setWarningMessage("");
        setErrorMessage("");
    };

    // =========================================================
    // ACCOUNT RESOLUTION
    // =========================================================

    const resolveAccountId = (value) => {
        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {
            return null;
        }

        const normalized =
            String(value).trim();

        // Numeric ID
        if (/^\d+$/.test(normalized)) {
            return Number(normalized);
        }

        // Search loaded account information
        const account =
            accounts.find((item) => {
                const candidates = [
                    item?.id,
                    item?.accountId,
                    item?.accountName,
                    item?.name,
                    item?.accountNumber
                ];

                return candidates.some(
                    (candidate) =>
                        candidate !== null &&
                        candidate !== undefined &&
                        String(candidate)
                            .trim()
                            .toLowerCase() ===
                        normalized.toLowerCase()
                );
            });

        if (!account) {
            return null;
        }

        return (
            account?.id ??
            account?.accountId ??
            null
        );
    };

    // =========================================================
    // HANDLE SUBMIT
    // =========================================================

    const handleSubmit = async (event) => {
        if (event?.preventDefault) {
            event.preventDefault();
        }

        clearMessages();

        // =====================================================
        // TOKEN CHECK
        // T17
        // =====================================================

        const token =
            localStorage.getItem("token");

        if (!token) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user");

            setErrorMessage(
                SESSION_EXPIRED_MESSAGE
            );

            return;
        }

        // =====================================================
        // AMOUNT VALIDATION
        // =====================================================

        const amountValue =
            String(amount || "").trim();

        if (!amountValue) {
            setErrorMessage(
                "Transaction amount must be greater than zero."
            );

            return;
        }

        const numericAmount =
            Number(amountValue);

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {
            setErrorMessage(
                "Transaction amount must be greater than zero."
            );

            return;
        }

        // =====================================================
        // REFERENCE ID
        // =====================================================

        const trimmedReferenceId =
            String(referenceId || "").trim();

        if (!trimmedReferenceId) {
            setErrorMessage(
                "Reference ID is required."
            );

            return;
        }

        if (
            !REFERENCE_PATTERN.test(
                trimmedReferenceId
            )
        ) {
            setErrorMessage(
                "Reference ID must use the format TRX-YYYY-XXX-NNNNN."
            );

            return;
        }

        // =====================================================
        // ACCOUNT HANDLING
        // =====================================================

        const sourceValue =
            String(sourceAccountId || "").trim();

        const targetValue =
            String(targetAccountId || "").trim();

        /*
         * Resolve account names when account information
         * is available.
         *
         * Numeric IDs remain exactly as entered.
         */

        const resolvedSource =
            resolveAccountId(sourceValue);

        const resolvedTarget =
            resolveAccountId(targetValue);

        /*
         * If account data has actually been loaded,
         * prevent an invalid account selection.
         *
         * When account data is unavailable, the backend
         * remains the authoritative validator.
         */

        if (
            accounts.length > 0 &&
            (
                resolvedSource === null ||
                resolvedTarget === null
            )
        ) {
            setErrorMessage(
                "Unable to find the selected account. Please select a valid account."
            );

            return;
        }

        const finalSource =
            resolvedSource !== null
                ? String(resolvedSource)
                : sourceValue;

        const finalTarget =
            resolvedTarget !== null
                ? String(resolvedTarget)
                : targetValue;

        // Same-account protection
        if (
            finalSource &&
            finalTarget &&
            finalSource === finalTarget
        ) {
            setErrorMessage(
                "Source and destination accounts cannot be the same."
            );

            return;
        }

        // =====================================================
        // T14 — EXACT PAYLOAD
        // =====================================================

        const transactionData = {
            amount: amountValue,
            sourceAccountId: finalSource,
            targetAccountId: finalTarget,
            referenceId: trimmedReferenceId
        };

        // =====================================================
        // AXIOS CONFIGURATION
        // =====================================================

        axios.defaults.baseURL =
            API_BASE_URL;

        axios.defaults.headers.common.Authorization =
            `Bearer ${token}`;

        axios.defaults.headers.common["Content-Type"] =
            "application/json";

        setIsSubmitting(true);

        try {
            // =================================================
            // T14
            // CREATE TRANSACTION
            // =================================================

            await axios.post(
                TRANSACTION_ENDPOINT,
                transactionData
            );

            // =================================================
            // T18
            // SUCCESS
            // =================================================

            setSuccessMessage(
                SUCCESS_MESSAGE
            );

            setWarningMessage("");
            setErrorMessage("");

            // =================================================
            // RESET FORM
            // =================================================

            setAmount("");
            setSourceAccountId("");
            setTargetAccountId("");
            setReferenceId("");

        } catch (error) {
            console.error(
                "Transaction creation failed:",
                error
            );

            const status =
                error?.response?.status;

            // =================================================
            // T17 — 401
            // =================================================

            if (status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("user");

                setErrorMessage(
                    SESSION_EXPIRED_MESSAGE
                );

                return;
            }

            // =================================================
            // 403
            // =================================================

            if (status === 403) {
                setErrorMessage(
                    "You are not authorized to create transactions."
                );

                return;
            }

            // =================================================
            // T16 — 500
            // =================================================

            if (status === 500) {
                setErrorMessage(
                    SERVER_ERROR_MESSAGE
                );

                return;
            }

            // =================================================
            // BACKEND ERROR MESSAGE
            // =================================================

            const responseData =
                error?.response?.data;

            if (
                typeof responseData === "string" &&
                responseData.trim()
            ) {
                setErrorMessage(
                    responseData.trim()
                );

                return;
            }

            if (
                responseData &&
                typeof responseData.message === "string" &&
                responseData.message.trim()
            ) {
                setErrorMessage(
                    responseData.message.trim()
                );

                return;
            }

            // =================================================
            // GENERIC ERROR
            // =================================================

            setErrorMessage(
                SERVER_ERROR_MESSAGE
            );

        } finally {
            setIsSubmitting(false);
        }
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
                ROLE NOTICE
            ================================================= */}

            {!canCreateTransaction && (
                <div
                    className="
                        transaction-alert
                        transaction-alert-warning
                    "
                    role="alert"
                >

                    <div className="alert-icon">
                        !
                    </div>

                    <div>

                        <strong>
                            Restricted access
                        </strong>

                        <span>
                            Only Treasurer and Admin users
                            can create financial transactions.
                        </span>

                    </div>

                </div>
            )}

            {/* =================================================
                FORM CARD
            ================================================= */}

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
                            <span>*</span>
                        </label>

                        <div className="transaction-input-wrapper">

                            <span className="field-prefix">
                                ACC
                            </span>

                            <input
                                id="sourceAccount"
                                name="sourceAccountId"
                                type="text"
                                placeholder={
                                    accountsLoading
                                        ? "Loading accounts..."
                                        : "Source Account"
                                }
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
                            Enter the source account ID
                            or account name.
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
                                name="targetAccountId"
                                type="text"
                                placeholder={
                                    accountsLoading
                                        ? "Loading accounts..."
                                        : "Destination Account"
                                }
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
                            Enter the destination account ID
                            or account name.
                        </small>

                    </div>

                    {/* =================================================
                        REFERENCE ID
                        T30
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
                                name="referenceId"
                                type="text"
                                placeholder="e.g. TRX-2026-ARC-00441"
                                pattern="TRX-[0-9]{4}-[A-Z]{3}-[0-9]{5}"
                                required
                                value={referenceId}
                                onChange={(e) =>
                                    setReferenceId(
                                        e.target.value
                                    )
                                }
                                disabled={isSubmitting}
                                title="Use the format TRX-YYYY-XXX-NNNNN."
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