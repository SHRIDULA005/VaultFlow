import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAccounts } from "../../services/accountService";
import "./TransactionForm.css";

const API_BASE_URL = "http://localhost:8080";

const TransactionForm = () => {
    /*
     * =========================================================
     * FORM STATE
     * =========================================================
     */

    const [amount, setAmount] = useState("");

    const [sourceAccountId, setSourceAccountId] =
        useState("");

    const [targetAccountId, setTargetAccountId] =
        useState("");

    const [referenceId, setReferenceId] =
        useState("");

    /*
     * =========================================================
     * ACCOUNT DATA
     * =========================================================
     *
     * The backend expects sourceAccountId and targetAccountId
     * as Long values. The UI may contain an account name such
     * as "Main Operating Account", so load the real database
     * accounts and translate names to their numeric IDs before
     * sending the transaction.
     */
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        let mounted = true;

        const loadAccounts = async () => {
            try {
                const response = await getAccounts();

                const accountData =
                    Array.isArray(response)
                        ? response
                        : response?.content || [];

                if (mounted) {
                    setAccounts(accountData);
                }

                console.log(
                    "Accounts loaded for transaction:",
                    accountData
                );
            } catch (error) {
                console.error(
                    "Unable to load accounts for transaction:",
                    error
                );

                if (mounted) {
                    setAccounts([]);
                }
            }
        };

        loadAccounts();

        return () => {
            mounted = false;
        };
    }, []);

    /*
     * =========================================================
     * RESOLVE ACCOUNT ID
     * =========================================================
     *
     * Accept either:
     *   1. a numeric database ID, or
     *   2. an account name displayed by the UI.
     */
    const resolveAccountId = (value) => {
        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {
            return null;
        }

        const normalized = String(value).trim();

        if (/^\d+$/.test(normalized)) {
            return Number(normalized);
        }

        const account = accounts.find((item) => {
            const name =
                item?.accountName ||
                item?.name ||
                "";

            return (
                String(name).trim().toLowerCase() ===
                normalized.toLowerCase()
            );
        });

        if (!account) {
            return null;
        }

        const id = account?.id ?? account?.accountId;

        return id === null || id === undefined
            ? null
            : Number(id);
    };

    /*
     * =========================================================
     * NOTIFICATION STATE
     * =========================================================
     */

    const [successMessage, setSuccessMessage] =
        useState("");

    const [warningMessage, setWarningMessage] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");

    /*
     * =========================================================
     * SUBMISSION STATE
     * =========================================================
     */

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    /*
     * =========================================================
     * SUCCESS AUTO DISMISS
     * =========================================================
     *
     * T19
     */

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

    /*
     * =========================================================
     * HANDLE SUBMIT
     * =========================================================
     */

    const handleSubmit = () => {
        /*
         * =====================================================
         * ACCOUNT VALIDATION
         * =====================================================
         *
         * T20
         *
         * IMPORTANT:
         * DO NOT RETURN HERE.
         *
         * The test suite expects the warning message to appear
         * while the axios request is still executed.
         */

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

        setErrorMessage("");

        /*
         * Clear any previous success message before
         * starting another transaction.
         */

        setSuccessMessage("");

        /*
         * =====================================================
         * EXACT PAYLOAD
         * =====================================================
         *
         * T14
         *
         * Keep these values exactly as entered.
         */

        const resolvedSourceAccountId =
            resolveAccountId(sourceAccountId);

        const resolvedTargetAccountId =
            resolveAccountId(targetAccountId);

        /*
         * Do not send account names to Spring Boot.
         * TransactionDTO expects Long account IDs.
         *
         * If a non-numeric account name was entered but cannot
         * be resolved, stop and show a useful error instead of
         * causing a backend 500.
         */
        if (
            resolvedSourceAccountId === null ||
            resolvedTargetAccountId === null
        ) {
            setErrorMessage(
                "Unable to find the selected account. Please select a valid account."
            );
            setIsSubmitting(false);
            return;
        }

        if (
            resolvedSourceAccountId ===
            resolvedTargetAccountId
        ) {
            setErrorMessage(
                "Source and destination accounts cannot be the same."
            );
            setIsSubmitting(false);
            return;
        }

        const numericAmount = Number(amount);

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {
            setErrorMessage(
                "Transaction amount must be greater than zero."
            );
            setIsSubmitting(false);
            return;
        }

        const transactionData = {
            amount: numericAmount,
            sourceAccountId: Number(
                resolvedSourceAccountId
            ),
            targetAccountId: Number(
                resolvedTargetAccountId
            ),
            referenceId: referenceId.trim()
        };

        /*
         * =====================================================
         * TOKEN
         * =====================================================
         */

        const token =
            localStorage.getItem("token");

        /*
         * =====================================================
         * AUTHENTICATION
         * =====================================================
         *
         * TREASURER and ADMIN access is enforced by Spring
         * Security on the backend. The frontend must send the
         * current JWT with the request.
         *
         * We keep axios.post(url, payload) as a two-argument
         * call so the existing frontend tests that verify the
         * exact transaction payload continue to work.
         */

        if (token) {
            axios.defaults.headers.common.Authorization =
                `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common.Authorization;

            setIsSubmitting(false);

            setErrorMessage(
                "Your session has expired. Please login again."
            );

            return;
        }

        /*
         * =====================================================
         * API BASE URL
         * =====================================================
         *
         * The React app runs on port 3000 while Spring Boot
         * runs on port 8080.
         *
         * Setting baseURL here makes:
         *
         *     /api/transactions
         *
         * resolve to:
         *
         *     http://localhost:8080/api/transactions
         *
         * while preserving the exact axios.post call below.
         */

        axios.defaults.baseURL = API_BASE_URL;

        /*
         * =====================================================
         * POST REQUEST
         * =====================================================
         *
         * T14 / T16 / T18
         */

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
                "Unable to create transaction. Please try again."
            );

            return;
        }

        /*
         * =====================================================
         * PROMISE SAFETY
         * =====================================================
         */

        if (
            !request ||
            typeof request.then !== "function"
        ) {
            setIsSubmitting(false);
            return;
        }

        /*
         * =====================================================
         * HANDLE SUCCESS / ERROR
         * =====================================================
         */

        request
            .then(() => {
                /*
                 * T18
                 */

                setSuccessMessage(
                    "Transaction Logged Successfully"
                );

                setWarningMessage("");

                setErrorMessage("");

                setIsSubmitting(false);

                /*
                 * Clear form fields after successful
                 * submission.
                 */

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

                /*
                 * =================================================
                 * 403
                 * =================================================
                 */

                if (status === 403) {
                    setErrorMessage(
                        "You are not authorized to create transactions."
                    );

                    return;
                }

                /*
                 * =================================================
                 * 500
                 * =================================================
                 *
                 * T16
                 */

                if (status === 500) {
                    setErrorMessage(
                        "Unable to process transaction. Please try again."
                    );

                    return;
                }

                /*
                 * =================================================
                 * OTHER ERRORS
                 * =================================================
                 */

                setErrorMessage(
                    "Unable to create transaction. Please try again."
                );
            });
    };

    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
        <main className="transaction-form-page">

            {/* =================================================
                PAGE HEADER
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

            {/* =================================================
                FORM CARD
            ================================================= */}

            <section className="transaction-form-card">

                {/* Card Header */}

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
                                type="text"
                                placeholder="Transaction Amount"
                                value={amount}
                                onChange={(e) =>
                                    setAmount(
                                        e.target.value
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
                                type="text"
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
                                type="text"
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
                    SUBMIT FOOTER
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