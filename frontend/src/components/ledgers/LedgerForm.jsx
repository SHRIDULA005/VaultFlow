import React, { useRef, useState } from "react";
import axios from "axios";
import "./LedgerForm.css";

/*
 * =========================================================
 * VAULTFLOW LEDGER FORM
 * =========================================================
 *
 * Frontend:
 *     http://127.0.0.1:3000
 *
 * Backend:
 *     http://localhost:8080
 *
 * CRA proxy:
 *     /api/* -> http://localhost:8080/api/*
 *
 * Using relative API paths keeps the component compatible
 * with both the browser and the Jest test environment.
 * =========================================================
 */

const LedgerForm = () => {
    // =====================================================
    // FORM STATE
    // =====================================================

    const [ledgerId, setLedgerId] = useState("");
    const [description, setDescription] = useState("");
    const [createdAt, setCreatedAt] = useState("");


    // =====================================================
    // UI STATE
    // =====================================================

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");


    // =====================================================
    // T12 - DESCRIPTION INPUT REF
    // =====================================================

    const descriptionRef = useRef(null);


    // =====================================================
    // ROLE
    // =====================================================

    const getRole = () => {
        return (
            localStorage.getItem("role") || "USER"
        )
            .trim()
            .toUpperCase()
            .replace(/^ROLE_/, "");
    };

    const role = getRole();

    const canCreate =
        role === "AUDITOR" ||
        role === "ADMIN";


    // =====================================================
    // NAVIGATION
    // =====================================================

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


    // =====================================================
    // T12 - EDIT LEDGER
    // =====================================================

    const handleEdit = () => {
        const input = descriptionRef.current;

        if (input) {
            input.focus();

            /*
             * Select existing text when possible.
             * This makes the edit action more useful for
             * real users while keeping the focus requirement.
             */
            if (
                typeof input.select === "function"
            ) {
                input.select();
            }
        }
    };


    // =====================================================
    // FIELD HANDLERS
    // =====================================================

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


    // =====================================================
    // VALIDATION
    // =====================================================

    const validateForm = () => {

        if (!ledgerId.trim()) {
            setErrorMessage(
                "Ledger ID is required."
            );

            return false;
        }


        if (!description.trim()) {
            setErrorMessage(
                "Ledger Description is required."
            );

            if (descriptionRef.current) {
                descriptionRef.current.focus();
            }

            return false;
        }


        return true;
    };


    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (event) => {
        event.preventDefault();


        if (loading) {
            return;
        }


        setErrorMessage("");
        setSuccessMessage("");


        // =================================================
        // ROLE SECURITY
        // =================================================

        const currentRole = getRole();

        if (
            currentRole !== "AUDITOR" &&
            currentRole !== "ADMIN"
        ) {
            setErrorMessage(
                "You are not authorized to create a ledger."
            );

            return;
        }


        // =================================================
        // VALIDATION
        // =================================================

        if (!validateForm()) {
            return;
        }


        try {
            setLoading(true);


            // =============================================
            // JWT
            // =============================================

            const token =
                localStorage.getItem("token");


            // =============================================
            // PAYLOAD
            // =============================================

            const ledgerData = {
                id: ledgerId.trim(),
                description: description.trim(),
                createdAt: createdAt || null
            };


            // =============================================
            // CREATE LEDGER
            // =============================================
            //
            // IMPORTANT:
            //
            // Using /api/ledgers allows CRA's proxy to send
            // the request to Spring Boot:
            //
            // localhost:8080/api/ledgers
            //
            // =============================================

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


            // =============================================
            // SUCCESS
            // =============================================

            setSuccessMessage(
                "Ledger added successfully."
            );

            setErrorMessage("");


            // Clear form.
            setLedgerId("");
            setDescription("");
            setCreatedAt("");


            // Return to ledger list.
            window.setTimeout(() => {
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


            // =============================================
            // 401
            // =============================================

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


                window.setTimeout(() => {
                    navigate(
                        "/login",
                        {
                            replace: true
                        }
                    );
                }, 900);

                return;
            }


            // =============================================
            // 403
            // =============================================

            if (status === 403) {
                setErrorMessage(
                    "You are not authorized to create a ledger."
                );

                return;
            }


            // =============================================
            // BACKEND MESSAGE
            // =============================================

            const data =
                error?.response?.data;


            if (
                typeof data === "string" &&
                data.trim()
            ) {

                /*
                 * Don't expose raw Express/HTML error pages.
                 */
                if (
                    data
                        .toLowerCase()
                        .includes("<html")
                ) {

                    setErrorMessage(
                        "Unable to connect to the ledger service. Please make sure the backend is running on port 8080."
                    );

                    return;
                }


                setErrorMessage(data);

                return;
            }


            if (
                data?.message
            ) {
                setErrorMessage(
                    data.message
                );

                return;
            }


            // =============================================
            // NETWORK ERROR
            // =============================================

            if (
                error?.code === "ERR_NETWORK" ||
                !error?.response
            ) {

                setErrorMessage(
                    "Unable to connect to the ledger service. Please make sure the backend is running."
                );

                return;
            }


            // =============================================
            // GENERIC
            // =============================================

            setErrorMessage(
                "Unable to create ledger. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };


    // =====================================================
    // CANCEL
    // =====================================================

    const handleCancel = () => {

        if (loading) {
            return;
        }

        navigate("/ledgers");
    };


    // =====================================================
    // UI
    // =====================================================

    return (
        <main className="ledger-create-page">

            <div className="ledger-create-shell">


                {/* =================================================
                    HEADER
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
                            ← Back to Ledgers
                        </button>

                    </div>

                </header>


                {/* =================================================
                    INTRO
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
                            Add a new financial ledger to
                            your VaultFlow workspace.
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
                    SUCCESS
                ================================================= */}

                {successMessage && (

                    <div
                        className="ledger-notification ledger-notification-success"
                        role="status"
                        aria-live="polite"
                    >

                        <div className="ledger-notification-icon">
                            ✓
                        </div>

                        <div>

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
                    ERROR
                ================================================= */}

                {errorMessage && (

                    <div
                        className="ledger-notification ledger-notification-error"
                        role="alert"
                        aria-live="assertive"
                    >

                        <div className="ledger-notification-icon">
                            !
                        </div>

                        <div>

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
                    CONTENT
                ================================================= */}

                <section className="ledger-create-grid">


                    {/* =================================================
                        FORM
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


                        <div className="ledger-form-divider" />


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

                                    <span
                                        className="ledger-input-icon"
                                        aria-hidden="true"
                                    >
                                        #
                                    </span>


                                    <input
                                        id="ledger-id"
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

                                    <span
                                        className="ledger-input-icon"
                                        aria-hidden="true"
                                    >
                                        =
                                    </span>


                                    <input
                                        id="ledger-description"
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
                                DATE
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

                                    <span
                                        className="ledger-input-icon"
                                        aria-hidden="true"
                                    >
                                        ◷
                                    </span>


                                    <input
                                        id="created-date"
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


                                <button
                                    type="button"
                                    className="ledger-secondary-button"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>


                                {/* =============================================
                                    T12
                                    ============================================= */}

                                <button
                                    type="button"
                                    className="ledger-edit-button"
                                    onClick={handleEdit}
                                    disabled={loading}
                                >
                                    ✎ Edit Ledger
                                </button>


                                <button
                                    type="submit"
                                    className="ledger-submit-button"
                                    disabled={
                                        loading ||
                                        !canCreate
                                    }
                                    title={
                                        !canCreate
                                            ? "Only AUDITOR and ADMIN users can create ledgers."
                                            : ""
                                    }
                                >

                                    {loading ? (

                                        <>
                                            <span
                                                className="ledger-spinner"
                                                aria-hidden="true"
                                            />

                                            Creating Ledger...
                                        </>

                                    ) : (

                                        <>
                                            <span
                                                className="ledger-submit-icon"
                                                aria-hidden="true"
                                            >
                                                +
                                            </span>

                                            Add Ledger
                                        </>

                                    )}

                                </button>

                            </div>


                            {/* =================================================
                                ROLE NOTICE
                            ================================================= */}

                            {!canCreate && (

                                <div
                                    className="ledger-role-notice"
                                    role="status"
                                >
                                    <strong>
                                        Access limited
                                    </strong>

                                    <span>
                                        Your current role (
                                        {role}
                                        ) cannot create ledgers.
                                        Contact an administrator if
                                        you need access.
                                    </span>
                                </div>

                            )}

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

                            <div className="ledger-benefit">

                                <div>
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


                            <div className="ledger-benefit">

                                <div>
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


                            <div className="ledger-benefit">

                                <div>
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