import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./LedgerList.css";

const API_BASE_URL = "http://localhost:8080";

const LedgerList = () => {
    const [ledgers, setLedgers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [editingLedger, setEditingLedger] = useState(null);

    const [editDescription, setEditDescription] = useState("");
    const [editCreatedAt, setEditCreatedAt] = useState("");

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // =========================================================
    // GET CURRENT USER ROLE
    // =========================================================

    const getRole = () => {
        const role = localStorage.getItem("role");

        if (!role) {
            return "";
        }

        return role
            .replace(/^ROLE_/i, "")
            .trim()
            .toUpperCase();
    };

    const role = getRole();

    const canManageLedgers =
        role === "AUDITOR" || role === "ADMIN";


    // =========================================================
    // AUTH HEADERS
    // =========================================================

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");

        return token
            ? {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
              }
            : {
                  "Content-Type": "application/json"
              };
    };


    // =========================================================
    // NAVIGATION
    // =========================================================

    const handleCreateLedger = () => {
        window.location.href = "/ledgers/new";
    };


    // =========================================================
    // LOAD LEDGERS
    // =========================================================

    const loadLedgers = useCallback(async () => {

        setLoading(true);
        setErrorMessage("");

        try {

            const response = await axios.get(
                `${API_BASE_URL}/api/ledgers`,
                {
                    headers: getAuthHeaders()
                }
            );

            const data = response.data;

            if (Array.isArray(data)) {

                setLedgers(data);

            } else if (
                data &&
                Array.isArray(data.content)
            ) {

                setLedgers(data.content);

            } else {

                setLedgers([]);
            }

        } catch (error) {

            console.error(
                "Unable to load ledgers:",
                error
            );

            const status = error?.response?.status;

            if (status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("user");

                setErrorMessage(
                    "Session expired. Please log in again."
                );

            } else if (status === 403) {

                setErrorMessage(
                    "You are not authorized to view ledgers."
                );

            } else {

                setErrorMessage(
                    "Unable to load ledgers. Please try again."
                );
            }

            setLedgers([]);

        } finally {

            setLoading(false);
        }

    }, []);


    useEffect(() => {
        loadLedgers();
    }, [loadLedgers]);


    // =========================================================
    // START EDIT
    // =========================================================

    const handleEdit = (ledger) => {

        if (!canManageLedgers) {
            setErrorMessage(
                "You are not authorized to edit ledgers."
            );
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        setEditingLedger(ledger);

        setEditDescription(
            ledger.description || ""
        );

        setEditCreatedAt(
            ledger.createdAt
                ? String(ledger.createdAt).split("T")[0]
                : ""
        );
    };


    // =========================================================
    // CANCEL EDIT
    // =========================================================

    const handleCancelEdit = () => {

        if (deletingId) {
            return;
        }

        setEditingLedger(null);
        setEditDescription("");
        setEditCreatedAt("");
    };


    // =========================================================
    // SAVE EDIT
    // =========================================================

    const handleSaveEdit = async () => {

        if (!editingLedger) {
            return;
        }

        if (!canManageLedgers) {

            setErrorMessage(
                "You are not authorized to edit ledgers."
            );

            return;
        }

        if (!editDescription.trim()) {

            setErrorMessage(
                "Ledger Description is required."
            );

            return;
        }

        try {

            setErrorMessage("");
            setSuccessMessage("");

            setDeletingId(`edit-${editingLedger.id}`);

            const ledgerData = {
                description: editDescription.trim(),
                createdAt: editCreatedAt || null
            };

            const response = await axios.put(
                `${API_BASE_URL}/api/ledgers/${editingLedger.id}`,
                ledgerData,
                {
                    headers: getAuthHeaders()
                }
            );

            const updatedLedger = response.data;

            setLedgers((previousLedgers) =>
                previousLedgers.map((ledger) =>
                    ledger.id === editingLedger.id
                        ? updatedLedger
                        : ledger
                )
            );

            setEditingLedger(null);
            setEditDescription("");
            setEditCreatedAt("");

            setSuccessMessage(
                "Ledger updated successfully."
            );

        } catch (error) {

            console.error(
                "Unable to update ledger:",
                error
            );

            const status = error?.response?.status;

            if (status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("user");

                setErrorMessage(
                    "Session expired. Please log in again."
                );

            } else if (status === 403) {

                setErrorMessage(
                    "You are not authorized to edit ledgers."
                );

            } else if (
                error?.response?.data?.message
            ) {

                setErrorMessage(
                    error.response.data.message
                );

            } else if (
                typeof error?.response?.data === "string"
            ) {

                setErrorMessage(
                    error.response.data
                );

            } else {

                setErrorMessage(
                    "Unable to update ledger. Please try again."
                );
            }

        } finally {

            setDeletingId(null);
        }
    };


    // =========================================================
    // DELETE LEDGER
    // =========================================================

    const handleDelete = async (ledger) => {

        if (!canManageLedgers) {

            setErrorMessage(
                "You are not authorized to delete ledgers."
            );

            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete Ledger #${ledger.id}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            setErrorMessage("");
            setSuccessMessage("");

            setDeletingId(ledger.id);

            await axios.delete(
                `${API_BASE_URL}/api/ledgers/${ledger.id}`,
                {
                    headers: getAuthHeaders()
                }
            );

            setLedgers((previousLedgers) =>
                previousLedgers.filter(
                    (item) => item.id !== ledger.id
                )
            );

            setSuccessMessage(
                "Ledger deleted successfully."
            );

        } catch (error) {

            console.error(
                "Unable to delete ledger:",
                error
            );

            const status = error?.response?.status;

            if (status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("user");

                setErrorMessage(
                    "Session expired. Please log in again."
                );

            } else if (status === 403) {

                setErrorMessage(
                    "You are not authorized to delete ledgers."
                );

            } else if (
                error?.response?.data?.message
            ) {

                setErrorMessage(
                    error.response.data.message
                );

            } else {

                setErrorMessage(
                    "Unable to delete ledger. Please try again."
                );
            }

        } finally {

            setDeletingId(null);
        }
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="ledger-list-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="ledger-list-header">

                <div>

                    <span className="ledger-eyebrow">
                        VAULTFLOW
                    </span>

                    <h2>
                        Ledgers
                    </h2>

                    <p>
                        View and manage financial ledgers.
                    </p>

                </div>


                <div className="ledger-header-actions">

                    <div className="ledger-count">

                        {ledgers.length} Ledger
                        {ledgers.length !== 1 ? "s" : ""}

                    </div>


                    {/* CREATE BUTTON
                        Only AUDITOR and ADMIN
                    */}

                    {canManageLedgers && (
                        <button
                            type="button"
                            className="create-ledger-button"
                            onClick={handleCreateLedger}
                            disabled={loading}
                        >

                            <span className="create-ledger-icon">
                                +
                            </span>

                            <span>
                                Create Ledger
                            </span>

                        </button>
                    )}

                </div>

            </div>


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {successMessage && (
                <div className="ledger-list-success">
                    ✓ {successMessage}
                </div>
            )}


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {errorMessage && (
                <div className="ledger-list-error">
                    ! {errorMessage}
                </div>
            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

                <div className="no-ledgers">

                    <div className="ledger-empty-icon">
                        L
                    </div>

                    <h3>
                        Loading ledgers...
                    </h3>

                    <p>
                        Please wait while your ledgers are loaded.
                    </p>

                </div>

            ) : ledgers.length > 0 ? (

                /* =================================================
                   LEDGER CARDS
                ================================================= */

                <div className="ledger-cards">

                    {ledgers.map((ledger) => (

                        <div
                            className="ledger-card"
                            key={ledger.id}
                        >

                            <div className="ledger-card-top">

                                <div>

                                    <span className="ledger-card-label">
                                        Ledger ID
                                    </span>

                                    <h3>
                                        #{ledger.id}
                                    </h3>

                                </div>

                                <div className="ledger-icon">
                                    L
                                </div>

                            </div>


                            <div className="ledger-card-divider" />


                            {/* DESCRIPTION */}

                            <div className="ledger-description">

                                <span>
                                    Description
                                </span>

                                <strong>
                                    {ledger.description || "-"}
                                </strong>

                            </div>


                            {/* CREATED DATE */}

                            {ledger.createdAt && (

                                <div className="ledger-created">

                                    <span>
                                        Created
                                    </span>

                                    <strong>
                                        {
                                            String(
                                                ledger.createdAt
                                            ).split("T")[0]
                                        }
                                    </strong>

                                </div>

                            )}


                            {/* =================================================
                                ACTION BUTTONS
                            ================================================= */}

                            {canManageLedgers && (

                                <div className="ledger-card-actions">

                                    <button
                                        type="button"
                                        className="ledger-edit-button"
                                        onClick={() =>
                                            handleEdit(ledger)
                                        }
                                        disabled={
                                            deletingId !== null
                                        }
                                    >
                                        Edit
                                    </button>


                                    <button
                                        type="button"
                                        className="ledger-delete-button"
                                        onClick={() =>
                                            handleDelete(ledger)
                                        }
                                        disabled={
                                            deletingId === ledger.id
                                        }
                                    >

                                        {deletingId === ledger.id
                                            ? "Deleting..."
                                            : "Delete"}

                                    </button>

                                </div>

                            )}

                        </div>

                    ))}

                </div>

            ) : (

                /* =================================================
                   EMPTY STATE
                ================================================= */

                !errorMessage && (

                    <div className="no-ledgers">

                        <div className="ledger-empty-icon">
                            L
                        </div>

                        <h3>
                            No ledgers found
                        </h3>

                        <p>
                            Create a ledger to start managing
                            financial records.
                        </p>


                        {canManageLedgers && (

                            <button
                                type="button"
                                className="empty-create-ledger-button"
                                onClick={handleCreateLedger}
                            >

                                <span>
                                    +
                                </span>

                                Create your first ledger

                            </button>

                        )}

                    </div>

                )

            )}


            {/* =================================================
                EDIT MODAL
            ================================================= */}

            {editingLedger && (

                <div className="ledger-edit-overlay">

                    <div className="ledger-edit-modal">

                        <div className="ledger-edit-header">

                            <div>

                                <span className="ledger-form-eyebrow">
                                    VAULTFLOW
                                </span>

                                <h3>
                                    Edit Ledger
                                </h3>

                                <p>
                                    Ledger #{editingLedger.id}
                                </p>

                            </div>

                            <button
                                type="button"
                                className="ledger-edit-close"
                                onClick={handleCancelEdit}
                                disabled={deletingId !== null}
                            >
                                ×
                            </button>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="ledger-form-field">

                            <label htmlFor="edit-ledger-description">
                                Ledger Description
                            </label>

                            <input
                                id="edit-ledger-description"
                                type="text"
                                value={editDescription}
                                onChange={(event) =>
                                    setEditDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Ledger Description"
                                autoComplete="off"
                            />

                        </div>


                        {/* DATE */}

                        <div className="ledger-form-field">

                            <label htmlFor="edit-ledger-date">
                                Created Date
                            </label>

                            <input
                                id="edit-ledger-date"
                                type="date"
                                value={editCreatedAt}
                                onChange={(event) =>
                                    setEditCreatedAt(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        {/* ACTIONS */}

                        <div className="ledger-form-actions">

                            <button
                                type="button"
                                className="ledger-submit-button"
                                onClick={handleSaveEdit}
                                disabled={
                                    deletingId !== null
                                }
                            >

                                {deletingId !== null
                                    ? "Saving..."
                                    : "Save Changes"}

                            </button>


                            <button
                                type="button"
                                className="ledger-cancel-button"
                                onClick={handleCancelEdit}
                                disabled={
                                    deletingId !== null
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default LedgerList;