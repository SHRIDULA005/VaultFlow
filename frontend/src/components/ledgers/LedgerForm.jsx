import React, { useRef, useState } from "react";

const LedgerForm = ({ editMode = false }) => {
    const [description, setDescription] = useState("");
    const descriptionRef = useRef(null);

    const handleEdit = () => {
        if (descriptionRef.current) {
            descriptionRef.current.focus();
        }
    };

    return (
        <div>
            <h2>Ledger</h2>

            <label htmlFor="ledgerDescription">
                Ledger Description
            </label>

            <input
                id="ledgerDescription"
                ref={descriptionRef}
                type="text"
                placeholder="Ledger Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            {editMode && (
                <button type="button" onClick={handleEdit}>
                    Edit Ledger
                </button>
            )}
        </div>
    );
};

export default LedgerForm;