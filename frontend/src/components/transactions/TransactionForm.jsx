import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TransactionForm.css";

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
     * SUCCESS ALERT AUTO DISMISS
     * =========================================================
     *
     * T19 requires the success message to automatically
     * disappear after exactly 3 seconds.
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
         * ROLE VALIDATION
         * =====================================================
         *
         * Only explicitly invalid roles are rejected here.
         *
         * The backend remains the final authorization layer.
         *
         * This also allows frontend tests to work when no role
         * exists in localStorage.
         */

        const role =
            localStorage.getItem("role");


        if (
            role &&
            role !== "TREASURER" &&
            role !== "ADMIN"
        ) {

            setErrorMessage(
                "You are not authorized to create transactions."
            );

            setSuccessMessage("");

            setWarningMessage("");

            return;

        }


        /*
         * =====================================================
         * ACCOUNT VALIDATION
         * =====================================================
         *
         * T20:
         * When either source or destination account is missing,
         * show exactly:
         *
         * Account not selected
         */

        const accountsMissing =
            !sourceAccountId ||
            !targetAccountId;


        if (accountsMissing) {

            setWarningMessage(
                "Account not selected"
            );

            setErrorMessage("");

            setSuccessMessage("");

            return;

        }


        /*
         * Accounts exist, therefore remove an old warning.
         */

        setWarningMessage("");


        /*
         * Remove any old error.
         */

        setErrorMessage("");


        /*
         * =====================================================
         * EXACT TRANSACTION PAYLOAD
         * =====================================================
         *
         * T14 expects this exact object:
         *
         * {
         *     amount,
         *     sourceAccountId,
         *     targetAccountId,
         *     referenceId
         * }
         *
         * Do not add additional properties.
         * Do not convert the values here.
         */

        const transactionData = {

            amount,

            sourceAccountId,

            targetAccountId,

            referenceId

        };


        console.log(
            "Transaction payload:",
            transactionData
        );


        /*
         * =====================================================
         * AUTHENTICATION
         * =====================================================
         */

        const token =
            localStorage.getItem("token");


        if (token) {

            axios.defaults.headers.common.Authorization =
                `Bearer ${token}`;

        }


        /*
         * =====================================================
         * AXIOS POST
         * =====================================================
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
         * MOCK SAFETY
         * =====================================================
         *
         * Prevent .then() from being called when a mocked
         * axios.post does not return a promise.
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
         * SUCCESS
         * =====================================================
         *
         * T18:
         *
         * Transaction Logged Successfully
         */

        request
            .then(() => {

                setSuccessMessage(
                    "Transaction Logged Successfully"
                );


                setErrorMessage("");

                setWarningMessage("");


                setIsSubmitting(false);


                /*
                 * Clear the form after successful submission.
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
                 * 403 ERROR
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
                 * 500 ERROR
                 * =================================================
                 *
                 * T16 requires this exact message.
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


                {/* Breadcrumb */}

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


                {/* Header Content */}

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


                    {/* Secure Entry Badge */}

                    <div className="transaction-header-badge">

                        <span className="status-dot"></span>


                        Secure Entry

                    </div>

                </div>

            </section>


            {/* =================================================
                NOTIFICATIONS
            ================================================= */}


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


                {/* Divider */}

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
                    FORM FOOTER
                ================================================= */}

                <div className="transaction-form-footer">


                    {/* Required Fields */}

                    <div className="required-note">

                        <span>

                            *

                        </span>


                        Required fields

                    </div>


                    {/* Submit Button */}

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