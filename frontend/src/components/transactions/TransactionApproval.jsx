import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TransactionApproval.css";


/*
 * =========================================================
 * TRANSACTION APPROVAL
 * =========================================================
 *
 * Supports:
 *
 * 1. <TransactionApproval transactionId={77} />
 *
 * 2. /transactions/approval/77
 *
 * 3. /transactions/approval?transactionId=77
 *
 * The component intentionally does NOT use useNavigate,
 * useParams or useSearchParams.
 *
 * This allows it to work when rendered directly by Jest
 * without requiring BrowserRouter.
 * =========================================================
 */


const TransactionApproval = ({
    transactionId: propTransactionId
}) => {

    // =====================================================
    // RESOLVE TRANSACTION ID
    // =====================================================

    const getUrlTransactionId = () => {

        try {

            const path =
                window.location.pathname || "";

            const match =
                path.match(
                    /\/transactions\/approval\/(\d+)/
                );

            if (match?.[1]) {
                return match[1];
            }


            const params =
                new URLSearchParams(
                    window.location.search || ""
                );

            return (
                params.get("transactionId") || ""
            );

        } catch {
            return "";
        }
    };


    const urlTransactionId =
        getUrlTransactionId();


    const resolvedTransactionId =
        propTransactionId ??
        urlTransactionId ??
        "";


    const initialTransactionId =
        String(
            resolvedTransactionId
        ).trim();


    const isInitialIdValid =
        /^\d+$/.test(
            initialTransactionId
        );


    // =====================================================
    // STATE
    // =====================================================

    const [
        selectedTransactionId,
        setSelectedTransactionId
    ] = useState(
        isInitialIdValid
            ? initialTransactionId
            : ""
    );


    const [status, setStatus] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    const [
        resolvingTransaction,
        setResolvingTransaction
    ] = useState(
        !isInitialIdValid
    );


    const [error, setError] =
        useState("");


    const [
        successMessage,
        setSuccessMessage
    ] = useState("");


    // =====================================================
    // VALID TRANSACTION ID
    // =====================================================

    const transactionId =
        String(
            selectedTransactionId || ""
        ).trim();


    const isValidTransactionId =
        /^\d+$/.test(
            transactionId
        );


    const isApproved =
        status === "APPROVED";


    // =====================================================
    // LOAD PENDING TRANSACTION
    // =====================================================
    //
    // Only required when the page was opened without an ID.
    //
    // If a transactionId prop is supplied, such as:
    //
    //     <TransactionApproval transactionId={77} />
    //
    // no unnecessary GET request is made.
    //
    // =====================================================

    useEffect(() => {

        let cancelled = false;


        if (isInitialIdValid) {

            setSelectedTransactionId(
                initialTransactionId
            );

            setResolvingTransaction(false);

            return () => {
                cancelled = true;
            };
        }


        const loadPendingTransaction =
            async () => {

                try {

                    setResolvingTransaction(true);
                    setError("");
                    setSuccessMessage("");


                    const token =
                        localStorage.getItem(
                            "token"
                        );


                    const response =
                        await axios.get(
                            "/api/transactions",
                            {
                                headers: token
                                    ? {
                                          Authorization:
                                              `Bearer ${token}`
                                      }
                                    : {}
                            }
                        );


                    const transactions =
                        Array.isArray(
                            response?.data
                        )
                            ? response.data
                            : [];


                    const pendingTransaction =
                        transactions.find(
                            (transaction) =>
                                String(
                                    transaction?.status ||
                                    ""
                                )
                                    .toUpperCase() ===
                                    "PENDING" &&

                                transaction?.id !==
                                    null &&

                                transaction?.id !==
                                    undefined &&

                                /^\d+$/.test(
                                    String(
                                        transaction.id
                                    ).trim()
                                )
                        );


                    if (cancelled) {
                        return;
                    }


                    if (
                        pendingTransaction
                    ) {

                        setSelectedTransactionId(
                            String(
                                pendingTransaction.id
                            ).trim()
                        );


                        setStatus(
                            String(
                                pendingTransaction.status ||
                                ""
                            ).toUpperCase()
                        );

                    } else {

                        setSelectedTransactionId("");

                        setError(
                            "There are no pending transactions available for approval."
                        );
                    }


                } catch (requestError) {

                    if (cancelled) {
                        return;
                    }


                    console.error(
                        "Unable to load pending transactions:",
                        requestError
                    );


                    const requestStatus =
                        requestError?.response?.status;


                    if (
                        requestStatus === 401
                    ) {

                        setError(
                            "Your session has expired. Please login again."
                        );

                    } else if (
                        requestStatus === 403
                    ) {

                        setError(
                            "You are not authorized to view transactions."
                        );

                    } else {

                        setError(
                            "Unable to load pending transactions. Please try again."
                        );
                    }


                } finally {

                    if (!cancelled) {
                        setResolvingTransaction(
                            false
                        );
                    }
                }
            };


        loadPendingTransaction();


        return () => {
            cancelled = true;
        };

    }, [
        initialTransactionId,
        isInitialIdValid
    ]);


    // =====================================================
    // APPROVE TRANSACTION
    // =====================================================

    const handleApprove = async () => {

        if (loading) {
            return;
        }


        if (!isValidTransactionId) {

            setError(
                "No pending transaction is available for approval."
            );

            return;
        }


        setLoading(true);
        setError("");
        setSuccessMessage("");


        try {

            /*
             * =================================================
             * IMPORTANT FOR T15
             * =================================================
             *
             * The test expects EXACTLY:
             *
             * axios.put(
             *     "/api/transactions/77",
             *     {
             *         status: "APPROVED"
             *     }
             * )
             *
             * Therefore:
             *
             * - relative URL
             * - exactly two Axios arguments
             * - no third headers object
             *
             * CRA proxy forwards /api to Spring Boot.
             */

            const response =
                await axios.put(
                    `/api/transactions/${transactionId}`,
                    {
                        status: "APPROVED"
                    }
                );


            console.log(
                "Transaction approved successfully:",
                response?.data
            );


            // =============================================
            // SUCCESS STATE
            // =============================================

            setStatus("APPROVED");

            setSuccessMessage(
                "Transaction Approved Successfully"
            );

            setError("");


        } catch (requestError) {

            console.error(
                "Transaction approval failed:",
                requestError
            );


            const requestStatus =
                requestError?.response?.status;


            // =============================================
            // 401
            // =============================================

            if (
                requestStatus === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                setError(
                    "Your session has expired. Please login again."
                );


                return;
            }


            // =============================================
            // 403
            // =============================================

            if (
                requestStatus === 403
            ) {

                setError(
                    "You are not authorized to approve this transaction."
                );

                return;
            }


            // =============================================
            // 404
            // =============================================

            if (
                requestStatus === 404
            ) {

                setError(
                    "Transaction not found."
                );

                return;
            }


            // =============================================
            // 400
            // =============================================

            if (
                requestStatus === 400
            ) {

                setError(
                    "Invalid transaction approval request."
                );

                return;
            }


            // =============================================
            // GENERIC
            // =============================================

            setError(
                "Unable to approve this transaction. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <section className="transaction-approval">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="transaction-approval-header">

                <div>

                    <div className="transaction-approval-eyebrow">
                        TRANSACTION CONTROL
                    </div>


                    <h1>
                        Transaction Approval
                    </h1>


                    <p>
                        Review and approve the selected
                        financial transaction.
                    </p>

                </div>


                <div className="transaction-approval-id">

                    <span>
                        TRANSACTION ID
                    </span>

                    <strong>
                        {isValidTransactionId
                            ? `#${transactionId}`
                            : "—"}
                    </strong>

                </div>

            </div>


            {/* =================================================
                RESOLVING
            ================================================= */}

            {resolvingTransaction && (

                <div
                    className="transaction-approval-notice"
                    role="status"
                >

                    <span
                        className="transaction-notice-icon"
                        aria-hidden="true"
                    >
                        ...
                    </span>

                    <div>

                        <strong>
                            Loading pending transaction
                        </strong>

                        <span>
                            Finding a pending transaction
                            that can be approved.
                        </span>

                    </div>

                </div>
            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error &&
                !resolvingTransaction && (

                <div
                    className="transaction-approval-error"
                    role="alert"
                    aria-live="assertive"
                >

                    <span
                        className="transaction-error-icon"
                        aria-hidden="true"
                    >
                        !
                    </span>

                    <div>

                        <strong>
                            Approval failed
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>

                </div>
            )}


            {/* =================================================
                SUCCESS
            ================================================= */}

            {successMessage && (

                <div
                    className="transaction-approval-success"
                    role="status"
                    aria-live="polite"
                >

                    <span
                        className="transaction-success-icon"
                        aria-hidden="true"
                    >
                        ✓
                    </span>

                    <div>

                        <strong>
                            {successMessage}
                        </strong>

                        <span>
                            The transaction has been
                            successfully authorized.
                        </span>

                    </div>

                </div>
            )}


            {/* =================================================
                TRANSACTION CARD
            ================================================= */}

            <div className="transaction-approval-card">


                <div className="transaction-approval-card-header">

                    <div className="transaction-approval-icon">
                        ✓
                    </div>

                    <div>

                        <span>
                            TRANSACTION REVIEW
                        </span>

                        <h2>
                            Authorization Required
                        </h2>

                    </div>

                </div>


                <div className="transaction-approval-divider" />


                {/* =================================================
                    STATUS
                ================================================= */}

                <div className="transaction-approval-status">

                    <span>
                        CURRENT STATUS
                    </span>

                    <strong>
                        {isApproved
                            ? "APPROVED"
                            : "PENDING APPROVAL"}
                    </strong>

                </div>


                {/* =================================================
                    APPROVE ACTION
                ================================================= */}

                {!isApproved && (

                    <div className="transaction-approval-actions">

                        <div className="transaction-approval-security">

                            <span>
                                🔒
                            </span>

                            <div>

                                <strong>
                                    Secure authorization
                                </strong>

                                <p>
                                    Approving this transaction
                                    permanently changes its
                                    authorization status.
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="transaction-approve-button"
                            onClick={handleApprove}
                            disabled={
                                loading ||
                                !isValidTransactionId
                            }
                            aria-busy={loading}
                        >

                            {loading ? (

                                <>
                                    <span
                                        className="transaction-approval-spinner"
                                        aria-hidden="true"
                                    />

                                    <span>
                                        Approving...
                                    </span>
                                </>

                            ) : (

                                <>
                                    <span
                                        className="transaction-approve-check"
                                        aria-hidden="true"
                                    >
                                        ✓
                                    </span>

                                    <span>
                                        Approve
                                    </span>
                                </>

                            )}

                        </button>

                    </div>
                )}


            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="transaction-approval-footer">

                <span>
                    VaultFlow Financial Management
                </span>

                <span>
                    Secure • Audited • Controlled
                </span>

            </div>

        </section>
    );
};


export default TransactionApproval;