import React, { useState } from "react";
import axios from "axios";

const TransactionApproval = ({ transactionId }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleApprove = async () => {
        const id = String(transactionId ?? "").trim();

        if (!id) {
            setError("Transaction ID is required.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            await axios.put(
                `/api/transactions/${id}`,
                {
                    status: "APPROVED"
                }
            );

            setMessage("Transaction Approved Successfully");
        } catch (err) {
            console.error("Transaction approval failed:", err);

            if (err?.response?.status === 401) {
                localStorage.removeItem("token");
                setError("Session expired. Please log in again");
            } else if (err?.response?.status === 500) {
                setError(
                    "Unable to process transaction. Please try again."
                );
            } else {
                setError(
                    err?.response?.data?.message ||
                    "Unable to approve transaction."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="transaction-approval-page">
            <section className="transaction-approval-card">
                <h1>Transaction Approval</h1>

                <p>
                    Review and approve the selected financial transaction.
                </p>

                {message && (
                    <div
                        role="alert"
                        className="transaction-success-alert"
                    >
                        {message}
                    </div>
                )}

                {error && (
                    <div
                        role="alert"
                        className="transaction-error-alert"
                    >
                        {error}
                    </div>
                )}

                <div className="transaction-approval-actions">
                    <button
                        type="button"
                        onClick={handleApprove}
                        disabled={loading}
                        aria-label="Approve transaction"
                    >
                        {loading ? "Approving..." : "Approve"}
                    </button>
                </div>
            </section>
        </main>
    );
};

export default TransactionApproval;