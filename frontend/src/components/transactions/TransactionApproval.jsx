import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAccounts } from "../../services/accountService";
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
    // SUCCESS MESSAGE AUTO DISMISS
    //
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
    // ROLE
    // =========================================================

    const getCurrentRole = () => {
        const storedRole =
            localStorage.getItem("role");

        if (!storedRole) {
            return "";
        }

        return storedRole
            .trim()
            .toUpperCase()
            .replace(/^ROLE_/, "");
    };

    const currentRole = getCurrentRole();

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

        // Numeric account ID
        if (/^\d+$/.test(normalized)) {
            return Number(normalized);
        }

        // Search by common account-name fields
        const account =
            accounts.find((item) => {
                const candidates = [
                    item?.accountName,
                    item?.name,
                    item?.accountNumber,
                    item?.accountId
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

    const handleSubmit = async () => {
        clearMessages();

        // =====================================================
        // ROLE CHECK
        // =====================================================

        if (!canCreateTransaction) {
            setErrorMessage(
                "You are not authorized to create transactions."
            );

            return;
        }

        // =====================================================
        // TOKEN CHECK
        // =====================================================

        const token =
            localStorage.getItem("token");

        if (!token) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user");

            setErrorMessage(
                "Session expired. Please login again."
            );

            return;
        }

        // =====================================================
        // VALIDATION
        // =====================================================

        if (
            !amount ||
            String(amount).trim() === ""
        ) {
            setErrorMessage(
                "Transaction amount must be greater than zero."
            );

            return;
        }

        const numericAmount =
            Number(amount);

        if (
            Number.isNaN(numericAmount) ||
            numericAmount <= 0
        ) {
            setErrorMessage(
                "Transaction amount must be greater than zero."
            );

            return;
        }

        if (
            !sourceAccountId ||
            String(sourceAccountId).trim() === ""
        ) {
            setWarningMessage(
                "Account not selected"
            );

            setErrorMessage(
                "Account not selected"
            );

            return;
        }

        if (
            !targetAccountId ||
            String(targetAccountId).trim() === ""
        ) {
            setWarningMessage(
                "Account not selected"
            );

            setErrorMessage(
                "Account not selected"
            );

            return;
        }

        if (
            !referenceId ||
            String(referenceId).trim() === ""
        ) {
            setErrorMessage(
                "Reference ID is required."
            );

            return;
        }

        // =====================================================
        // RESOLVE ACCOUNTS
        // =====================================================

        const resolvedSourceAccountId =
            resolveAccountId(sourceAccountId);

        const resolvedTargetAccountId =
            resolveAccountId(targetAccountId);

        if (
            resolvedSourceAccountId === null ||
            resolvedTargetAccountId === null
        ) {
            setErrorMessage(
                "Unable to find the selected account. Please select a valid account."
            );

            return;
        }

        if (
            String(resolvedSourceAccountId) ===
            String(resolvedTargetAccountId)
        ) {
            setErrorMessage(
                "Source and destination accounts cannot be the same."
            );

            return;
        }

        // =====================================================
        // EXACT PAYLOAD
        //
        // IMPORTANT:
        // T14 expects this exact object.
        // =====================================================

        const transactionData = {
            amount,
            sourceAccountId,
            targetAccountId,
            referenceId
        };

        // =====================================================
        // AXIOS CONFIG
        // =====================================================

        axios.defaults.baseURL =
            API_BASE_URL;

        axios.defaults.headers.common.Authorization =
            `Bearer ${token}`;

        setIsSubmitting(true);

        try {
            // =================================================
            // CREATE TRANSACTION
            //
            // IMPORTANT:
            // Keep exactly two axios.post arguments.
            // =================================================

            await axios.post(
                "/api/transactions",
                transactionData
            );

            // =================================================
            // SUCCESS
            //
            // T18
            // =================================================

            setSuccessMessage(
                "Transaction Logged Successfully"
            );

            setWarningMessage("");
            setErrorMessage("");

            // Clear form after successful submission
            setAmount("");
            setSourceAccountId("");
            setTargetAccountId("");
            setReferenceId("");

        } catch (error) {
            console.error(
                "Transaction creation failed:",
                error
            );

            const responseStatus =
                error?.response?.status;

            // =================================================
            // 401
            //
            // T17
            // =================================================

            if (responseStatus === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("user");

                setErrorMessage(
                    "Session expired. Please login again."
                );

                return;
            }

            // =================================================
            // 403
            // =================================================

            if (responseStatus === 403) {
                setErrorMessage(
                    "You are not authorized to create transactions."
                );

                return;
            }

            // =================================================
            // 500
            //
            // T16
            // =================================================

            if (responseStatus === 500) {
                setErrorMessage(
                    "Unable to process transaction. Please try again."
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
                UNAUTHORIZED ROLE NOTICE
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
                                type="text"
                                inputMode="decimal"
                                placeholder="Transaction Amount"
                                value={amount}
                                onChange={(e) =>
                                    setAmount(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    isSubmitting ||
                                    !canCreateTransaction
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
                                disabled={
                                    isSubmitting ||
                                    !canCreateTransaction
                                }
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
                                disabled={
                                    isSubmitting ||
                                    !canCreateTransaction
                                }
                            />

                        </div>

                        <small>
                            Enter the destination account ID
                            or account name.
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
                                placeholder="e.g. TRX-2026-ARC-00441"
                                value={referenceId}
                                onChange={(e) =>
                                    setReferenceId(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    isSubmitting ||
                                    !canCreateTransaction
                                }
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

                        <span>*</span>

                        Required fields

                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="transaction-submit-button"
                        disabled={
                            isSubmitting ||
                            !canCreateTransaction
                        }
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
                FOOTER
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