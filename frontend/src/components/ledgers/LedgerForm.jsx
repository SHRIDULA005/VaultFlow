import React, { useRef, useState } from "react";
import ledgerService from "../../services/ledgerService";
import "./LedgerForm.css";

const LedgerForm = ({ editMode = false }) => {
    const [ledgerId, setLedgerId] = useState("");
    const [description, setDescription] = useState("");
    const [createdAt, setCreatedAt] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const descriptionRef = useRef(null);

    const handleEdit = () => {
        if (descriptionRef.current) {
            descriptionRef.current.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!ledgerId || !description) {
            setError("Please enter Ledger ID and Description");
            return;
        }

        try {
            const ledgerData = {
                id: Number(ledgerId),
                description: description,
                createdAt: createdAt
                    ? `${createdAt}T00:00:00`
                    : null
            };

            await ledgerService.createLedger(ledgerData);

            setMessage("Ledger added successfully");

            setLedgerId("");
            setDescription("");
            setCreatedAt("");
        } catch (err) {
            console.error("Ledger creation error:", err);
            setError("Unable to create ledger. Please try again.");
        }
    };

    return (
        <div className="ledger-form-page">

            <div className="ledger-form-header">
                <div>
                    <span className="ledger-eyebrow">
                        VAULTFLOW
                    </span>

                    <h2>Create Ledger</h2>

                    <p>
                        Add a new financial ledger to the system.
                    </p>
                </div>
            </div>

            {message && (
                <div className="ledger-success">
                    {message}
                </div>
            )}

            {error && (
                <div className="ledger-error">
                    {error}
                </div>
            )}

            <form
                className="ledger-form-card"
                onSubmit={handleSubmit}
            >

                <div className="ledger-field">
                    <label htmlFor="ledgerId">
                        Ledger ID
                    </label>

                    <input
                        id="ledgerId"
                        type="number"
                        placeholder="Enter Ledger ID"
                        value={ledgerId}
                        onChange={(e) =>
                            setLedgerId(e.target.value)
                        }
                    />
                </div>

                <div className="ledger-field">
                    <label htmlFor="ledgerDescription">
                        Ledger Description
                    </label>

                    <input
                        id="ledgerDescription"
                        ref={descriptionRef}
                        type="text"
                        placeholder="Ledger Description"
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                    />
                </div>

                <div className="ledger-field">
                    <label htmlFor="ledgerCreatedAt">
                        Created Date
                    </label>

                    <input
                        id="ledgerCreatedAt"
                        type="date"
                        value={createdAt}
                        onChange={(e) =>
                            setCreatedAt(e.target.value)
                        }
                    />
                </div>

                <div className="ledger-form-actions">

                    <button
                        type="submit"
                        className="ledger-submit-button"
                    >
                        Add Ledger
                    </button>

                    {editMode && (
                        <button
                            type="button"
                            className="ledger-edit-button"
                            onClick={handleEdit}
                        >
                            Edit Ledger
                        </button>
                    )}

                </div>

            </form>
        </div>
    );
};

export default LedgerForm;