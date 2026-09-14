import React, { useState } from "react";
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


    /*
     * ---------------------------------------------------------
     * VALIDATE TRANSACTION ID
     * ---------------------------------------------------------
     */
    const transactionId =
        String(resolvedTransactionId).trim();


    const isValidTransactionId =
        transactionId !== "" &&
        /^\d+$/.test(transactionId);


    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


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
                "A valid transaction ID is required to approve this transaction."
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

                        {isValidTransactionId
                            ? transactionId
                            : "Not available"}

                    </span>

                </div>

            </div>



            {/* =================================================
                INVALID TRANSACTION ID
            ================================================= */}

            {!isValidTransactionId && (

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
                isValidTransactionId &&
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