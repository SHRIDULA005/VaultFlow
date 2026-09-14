import React, { useState } from "react";
import axios from "axios";
import "./TransactionApproval.css";

const API_BASE_URL = "http://localhost:8080/api";

const TransactionApproval = ({ transactionId }) => {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleApprove = async () => {
        if (loading) {
            return;
        }

        if (!transactionId) {
            setError("Transaction ID is required.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Session expired. Please login again.");
                return;
            }

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

            setStatus("APPROVED");

        } catch (error) {

            console.error(
                "Transaction approval failed:",
                error
            );

            console.error(
                "Status:",
                error?.response?.status
            );

            console.error(
                "Response:",
                error?.response?.data
            );

            if (error?.response?.status === 401) {
                setError(
                    "Session expired. Please login again."
                );
            } else if (error?.response?.status === 403) {
                setError(
                    "You are not authorized to approve this transaction."
                );
            } else if (error?.response?.status === 404) {
                setError(
                    "Transaction not found."
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

    const isApproved = status === "APPROVED";

    return (
        <section className="transaction-approval">

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


            <div className="transaction-approval-card">

                <div className="transaction-approval-icon">
                    {isApproved ? "✓" : "↗"}
                </div>

                <div className="transaction-approval-details">

                    <span className="transaction-detail-label">
                        Transaction ID
                    </span>

                    <span className="transaction-detail-value">
                        {transactionId || "-"}
                    </span>

                </div>

            </div>


            {!isApproved && (
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


            {error && (
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


            {!isApproved && (
                <button
                    type="button"
                    className="transaction-approve-button"
                    onClick={handleApprove}
                    disabled={loading || !transactionId}
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