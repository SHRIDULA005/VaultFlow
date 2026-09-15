import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import axios from "axios";

import "./LedgerList.css";

const API_BASE_URL = "http://localhost:8080";

const LedgerList = () => {

    // =========================================================
    // STATE
    // =========================================================

    const [ledgers, setLedgers] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [sortOrder, setSortOrder] =
        useState("asc");

    const [errorMessage, setErrorMessage] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const [deletingId, setDeletingId] =
        useState(null);

    const [editingLedger, setEditingLedger] =
        useState(null);

    const [editDescription, setEditDescription] =
        useState("");

    const [editCreatedAt, setEditCreatedAt] =
        useState("");

    const [savingEdit, setSavingEdit] =
        useState(false);


    // =========================================================
    // ROLE
    // =========================================================

    const getRole = () => {

        let role =
            localStorage.getItem("role") || "";

        role = role
            .trim()
            .toUpperCase()
            .replace(/^ROLE_/, "");

        return role;
    };


    const role = getRole();


    /*
     * IMPORTANT
     *
     * Backend currently allows ledger modification
     * for AUDITOR and ADMIN.
     *
     * Do not give TREASURER unauthorized buttons.
     */

    const canManageLedgers =
        role === "AUDITOR" ||
        role === "ADMIN";


    // =========================================================
    // AUTH HEADERS
    // =========================================================

    const getAuthHeaders = () => {

        const token =
            localStorage.getItem("token");

        return {
            Authorization: `Bearer ${token}`,
            "Content-Type":
                "application/json"
        };
    };


    // =========================================================
    // NAVIGATION
    //
    // Router-independent so the component can also be
    // rendered directly by the Jest tests.
    // =========================================================

    const navigateTo = (path) => {

        window.history.pushState(
            {},
            "",
            path
        );

        window.dispatchEvent(
            new PopStateEvent("popstate")
        );
    };


    // =========================================================
    // LOAD LEDGERS
    // =========================================================

    useEffect(() => {

        let mounted = true;

        const loadLedgers = async () => {

            try {

                setLoading(true);

                setErrorMessage("");

                const token =
                    localStorage.getItem("token");


                // -------------------------------------------------
                // TOKEN CHECK
                // -------------------------------------------------

                if (!token) {

                    if (mounted) {

                        localStorage.removeItem(
                            "token"
                        );

                        localStorage.removeItem(
                            "role"
                        );

                        localStorage.removeItem(
                            "user"
                        );

                        setErrorMessage(
                            "Session expired. Please log in again"
                        );

                        setLoading(false);
                    }

                    return;
                }


                // -------------------------------------------------
                // GET LEDGERS
                // -------------------------------------------------

                const response =
                    await axios.get(
                        `${API_BASE_URL}/api/ledgers`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );


                if (!mounted) {
                    return;
                }


                const responseData =
                    response?.data;


                // -------------------------------------------------
                // NORMAL ARRAY
                // -------------------------------------------------

                if (
                    Array.isArray(responseData)
                ) {

                    setLedgers(
                        responseData
                    );

                }

                // -------------------------------------------------
                // SPRING PAGE RESPONSE
                // -------------------------------------------------

                else if (
                    responseData &&
                    Array.isArray(
                        responseData.content
                    )
                ) {

                    setLedgers(
                        responseData.content
                    );

                }

                // -------------------------------------------------
                // UNKNOWN RESPONSE
                // -------------------------------------------------

                else {

                    setLedgers([]);
                }


            } catch (error) {

                console.error(
                    "Error loading ledgers:",
                    error
                );


                if (!mounted) {
                    return;
                }


                const status =
                    error?.response?.status;


                // -------------------------------------------------
                // 401
                // -------------------------------------------------

                if (status === 401) {

                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "role"
                    );

                    localStorage.removeItem(
                        "user"
                    );

                    setErrorMessage(
                        "Session expired. Please log in again"
                    );

                }

                // -------------------------------------------------
                // 403
                // -------------------------------------------------

                else if (status === 403) {

                    setErrorMessage(
                        "You are not authorized to view ledgers."
                    );

                }

                // -------------------------------------------------
                // OTHER
                // -------------------------------------------------

                else {

                    setErrorMessage(
                        "Unable to load ledgers. Please try again."
                    );
                }


            } finally {

                if (mounted) {

                    setLoading(false);
                }
            }
        };


        loadLedgers();


        return () => {

            mounted = false;
        };

    }, []);


    // =========================================================
    // FILTER + SORT
    // =========================================================

    const filteredLedgers =
        useMemo(() => {

            const search =
                searchTerm
                    .trim()
                    .toLowerCase();


            const filtered =
                ledgers.filter(
                    (ledger) => {

                        if (!search) {
                            return true;
                        }


                        const id =
                            String(
                                ledger?.id ?? ""
                            ).toLowerCase();


                        const description =
                            String(
                                ledger?.description ?? ""
                            ).toLowerCase();


                        return (
                            id.includes(search) ||
                            description.includes(search)
                        );
                    }
                );


            return [...filtered].sort(
                (a, b) => {

                    const idA =
                        Number(a?.id || 0);

                    const idB =
                        Number(b?.id || 0);


                    return sortOrder === "asc"
                        ? idA - idB
                        : idB - idA;
                }
            );

        }, [
            ledgers,
            searchTerm,
            sortOrder
        ]);


    // =========================================================
    // CREATE
    // =========================================================

    const handleCreateLedger = () => {

        if (!canManageLedgers) {

            setErrorMessage(
                "You are not authorized to create ledgers."
            );

            return;
        }


        navigateTo(
            "/ledgers/new"
        );
    };


    // =========================================================
    // EDIT
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
            ledger?.description || ""
        );


        if (ledger?.createdAt) {

            setEditCreatedAt(
                String(
                    ledger.createdAt
                ).substring(0, 10)
            );

        } else {

            setEditCreatedAt("");
        }
    };


    // =========================================================
    // CLOSE EDIT MODAL
    // =========================================================

    const closeEditModal = () => {

        if (savingEdit) {
            return;
        }


        setEditingLedger(null);

        setEditDescription("");

        setEditCreatedAt("");
    };


    // =========================================================
    // SAVE EDIT
    // =========================================================

    const handleSaveEdit = async (event) => {

        event.preventDefault();


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
                "Ledger description cannot be empty."
            );

            return;
        }


        try {

            setSavingEdit(true);

            setErrorMessage("");

            setSuccessMessage("");


            const payload = {
                description:
                    editDescription.trim()
            };


            if (editCreatedAt) {

                payload.createdAt =
                    editCreatedAt;
            }


            const response =
                await axios.put(
                    `${API_BASE_URL}/api/ledgers/${editingLedger.id}`,
                    payload,
                    {
                        headers:
                            getAuthHeaders()
                    }
                );


            const updatedLedger =
                response?.data || {};


            setLedgers(
                (previous) =>
                    previous.map(
                        (ledger) => {

                            if (
                                ledger.id !==
                                editingLedger.id
                            ) {

                                return ledger;
                            }


                            return {
                                ...ledger,
                                ...updatedLedger,

                                description:
                                    updatedLedger.description ??
                                    editDescription.trim(),

                                createdAt:
                                    updatedLedger.createdAt ??
                                    ledger.createdAt
                            };
                        }
                    )
            );


            setSuccessMessage(
                `Ledger #${editingLedger.id} updated successfully.`
            );


            closeEditModal();


        } catch (error) {

            console.error(
                "Error updating ledger:",
                error
            );


            const status =
                error?.response?.status;


            if (status === 401) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "role"
                );

                localStorage.removeItem(
                    "user"
                );

                setErrorMessage(
                    "Session expired. Please log in again"
                );

            } else if (status === 403) {

                setErrorMessage(
                    "You are not authorized to edit this ledger."
                );

            } else if (
                error?.response?.data?.message
            ) {

                setErrorMessage(
                    error.response.data.message
                );

            } else {

                setErrorMessage(
                    "Unable to update ledger. Please try again."
                );
            }

        } finally {

            setSavingEdit(false);
        }
    };


    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (
        ledgerId,
        description
    ) => {

        if (!canManageLedgers) {

            setErrorMessage(
                "You are not authorized to delete ledgers."
            );

            return;
        }


        const confirmed =
            window.confirm(
                `Are you sure you want to delete ledger "${description || `#${ledgerId}`}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setDeletingId(ledgerId);

            setErrorMessage("");

            setSuccessMessage("");


            await axios.delete(
                `${API_BASE_URL}/api/ledgers/${ledgerId}`,
                {
                    headers:
                        getAuthHeaders()
                }
            );


            setLedgers(
                (previous) =>
                    previous.filter(
                        (ledger) =>
                            ledger.id !==
                            ledgerId
                    )
            );


            setSuccessMessage(
                `Ledger #${ledgerId} deleted successfully.`
            );


        } catch (error) {

            console.error(
                "Error deleting ledger:",
                error
            );


            const status =
                error?.response?.status;


            if (status === 401) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "role"
                );

                localStorage.removeItem(
                    "user"
                );

                setErrorMessage(
                    "Session expired. Please log in again"
                );

            } else if (status === 403) {

                setErrorMessage(
                    "You are not authorized to delete this ledger."
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
    // DATE
    // =========================================================

    const formatDate = (value) => {

        if (!value) {
            return "Not available";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value)
                .substring(0, 10);
        }


        return date
            .toISOString()
            .substring(0, 10);
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <div className="ledger-page">

                <main className="ledger-main">

                    <div className="ledger-loading-card">

                        <div className="ledger-loading-spinner">
                        </div>

                        <h2>
                            Loading ledgers
                        </h2>

                        <p>
                            Retrieving your financial
                            ledger information...
                        </p>

                    </div>

                </main>

            </div>
        );
    }


    // =========================================================
    // MAIN UI
    // =========================================================

    return (

        <div className="ledger-page">

            <main className="ledger-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="ledger-page-header">

                    <div>

                        <div className="ledger-eyebrow">

                            <span className="ledger-eyebrow-dot">
                            </span>

                            VAULTFLOW

                        </div>

                        <h1>
                            Ledgers
                        </h1>

                        <p>
                            Manage and monitor your
                            financial ledger records.
                        </p>

                    </div>


                    <div className="ledger-header-actions">

                        <div className="ledger-role-badge">

                            <span className="role-dot">
                            </span>

                            {role || "USER"}

                        </div>


                        {canManageLedgers && (

                            <button
                                type="button"
                                className="ledger-create-button"
                                onClick={
                                    handleCreateLedger
                                }
                            >

                                <span>
                                    +
                                </span>

                                Create Ledger

                            </button>

                        )}

                    </div>

                </header>


                {/* =================================================
                    ALERTS
                ================================================= */}

                {errorMessage && (

                    <div
                        className="ledger-alert ledger-alert-error"
                        role="alert"
                    >

                        <div className="ledger-alert-icon">
                            !
                        </div>

                        <div className="ledger-alert-content">

                            <strong>
                                Action failed
                            </strong>

                            <span>
                                {errorMessage}
                            </span>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setErrorMessage("")
                            }
                            className="ledger-alert-close"
                        >
                            ×
                        </button>

                    </div>
                )}


                {successMessage && (

                    <div
                        className="ledger-alert ledger-alert-success"
                        role="status"
                    >

                        <div className="ledger-alert-icon">
                            ✓
                        </div>

                        <div className="ledger-alert-content">

                            <strong>
                                Success
                            </strong>

                            <span>
                                {successMessage}
                            </span>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccessMessage("")
                            }
                            className="ledger-alert-close"
                        >
                            ×
                        </button>

                    </div>
                )}


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section className="ledger-stats">

                    <div className="ledger-stat-card">

                        <div className="ledger-stat-icon">
                            L
                        </div>

                        <div>

                            <span>
                                TOTAL LEDGERS
                            </span>

                            <strong>
                                {ledgers.length}
                            </strong>

                        </div>

                    </div>


                    <div className="ledger-stat-card">

                        <div className="ledger-stat-icon">
                            #
                        </div>

                        <div>

                            <span>
                                DISPLAYED
                            </span>

                            <strong>
                                {filteredLedgers.length}
                            </strong>

                        </div>

                    </div>


                    <div className="ledger-stat-card">

                        <div className="ledger-stat-icon">
                            ✓
                        </div>

                        <div>

                            <span>
                                ACCESS LEVEL
                            </span>

                            <strong>
                                {canManageLedgers
                                    ? "MANAGER"
                                    : "VIEWER"}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    SEARCH / SORT
                ================================================= */}

                <section className="ledger-toolbar">

                    <div className="ledger-search">

                        <label>
                            Search ledgers
                        </label>

                        <div className="ledger-search-input">

                            <span>
                                ⌕
                            </span>

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                                placeholder="Search by ledger ID or description"
                            />

                            {searchTerm && (

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchTerm("")
                                    }
                                >
                                    ×
                                </button>

                            )}

                        </div>

                    </div>


                    <div className="ledger-sort">

                        <label>
                            Sort
                        </label>

                        <select
                            value={sortOrder}
                            onChange={(event) =>
                                setSortOrder(
                                    event.target.value
                                )
                            }
                        >

                            <option value="asc">
                                Ledger ID · Ascending
                            </option>

                            <option value="desc">
                                Ledger ID · Descending
                            </option>

                        </select>

                    </div>

                </section>


                {/* =================================================
                    CONTENT HEADER
                ================================================= */}

                <div className="ledger-content-heading">

                    <div>

                        <h2>
                            Financial Ledgers
                        </h2>

                        <p>
                            {filteredLedgers.length}{" "}
                            ledger
                            {filteredLedgers.length !== 1
                                ? "s"
                                : ""}{" "}
                            displayed
                        </p>

                    </div>

                </div>


                {/* =================================================
                    EMPTY
                ================================================= */}

                {filteredLedgers.length === 0 ? (

                    <section className="ledger-empty">

                        <div className="ledger-empty-icon">
                            L
                        </div>

                        <h2>
                            {searchTerm
                                ? "No ledgers found"
                                : "No ledgers available"}
                        </h2>

                        <p>
                            {searchTerm
                                ? "Try using a different ledger ID or description."
                                : "Create your first financial ledger to begin managing your records."}
                        </p>

                        {!searchTerm &&
                            canManageLedgers && (

                                <button
                                    type="button"
                                    className="ledger-create-button"
                                    onClick={
                                        handleCreateLedger
                                    }
                                >
                                    +
                                    <span>
                                        Create Ledger
                                    </span>
                                </button>
                            )}

                    </section>

                ) : (

                    /* =================================================
                       LEDGER GRID
                    ================================================= */

                    <section className="ledger-grid">

                        {filteredLedgers.map(
                            (ledger) => (

                                <article
                                    className="ledger-card"
                                    key={ledger.id}
                                >

                                    {/* TOP ACCENT */}

                                    <div className="ledger-card-accent">
                                    </div>


                                    {/* HEADER */}

                                    <div className="ledger-card-header">

                                        <div>

                                            <span className="ledger-card-label">
                                                LEDGER
                                            </span>

                                            <h3>
                                                #{ledger.id}
                                            </h3>

                                        </div>


                                        <div className="ledger-card-symbol">
                                            L
                                        </div>

                                    </div>


                                    {/* STATUS */}

                                    <div className="ledger-card-status">

                                        <span className="ledger-status-dot">
                                        </span>

                                        ACTIVE LEDGER

                                    </div>


                                    {/* DETAILS */}

                                    <div className="ledger-card-details">

                                        <div className="ledger-detail">

                                            <span>
                                                DESCRIPTION
                                            </span>

                                            <strong>
                                                {ledger.description ||
                                                    "No description"}
                                            </strong>

                                        </div>


                                        <div className="ledger-detail">

                                            <span>
                                                CREATED
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    ledger.createdAt ||
                                                    ledger.createdDate
                                                )}
                                            </strong>

                                        </div>

                                    </div>


                                    {/* ACTIONS */}

                                    {canManageLedgers && (

                                        <div className="ledger-card-actions">

                                            <button
                                                type="button"
                                                className="ledger-edit-button"
                                                onClick={() =>
                                                    handleEdit(
                                                        ledger
                                                    )
                                                }
                                            >

                                                <span>
                                                    ✎
                                                </span>

                                                Edit

                                            </button>


                                            <button
                                                type="button"
                                                className="ledger-delete-button"
                                                onClick={() =>
                                                    handleDelete(
                                                        ledger.id,
                                                        ledger.description
                                                    )
                                                }
                                                disabled={
                                                    deletingId ===
                                                    ledger.id
                                                }
                                            >

                                                {deletingId ===
                                                ledger.id
                                                    ? (
                                                        <>
                                                            <span className="ledger-button-spinner">
                                                            </span>
                                                            Deleting
                                                        </>
                                                    )
                                                    : (
                                                        <>
                                                            <span>
                                                                ×
                                                            </span>
                                                            Delete
                                                        </>
                                                    )}

                                            </button>

                                        </div>

                                    )}

                                </article>
                            )
                        )}

                    </section>
                )}


                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="ledger-footer">

                    <span>
                        VaultFlow Financial Management
                    </span>

                    <span>
                        Secure ledger control
                    </span>

                </footer>

            </main>


            {/* =====================================================
                EDIT MODAL
            ===================================================== */}

            {editingLedger && (

                <div
                    className="ledger-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeEditModal();
                        }

                    }}
                >

                    <section
                        className="ledger-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-ledger-title"
                    >

                        <div className="ledger-modal-header">

                            <div>

                                <span>
                                    LEDGER MANAGEMENT
                                </span>

                                <h2 id="edit-ledger-title">
                                    Edit Ledger #{editingLedger.id}
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="ledger-modal-close"
                                onClick={
                                    closeEditModal
                                }
                                disabled={
                                    savingEdit
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSaveEdit
                            }
                        >

                            <div className="ledger-modal-body">

                                <div className="ledger-modal-field">

                                    <label htmlFor="editLedgerDescription">
                                        Ledger Description
                                    </label>

                                    <input
                                        id="editLedgerDescription"
                                        type="text"
                                        value={
                                            editDescription
                                        }
                                        onChange={(event) =>
                                            setEditDescription(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter ledger description"
                                        autoFocus
                                        required
                                    />

                                    <small>
                                        Provide a clear description
                                        for this financial ledger.
                                    </small>

                                </div>


                                <div className="ledger-modal-field">

                                    <label htmlFor="editLedgerCreatedAt">
                                        Created Date
                                    </label>

                                    <input
                                        id="editLedgerCreatedAt"
                                        type="date"
                                        value={
                                            editCreatedAt
                                        }
                                        onChange={(event) =>
                                            setEditCreatedAt(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>


                            <div className="ledger-modal-actions">

                                <button
                                    type="button"
                                    className="ledger-modal-cancel"
                                    onClick={
                                        closeEditModal
                                    }
                                    disabled={
                                        savingEdit
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="ledger-modal-save"
                                    disabled={
                                        savingEdit
                                    }
                                >

                                    {savingEdit ? (

                                        <>
                                            <span className="ledger-button-spinner">
                                            </span>

                                            Saving...
                                        </>

                                    ) : (

                                        <>
                                            ✓ Save Changes
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </section>

                </div>

            )}

        </div>
    );
};

export default LedgerList;