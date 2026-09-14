import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useSearchParams } from "react-router-dom";
import "./TransactionApproval.css";

const API_BASE_URL = "http://localhost:8080/api";

const TransactionApproval = ({ transactionId: propTransactionId }) => {
    const { transactionId: urlTransactionId } = useParams();

    const [searchParams] = useSearchParams();

    const queryTransactionId =
        searchParams.get("transactionId");

    /*
     * ---------------------------------------------------------
     * GET TRANSACTION ID
     * ---------------------------------------------------------
     *
     * Priority:
     *
     * 1. Parent prop
     * 2. URL parameter
     * 3. Query parameter
     *
     * Examples:
     *
     * <TransactionApproval transactionId={15} />
     *
     * /transactions/approval/15
     *
     * /transactions/approval?transactionId=15
     */
    const resolvedTransactionId =
        propTransactionId ||
        urlTransactionId ||
        queryTransactionId ||
        "";


    const initialTransactionId =
        String(resolvedTransactionId).trim();


    const initialTransactionIdIsValid =
        initialTransactionId !== "" &&
        /^\d+$/.test(initialTransactionId);


    const [selectedTransactionId, setSelectedTransactionId] =
        useState(
            initialTransactionIdIsValid
                ? initialTransactionId
                : ""
        );

    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [resolvingTransaction, setResolvingTransaction] =
        useState(!initialTransactionIdIsValid);
    const [error, setError] = useState("");


    /*
     * ---------------------------------------------------------
     * RESOLVE TRANSACTION ID
     * ---------------------------------------------------------
     *
     * The application currently routes the Approvals page as:
     *
     *     /transactions/approval
     *
     * without passing a transactionId.
     *
     * Therefore, when no valid ID is supplied through a prop,
     * URL parameter, or query parameter, fetch the transactions
     * and automatically select the first PENDING transaction.
     *
     * This prevents the approval page from opening with:
     *
     *     "Must receive a valid transactionId"
     *
     * while still supporting direct links such as:
     *
     *     /transactions/approval/15
     *     /transactions/approval?transactionId=15
     */
    useEffect(() => {
        let cancelled = false;


        if (initialTransactionIdIsValid) {
            setSelectedTransactionId(initialTransactionId);
            setResolvingTransaction(false);
            return () => {
                cancelled = true;
            };
        }


        const loadPendingTransaction = async () => {
            const token =
                localStorage.getItem("token");


            if (!token) {
                if (!cancelled) {
                    setResolvingTransaction(false);
                    setError(
                        "Your session has expired. Please login again."
                    );
                }

                return;
            }


            try {
                setResolvingTransaction(true);
                setError("");


                const response = await axios.get(
                    `${API_BASE_URL}/transactions`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );


                const transactions =
                    Array.isArray(response?.data)
                        ? response.data
                        : [];


                const pendingTransaction =
                    transactions.find(
                        (transaction) =>
                            String(
                                transaction?.status || ""
                            ).toUpperCase() === "PENDING" &&
                            transaction?.id !== null &&
                            transaction?.id !== undefined &&
                            /^\d+$/.test(
                                String(transaction.id).trim()
                            )
                    );


                if (!cancelled) {
                    if (pendingTransaction) {
                        setSelectedTransactionId(
                            String(pendingTransaction.id).trim()
                        );

                        setStatus(
                            String(
                                pendingTransaction.status || ""
                            ).toUpperCase() === "APPROVED"
                                ? "APPROVED"
                                : ""
                        );
                    } else {
                        setSelectedTransactionId("");
                        setError(
                            "There are no pending transactions available for approval."
                        );
                    }
                }

            } catch (error) {
                console.error(
                    "Unable to load pending transactions:",
                    error
                );


                if (!cancelled) {
                    if (error?.response?.status === 401) {
                        setError(
                            "Your session has expired. Please login again."
                        );
                    } else if (
                        error?.response?.status === 403
                    ) {
                        setError(
                            "You are not authorized to view transactions."
                        );
                    } else {
                        setError(
                            "Unable to load pending transactions. Please try again."
                        );
                    }
                }

            } finally {
                if (!cancelled) {
                    setResolvingTransaction(false);
                }
            }
        };


        loadPendingTransaction();


        return () => {
            cancelled = true;
        };
    }, [
        initialTransactionId,
        initialTransactionIdIsValid
    ]);


    const transactionId =
        String(selectedTransactionId || "").trim();


    const isValidTransactionId =
        transactionId !== "" &&
        /^\d+$/.test(transactionId);


    /*
     * ---------------------------------------------------------
     * APPROVE TRANSACTION
     * ---------------------------------------------------------
     */
    const handleApprove = async () => {

        /*
         * Prevent multiple clicks.
         */
        if (loading) {
            return;
        }


        /*
         * Make sure a valid transaction ID exists.
         */
        if (!isValidTransactionId) {

            setError(
                "No pending transaction is available for approval."
            );

            return;
        }


        setLoading(true);
        setError("");


        try {

            /*
             * -------------------------------------------------
             * GET JWT TOKEN
             * -------------------------------------------------
             */
            const token =
                localStorage.getItem("token");


            if (!token) {

                setError(
                    "Your session has expired. Please login again."
                );

                return;
            }


            /*
             * -------------------------------------------------
             * APPROVE TRANSACTION
             * -------------------------------------------------
             *
             * Backend:
             *
             * PUT
             * /api/transactions/{id}
             *
             * Body:
             *
             * {
             *     "status": "APPROVED"
             * }
             */
            const response = await axios.put(

                `${API_BASE_URL}/transactions/${transactionId}`,

                {
                    status: "APPROVED"
                },

                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );


            console.log(
                "Transaction approved successfully:",
                response.data
            );


            /*
             * -------------------------------------------------
             * UPDATE UI
             * -------------------------------------------------
             */
            setStatus("APPROVED");

            setError("");


        } catch (error) {

            console.error(
                "Transaction approval failed:",
                error
            );


            console.error(
                "HTTP Status:",
                error?.response?.status
            );


            console.error(
                "Server Response:",
                error?.response?.data
            );


            /*
             * -------------------------------------------------
             * ERROR HANDLING
             * -------------------------------------------------
             */

            if (error?.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else if (error?.response?.status === 403) {

                setError(
                    "You are not authorized to approve this transaction."
                );

            } else if (error?.response?.status === 404) {

                setError(
                    "Transaction not found."
                );

            } else if (error?.response?.status === 400) {

                setError(
                    "Invalid transaction approval request."
                );

            } else {

                setError(
                    "Unable to approve this transaction. Please try again."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    /*
     * ---------------------------------------------------------
     * APPROVED STATE
     * ---------------------------------------------------------
     */
    const isApproved =
        status === "APPROVED";


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


                    <h2>
                        Transaction Approval
                    </h2>


                    <p>
                        Review and authorize this transaction
                        securely before it is finalized.
                    </p>

                </div>


                <div
                    className={`transaction-approval-status ${
                        isApproved
                            ? "status-approved"
                            : "status-pending"
                    }`}
                >

                    <span
                        className="transaction-status-dot"
                        aria-hidden="true"
                    />


                    {isApproved
                        ? "Approved"
                        : "Pending Review"}

                </div>

            </div>



            {/* =================================================
                TRANSACTION INFORMATION
            ================================================= */}

            <div className="transaction-approval-card">

                <div className="transaction-approval-icon">

                    {isApproved
                        ? "✓"
                        : "↗"}

                </div>


                <div className="transaction-approval-details">

                    <span className="transaction-detail-label">
                        Transaction ID
                    </span>


                    <span className="transaction-detail-value">

                        {resolvingTransaction
                            ? "Loading..."
                            : isValidTransactionId
                                ? transactionId
                                : "Not available"}

                    </span>

                </div>

            </div>



            {/* =================================================
                INVALID TRANSACTION ID
            ================================================= */}

            {!resolvingTransaction &&
                !isValidTransactionId && (

                <div
                    className="transaction-approval-error"
                    role="alert"
                >

                    <span
                        className="transaction-error-icon"
                        aria-hidden="true"
                    >
                        !
                    </span>


                    <span>
                        A valid transaction ID is required
                        before this transaction can be approved.
                    </span>

                </div>

            )}



            {/* =================================================
                RESOLVING TRANSACTION
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
                            Finding a pending transaction that can be approved.
                        </span>

                    </div>

                </div>

            )}


            {/* =================================================
                AUTHORIZATION NOTICE
            ================================================= */}

            {isValidTransactionId &&
                !isApproved && (

                <div className="transaction-approval-notice">

                    <span
                        className="transaction-notice-icon"
                        aria-hidden="true"
                    >
                        !
                    </span>


                    <div>

                        <strong>
                            Authorization required
                        </strong>


                        <span>
                            Approving this transaction will
                            mark it as officially approved.
                        </span>

                    </div>

                </div>

            )}



            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {isApproved && (

                <div
                    className="transaction-approval-success"
                    role="status"
                >

                    <span
                        className="transaction-success-icon"
                        aria-hidden="true"
                    >
                        ✓
                    </span>


                    <div>

                        <strong>
                            Transaction Approved Successfully
                        </strong>


                        <span>
                            The transaction has been successfully
                            authorized.
                        </span>

                    </div>

                </div>

            )}



            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error &&
                !resolvingTransaction &&
                !isApproved && (

                <div
                    className="transaction-approval-error"
                    role="alert"
                >

                    <span
                        className="transaction-error-icon"
                        aria-hidden="true"
                    >
                        !
                    </span>


                    <span>
                        {error}
                    </span>

                </div>

            )}



            {/* =================================================
                APPROVE BUTTON
            ================================================= */}

            {!isApproved && (

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

            )}

        </section>
    );
};


export default TransactionApproval;