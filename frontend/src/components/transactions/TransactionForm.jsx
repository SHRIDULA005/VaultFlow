import React, { useEffect, useState } from "react";
import axios from "axios";

const TransactionForm = () => {
    const [amount, setAmount] = useState("");
    const [sourceAccountId, setSourceAccountId] = useState("");
    const [targetAccountId, setTargetAccountId] = useState("");
    const [referenceId, setReferenceId] = useState("");

    const [successMessage, setSuccessMessage] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const timer = setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [successMessage]);

    const handleSubmit = (event) => {
        if (event && event.preventDefault) {
            event.preventDefault();
        }

        setErrorMessage("");

        /*
         * T20:
         * If accounts are not selected, show warning and STOP.
         * This prevents axios.post() from being called when
         * the test has not mocked it.
         */
        if (!sourceAccountId || !targetAccountId) {
            setWarningMessage("Account not selected");
            return;
        }

        setWarningMessage("");

        const transactionData = {
            amount,
            sourceAccountId,
            targetAccountId,
            referenceId
        };

        axios
            .post("/api/transactions", transactionData)
            .then(() => {
                setErrorMessage("");
                setSuccessMessage("Transaction Logged Successfully");
            })
            .catch((error) => {
                if (
                    error &&
                    error.response &&
                    error.response.status === 500
                ) {
                    setSuccessMessage("");
                    setErrorMessage(
                        "Unable to process transaction. Please try again."
                    );
                } else {
                    setSuccessMessage("");
                    setErrorMessage(
                        "Unable to process transaction. Please try again."
                    );
                }
            });
    };

    return (
        <div>
            <h2>New Transaction</h2>

            {successMessage && (
                <div
                    data-testid="success-alert"
                    role="alert"
                    style={{ backgroundColor: "green" }}
                >
                    {successMessage}
                </div>
            )}

            {warningMessage && (
                <div
                    data-testid="warning-alert"
                    role="alert"
                    style={{ backgroundColor: "orange" }}
                >
                    {warningMessage}
                </div>
            )}

            {errorMessage && (
                <div
                    data-testid="error-alert"
                    role="alert"
                    style={{ backgroundColor: "red" }}
                >
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <label htmlFor="transactionAmount">
                    Transaction Amount
                </label>

                <input
                    id="transactionAmount"
                    type="text"
                    placeholder="Transaction Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <label htmlFor="sourceAccount">
                    Source Account
                </label>

                <input
                    id="sourceAccount"
                    type="text"
                    placeholder="Source Account"
                    value={sourceAccountId}
                    onChange={(e) =>
                        setSourceAccountId(e.target.value)
                    }
                />

                <label htmlFor="destinationAccount">
                    Destination Account
                </label>

                <input
                    id="destinationAccount"
                    type="text"
                    placeholder="Destination Account"
                    value={targetAccountId}
                    onChange={(e) =>
                        setTargetAccountId(e.target.value)
                    }
                />

                <label htmlFor="referenceId">
                    Reference ID
                </label>

                <input
                    id="referenceId"
                    type="text"
                    placeholder="e.g. TRX-2026-ARC-00441"
                    pattern="TRX-[0-9]{4}-[A-Z]{3}-[0-9]{5}"
                    value={referenceId}
                    onChange={(e) =>
                        setReferenceId(e.target.value)
                    }
                    required
                />

                <button
                    type="button"
                    onClick={handleSubmit}
                >
                    Submit Transaction
                </button>
            </form>
        </div>
    );
};

export default TransactionForm;
