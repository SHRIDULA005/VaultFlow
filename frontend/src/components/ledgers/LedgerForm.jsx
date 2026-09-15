import React, { useRef, useState } from "react";
import axios from "axios";
import "./LedgerForm.css";

const LedgerForm = () => {
    // =========================================================
    // STATE
    // =========================================================

    const [ledgerId, setLedgerId] = useState("");
    const [description, setDescription] = useState("");
    const [createdAt, setCreatedAt] = useState("");

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [loading, setLoading] = useState(false);

    // =========================================================
    // T12 - DESCRIPTION INPUT REF
    // =========================================================
    //
    // The Edit Ledger button must move focus directly to
    // the Ledger Description input.
    //
    // Keep this ref attached directly to the input.
    // =========================================================

    const descriptionRef = useRef(null);

    // =========================================================
    // CURRENT USER ROLE
    // =========================================================

    const role = (
        localStorage.getItem("role") || "USER"
    )
        .trim()
        .toUpperCase()
        .replace(/^ROLE_/, "");

    // =========================================================
    // NAVIGATION
    // =========================================================
    //
    // We intentionally use browser history instead of
    // useNavigate() so LedgerForm can also be rendered directly
    // by Jest tests without requiring a Router.
    // =========================================================

    const navigate = (path, options = {}) => {
        try {
            if (options.replace) {
                window.history.replaceState(
                    {},
                    "",
                    path
                );
            } else {
                window.history.pushState(
                    {},
                    "",
                    path
                );
            }

            window.dispatchEvent(
                new PopStateEvent("popstate")
            );
        } catch (error) {
            console.error(
                "Navigation error:",
                error
            );
        }
    };

    // =========================================================
    // T12 - EDIT LEDGER
    // =========================================================
    //
    // IMPORTANT:
    // Keep this synchronous.
    //
    // Do NOT use:
    // - setTimeout()
    // - async/await
    // - navigation
    // - state changes
    //
    // The test expects the description input to become the
    // active element immediately after clicking Edit Ledger.
    // =========================================================

    const handleEdit = () => {
        descriptionRef.current?.focus();
    };

    // =========================================================
    // FIELD HANDLERS
    // =========================================================

    const handleLedgerIdChange = (event) => {
        setLedgerId(event.target.value);

        if (errorMessage) {
            setErrorMessage("");
        }
    };

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);

        if (errorMessage) {
            setErrorMessage("");
        }
    };

    const handleDateChange = (event) => {
        setCreatedAt(event.target.value);

        if (errorMessage) {
            setErrorMessage("");
        }
    };

    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Prevent duplicate submissions
        if (loading) {
            return;
        }

        // Clear previous notifications
        setSuccessMessage("");
        setErrorMessage("");

        // =====================================================
        // CLEAN INPUT VALUES
        // =====================================================

        const cleanLedgerId = ledgerId.trim();
        const cleanDescription = description.trim();

        // =====================================================
        // VALIDATE LEDGER ID
        // =====================================================

        if (!cleanLedgerId) {
            setErrorMessage(
                "Ledger ID is required."
            );
            return;
        }

        // =====================================================
        // VALIDATE DESCRIPTION
        // =====================================================

        if (!cleanDescription) {
            setErrorMessage(
                "Ledger Description is required."
            );

            // Put the cursor directly into description
            if (descriptionRef.current) {
                descriptionRef.current.focus();
            }

            return;
        }

        try {
            setLoading(true);

            // =================================================
            // JWT TOKEN
            // =================================================

            const token =
                localStorage.getItem("token");

            // =================================================
            // API PAYLOAD
            // =================================================

            const ledgerData = {
                id: cleanLedgerId,
                description: cleanDescription,
                createdAt: createdAt || null
            };

            console.log(
                "Creating ledger:",
                ledgerData
            );

            // =================================================
            // CREATE LEDGER
            // =================================================
            //
            // CRA proxy:
            //
            // Frontend:
            // http://localhost:3000
            //
            // Backend:
            // http://localhost:8080
            //
            // /api/ledgers is therefore intentionally used here.
            // =================================================

            await axios.post(
                "/api/ledgers",
                ledgerData,
                {
                    headers: {
                        "Content-Type":
                            "application/json",

                        ...(token
                            ? {
                                  Authorization:
                                      `Bearer ${token}`
                              }
                            : {})
                    }
                }
            );

            // =================================================
            // SUCCESS
            // =================================================

            setSuccessMessage(
                "Ledger added successfully."
            );

            // Clear form after successful creation
            setLedgerId("");
            setDescription("");
            setCreatedAt("");

            // =================================================
            // RETURN TO LEDGER LIST
            // =================================================

            setTimeout(() => {
                navigate(
                    "/ledgers",
                    {
                        replace: true
                    }
                );
            }, 900);

        } catch (error) {
            console.error(
                "Unable to create ledger:",
                error
            );

            const status =
                error?.response?.status;

            // =================================================
            // 401 - SESSION EXPIRED
            // =================================================

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

                setTimeout(() => {
                    navigate(
                        "/login",
                        {
                            replace: true
                        }
                    );
                }, 900);

                return;
            }

            // =================================================
            // 403 - FORBIDDEN
            // =================================================

            if (status === 403) {
                setErrorMessage(
                    "You are not authorized to create a ledger."
                );

                return;
            }

            // =================================================
            // 400 - BAD REQUEST
            // =================================================

            if (status === 400) {
                const data =
                    error?.response?.data;

                if (
                    typeof data === "string"
                ) {
                    setErrorMessage(data);
                    return;
                }

                if (data?.message) {
                    setErrorMessage(
                        data.message
                    );
                    return;
                }

                setErrorMessage(
                    "Invalid ledger information."
                );

                return;
            }

            // =================================================
            // 409 - DUPLICATE LEDGER
            // =================================================

            if (status === 409) {
                setErrorMessage(
                    "A ledger with this ID already exists."
                );

                return;
            }

            // =================================================
            // BACKEND RESPONSE MESSAGE
            // =================================================

            const responseData =
                error?.response?.data;

            if (
                typeof responseData === "string"
            ) {
                setErrorMessage(
                    responseData
                );

                return;
            }

            if (
                responseData?.message
            ) {
                setErrorMessage(
                    responseData.message
                );

                return;
            }

            // =================================================
            // NETWORK ERROR
            // =================================================

            if (!error?.response) {
                setErrorMessage(
                    "Unable to connect to the server. Please make sure the backend is running."
                );

                return;
            }

            // =================================================
            // GENERIC ERROR
            // =================================================

            setErrorMessage(
                "Unable to create ledger. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // CANCEL
    // =========================================================

    const handleCancel = () => {
        if (loading) {
            return;
        }

        navigate("/ledgers");
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <main className="ledger-create-page">

            <div className="ledger-create-shell">

                {/* =================================================
                    TOP BAR
                ================================================= */}

                <header className="ledger-create-topbar">

                    <div className="ledger-brand">

                        <div className="ledger-brand-logo">
                            VF
                        </div>

                        <div className="ledger-brand-copy">

                            <strong>
                                VaultFlow
                            </strong>

                            <span>
                                FINANCIAL OPERATIONS
                            </span>

                        </div>

                    </div>

                    <div className="ledger-topbar-right">

                        <div className="ledger-role-pill">

                            <span></span>

                            {role}

                        </div>

                        <button
                            type="button"
                            className="ledger-back-button"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            <span>
                                ←
                            </span>

                            Back to Ledgers
                        </button>

                    </div>

                </header>

                {/* =================================================
                    PAGE INTRO
                ================================================= */}

                <section className="ledger-create-intro">

                    <div>

                        <div className="ledger-page-eyebrow">

                            <span></span>

                            LEDGER MANAGEMENT

                        </div>

                        <h1>
                            Create Ledger
                        </h1>

                        <p>
                            Add a new financial ledger
                            to your VaultFlow workspace.
                        </p>

                    </div>

                    <div className="ledger-security-badge">

                        <div>
                            ✓
                        </div>

                        <span>
                            Secure workspace
                        </span>

                    </div>

                </section>

                {/* =================================================
                    SUCCESS MESSAGE
                ================================================= */}

                {successMessage && (
                    <div
                        className="ledger-notification ledger-notification-success"
                        role="status"
                    >

                        <div className="ledger-notification-icon">
                            ✓
                        </div>

                        <div className="ledger-notification-content">

                            <strong>
                                Ledger created
                            </strong>

                            <span>
                                {successMessage}
                            </span>

                        </div>

                        <button
                            type="button"
                            aria-label="Close success message"
                            onClick={() =>
                                setSuccessMessage("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {/* =================================================
                    ERROR MESSAGE
                ================================================= */}

                {errorMessage && (
                    <div
                        className="ledger-notification ledger-notification-error"
                        role="alert"
                    >

                        <div className="ledger-notification-icon">
                            !
                        </div>

                        <div className="ledger-notification-content">

                            <strong>
                                Unable to continue
                            </strong>

                            <span>
                                {errorMessage}
                            </span>

                        </div>

                        <button
                            type="button"
                            aria-label="Close error message"
                            onClick={() =>
                                setErrorMessage("")
                            }
                        >
                            ×
                        </button>

                    </div>
                )}

                {/* =================================================
                    MAIN GRID
                ================================================= */}

                <section className="ledger-create-grid">

                    {/* =================================================
                        FORM CARD
                    ================================================= */}

                    <div className="ledger-form-card">

                        <div className="ledger-form-card-header">

                            <div className="ledger-section-icon">
                                +
                            </div>

                            <div>

                                <h2>
                                    Ledger Information
                                </h2>

                                <p>
                                    Enter the details for your
                                    new financial ledger.
                                </p>

                            </div>

                        </div>

                        <div className="ledger-form-divider"></div>

                        {/* =================================================
                            FORM
                        ================================================= */}

                        <form
                            className="ledger-form"
                            onSubmit={handleSubmit}
                            noValidate
                        >

                            {/* =================================================
                                LEDGER ID
                            ================================================= */}

                            <div className="ledger-field">

                                <div className="ledger-field-label">

                                    <label htmlFor="ledger-id">
                                        Ledger ID
                                        <span>*</span>
                                    </label>

                                    <span className="ledger-field-number">
                                        01
                                    </span>

                                </div>

                                <div className="ledger-input-wrapper">

                                    <span className="ledger-input-icon">
                                        #
                                    </span>

                                    <input
                                        id="ledger-id"
                                        name="ledgerId"
                                        type="text"
                                        value={ledgerId}
                                        onChange={
                                            handleLedgerIdChange
                                        }
                                        placeholder="Enter a unique Ledger ID"
                                        autoComplete="off"
                                        required
                                        disabled={loading}
                                    />

                                </div>

                                <p className="ledger-field-help">
                                    Use a unique identifier for
                                    this financial ledger.
                                </p>

                            </div>

                            {/* =================================================
                                DESCRIPTION
                            ================================================= */}

                            <div className="ledger-field">

                                <div className="ledger-field-label">

                                    <label htmlFor="ledger-description">
                                        Ledger Description
                                        <span>*</span>
                                    </label>

                                    <span className="ledger-field-number">
                                        02
                                    </span>

                                </div>

                                <div className="ledger-input-wrapper">

                                    <span className="ledger-input-icon">
                                        =
                                    </span>

                                    <input
                                        id="ledger-description"
                                        name="description"
                                        ref={descriptionRef}
                                        type="text"
                                        value={description}
                                        onChange={
                                            handleDescriptionChange
                                        }
                                        placeholder="e.g. Operations, Payroll, General Expenses"
                                        autoComplete="off"
                                        required
                                        disabled={loading}
                                    />

                                </div>

                                <p className="ledger-field-help">
                                    Give this ledger a clear and
                                    meaningful business description.
                                </p>

                            </div>

                            {/* =================================================
                                CREATED DATE
                            ================================================= */}

                            <div className="ledger-field">

                                <div className="ledger-field-label">

                                    <label htmlFor="created-date">
                                        Created Date
                                    </label>

                                    <span className="ledger-field-number">
                                        03
                                    </span>

                                </div>

                                <div className="ledger-input-wrapper">

                                    <span className="ledger-input-icon">
                                        ◷
                                    </span>

                                    <input
                                        id="created-date"
                                        name="createdAt"
                                        type="date"
                                        value={createdAt}
                                        onChange={
                                            handleDateChange
                                        }
                                        disabled={loading}
                                    />

                                </div>

                                <p className="ledger-field-help">
                                    Select the date associated with
                                    this ledger.
                                </p>

                            </div>

                            {/* =================================================
                                ACTIONS
                            ================================================= */}

                            <div className="ledger-form-actions">

                                {/* =================================================
                                    CANCEL
                                ================================================= */}

                                <button
                                    type="button"
                                    className="ledger-secondary-button"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                                {/* =================================================
                                    T12 - EDIT LEDGER
                                =================================================
                                    
                                    IMPORTANT:
                                    This button intentionally does NOT use
                                    disabled={loading}.

                                    T12 must be able to click this button
                                    and immediately focus the description
                                    input.

                                ================================================= */}

                                <button
                                    type="button"
                                    className="ledger-edit-button"
                                    onClick={handleEdit}
                                >
                                    <span>
                                        ✎
                                    </span>

                                    Edit Ledger
                                </button>

                                {/* =================================================
                                    SUBMIT
                                ================================================= */}

                                <button
                                    type="submit"
                                    className="ledger-submit-button"
                                    disabled={loading}
                                >

                                    {loading ? (
                                        <>
                                            <span className="ledger-spinner"></span>

                                            Creating Ledger...
                                        </>
                                    ) : (
                                        <>
                                            <span className="ledger-submit-icon">
                                                +
                                            </span>

                                            Add Ledger
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                    {/* =================================================
                        INFORMATION PANEL
                    ================================================= */}

                    <aside className="ledger-info-panel">

                        <div className="ledger-info-panel-top">

                            <span>
                                LEDGER MANAGEMENT
                            </span>

                            <div className="ledger-info-symbol">
                                L
                            </div>

                        </div>

                        <h2>
                            Keep your financial records
                            organized.
                        </h2>

                        <p>
                            Create structured ledgers that make
                            financial operations easier to track,
                            review and manage.
                        </p>

                        <div className="ledger-benefits">

                            {/* =================================================
                                BENEFIT 1
                            ================================================= */}

                            <div className="ledger-benefit">

                                <div className="ledger-benefit-icon">
                                    ✓
                                </div>

                                <section>

                                    <strong>
                                        Organized Records
                                    </strong>

                                    <span>
                                        Maintain clear financial
                                        ledgers.
                                    </span>

                                </section>

                            </div>

                            {/* =================================================
                                BENEFIT 2
                            ================================================= */}

                            <div className="ledger-benefit">

                                <div className="ledger-benefit-icon">
                                    ✓
                                </div>

                                <section>

                                    <strong>
                                        Secure Access
                                    </strong>

                                    <span>
                                        Protected with role-based
                                        access.
                                    </span>

                                </section>

                            </div>

                            {/* =================================================
                                BENEFIT 3
                            ================================================= */}

                            <div className="ledger-benefit">

                                <div className="ledger-benefit-icon">
                                    ✓
                                </div>

                                <section>

                                    <strong>
                                        Easy Management
                                    </strong>

                                    <span>
                                        Create, edit and manage
                                        ledgers efficiently.
                                    </span>

                                </section>

                            </div>

                        </div>

                        {/* =================================================
                            CURRENT ROLE
                        ================================================= */}

                        <div className="ledger-current-role">

                            <span>
                                CURRENT ROLE
                            </span>

                            <strong>
                                {role}
                            </strong>

                        </div>

                    </aside>

                </section>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="ledger-create-footer">

                    <span>
                        VaultFlow Financial Management
                    </span>

                    <span>
                        Secure ledger control
                    </span>

                </footer>

            </div>

        </main>
    );
};

export default LedgerForm;