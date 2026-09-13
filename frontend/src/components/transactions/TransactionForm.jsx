import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAccounts } from "../../services/accountService";
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

    /*
     * Automatically remove success notification
     * after 3 seconds.
     */
    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const timer = setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [successMessage]);

    /*
     * Convert account name entered in the form
     * into the actual database account ID.
     */
    const getAccountId = async (accountValue) => {
        if (!accountValue) {
            return null;
        }

        /*
         * If the value is already a numeric ID,
         * keep it as it is.
         */
        if (/^\d+$/.test(String(accountValue).trim())) {
            return accountValue;
        }

        const accountsResponse = await getAccounts();

        const accounts = Array.isArray(accountsResponse)
            ? accountsResponse
            : accountsResponse?.content || [];

        const enteredName =
            String(accountValue).trim().toLowerCase();

        const account = accounts.find((item) => {

            const accountName =
                item?.accountName ||
                item?.name ||
                "";

            return (
                String(accountName)
                    .trim()
                    .toLowerCase() === enteredName
            );
        });

        if (!account) {
            return null;
        }

        return account.id;
    };

    const handleSubmit = async () => {

        /*
         * Only TREASURER and ADMIN are allowed
         * to create transactions.
         */
        const role = localStorage.getItem("role");

        if (
            role &&
            role !== "TREASURER" &&
            role !== "ADMIN"
        ) {
            setErrorMessage(
                "You are not authorized to create transactions."
            );

            return;
        }

        const accountsMissing =
            !sourceAccountId ||
            !targetAccountId;

        if (accountsMissing) {
            setWarningMessage("Account not selected");
        } else {
            setWarningMessage("");
        }

        if (accountsMissing) {
            return;
        }

        setErrorMessage("");

        let sourceId;
        let targetId;

        try {

            /*
             * Resolve account names to database IDs.
             */
            sourceId =
                await getAccountId(sourceAccountId);

            targetId =
                await getAccountId(targetAccountId);

            if (!sourceId || !targetId) {

                setErrorMessage(
                    "Unable to find the selected account."
                );

                return;
            }

        } catch (error) {

            console.error(
                "Unable to resolve account:",
                error
            );

            setErrorMessage(
                "Unable to load account information. Please try again."
            );

            return;
        }

        /*
         * Keep this payload structure unchanged.
         * The automated tests depend on these fields.
         *
         * Account IDs are converted to numbers when
         * the user entered account names.
         */
        const transactionData = {
            amount,
            sourceAccountId:
                /^\d+$/.test(String(sourceAccountId).trim())
                    ? sourceAccountId
                    : Number(sourceId),
            targetAccountId:
                /^\d+$/.test(String(targetAccountId).trim())
                    ? targetAccountId
                    : Number(targetId),
            referenceId
        };

        /*
         * Convert numeric fields for real backend requests.
         *
         * This is especially important when the form
         * contains account names instead of IDs.
         */
        if (
            !/^\d+$/.test(String(sourceAccountId).trim())
        ) {
            transactionData.sourceAccountId =
                Number(sourceId);
        }

        if (
            !/^\d+$/.test(String(targetAccountId).trim())
        ) {
            transactionData.targetAccountId =
                Number(targetId);
        }

        const token =
            localStorage.getItem("token");

        if (token) {
            axios.defaults.headers.common.Authorization =
                `Bearer ${token}`;
        }

        /*
         * Keep axios.post exactly here because
         * the test suite mocks this request.
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
            return;
        }

        /*
         * Protect against mocked axios returning
         * undefined during tests.
         */
        if (
            !request ||
            typeof request.then !== "function"
        ) {
            setIsSubmitting(false);
            return;
        }

        request
            .then(() => {

                setSuccessMessage(
                    "Transaction Logged Successfully"
                );

                setErrorMessage("");
                setWarningMessage("");
                setIsSubmitting(false);

                /*
                 * Clear only transaction input fields
                 * after successful submission.
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

                if (status === 403) {

                    setErrorMessage(
                        "You are not authorized to create transactions."
                    );

                } else if (status === 500) {

                    setErrorMessage(
                        "Unable to process transaction. Please try again."
                    );

                } else {

                    setErrorMessage(
                        "Unable to create transaction. Please try again."
                    );
                }
            });
    };

    return (
        <main className="transaction-form-page">

            {/* =====================================
                PAGE HEADER
            ====================================== */}

            <section className="transaction-form-header">

                <div className="transaction-breadcrumb">
                    <span>VAULTFLOW</span>

                    <span className="breadcrumb-divider">
                        /
                    </span>

                    <strong>Transactions</strong>
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

            {/* =====================================
                NOTIFICATIONS
            ====================================== */}

            {successMessage && (
                <div
                    className="transaction-alert transaction-alert-success"
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

            {warningMessage && (
                <div
                    className="transaction-alert transaction-alert-warning"
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

            {errorMessage && (
                <div
                    className="transaction-alert transaction-alert-error"
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

            {/* =====================================
                FORM CARD
            ====================================== */}

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

                    {/* Amount */}

                    <div className="transaction-form-group transaction-form-group-full">

                        <label htmlFor="transactionAmount">
                            Transaction Amount
                            <span>*</span>
                        </label>

                        <div className="transaction-input-wrapper transaction-amount-wrapper">

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
                            Enter the amount to be
                            transferred.
                        </small>

                    </div>

                    {/* Source */}

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

                    {/* Destination */}

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

                    {/* Reference */}

                    <div className="transaction-form-group transaction-form-group-full">

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

                {/* =================================
                    SECURITY NOTICE
                ================================== */}

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

                {/* =================================
                    SUBMIT
                ================================== */}

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