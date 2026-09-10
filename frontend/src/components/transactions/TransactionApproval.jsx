
import React, { useState } from "react";
import axios from "axios";

const TransactionApproval = ({ transactionId }) => {
    const [status, setStatus] = useState("");

    const handleApprove = () => {
        axios
            .put(`/api/transactions/${transactionId}`, {
                status: "APPROVED"
            })
            .then(() => {
                setStatus("APPROVED");
            })
            .catch((error) => {
                console.error(
                    "Transaction approval failed:",
                    error
                );
            });
    };

    return (
        <div>
            <h2>Transaction Approval</h2>

            <p>
                Transaction ID: {transactionId}
            </p>

            <button
                type="button"
                onClick={handleApprove}
            >
                Approve
            </button>

            {status === "APPROVED" && (
                <p>
                    Transaction Approved Successfully
                </p>
            )}
        </div>
    );
};

export default TransactionApproval;

