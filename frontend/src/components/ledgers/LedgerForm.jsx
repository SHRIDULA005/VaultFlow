import React, { useRef, useState } from "react";
import axios from "axios";
import "./LedgerForm.css";

/*
 * =========================================================
 * VAULTFLOW API CONFIGURATION
 * =========================================================
 *
 * React:
 *     http://127.0.0.1:3000
 *
 * Spring Boot:
 *     http://localhost:8080
 *
 * Ledger API:
 *     http://localhost:8080/api/ledgers
 *
 * IMPORTANT:
 * Do not use only "/api/ledgers" here.
 * That would send the request to the React server on port 3000.
 */
const API_BASE_URL = "http://localhost:8080/api";


const LedgerForm = () => {
    // =========================================================
    // FORM STATE
    // =========================================================

    const [ledgerId, setLedgerId] = useState("");
    const [description, setDescription] = useState("");
    const [createdAt, setCreatedAt] = useState("");


    // =========================================================
    // UI STATE
    // =========================================================

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);


    // =========================================================
    // DESCRIPTION INPUT REF
    // =========================================================
    //
    // T12:
    // Clicking "Edit Ledger" must focus the description field.
    //
    // =========================================================

    const descriptionRef = useRef(null);


    // =========================================================
    // ROLE
    // =========================================================

    const getCurrentRole = () => {
        const storedRole =
            localStorage.getItem("role") || "USER";

        return storedRole
            .trim()
            .toUpperCase()
            .replace(/^ROLE_/, "");
    };

    const role = getCurrentRole();

    const canCreate =
        role === "AUDITOR" ||
        role === "ADMIN";


    // =========================================================
    // NAVIGATION
    // =========================================================
    //
    // Router-independent navigation.
    //
    // This component can be rendered directly by Jest without
    // requiring BrowserRouter.
    //
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
    // CLEAR ALERTS
    // =========================================================

    const clearMessages = () => {
        setSuccessMessage("");
        setErrorMessage("");
    };


    // =========================================================
    // EDIT LEDGER BUTTON
    // =========================================================
    //
    // T12 REQUIREMENT
    //
    // =========================================================

    const handleEdit = () => {
        if (descriptionRef.current) {
            descriptionRef.current.focus();
        }
    };


    // =========================================================
    // FIELD CHANGE HANDLERS
    // =========================================================

    const handleLedgerIdChange = (event) => {
        setLedgerId(event.target.value);

        if (errorMessage) {
            setErrorMessage("");
        }

        if (successMessage) {
            setSuccessMessage("");
        }
    };


    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);

        if (errorMessage) {
            setErrorMessage("");
        }

        if (successMessage) {
            setSuccessMessage("");
        }
    };


    const handleDateChange = (event) => {
        setCreatedAt(event.target.value);

        if (errorMessage) {
            setErrorMessage("");
        }
    };


    // =========================================================
    // VALIDATION
    // =========================================================

    const validateForm = () => {
        const cleanLedgerId = ledgerId.trim();
        const cleanDescription = description.trim();

        if (!cleanLedgerId) {
            setErrorMessage(
                "Ledger ID is required."
            );

            return false;
        }

        if (!cleanDescription) {
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


    // =========================================================
    // SUBMIT LEDGER
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Prevent accidental double submission.
        if (loading) {
            return;
        }

        clearMessages();


        // =====================================================
        // ROLE PROTECTION
        // =====================================================

        const currentRole = getCurrentRole();

        if (
            currentRole !== "AUDITOR" &&
            currentRole !== "ADMIN"
        ) {
            setErrorMessage(
                "You are not authorized to create a ledger."
            );

            return;
        }


        // =====================================================
        // FORM VALIDATION
        // =====================================================

        if (!validateForm()) {
            return;
        }


        try {
            setLoading(true);


            // =================================================
            // JWT
            // =================================================

            const token =
                localStorage.getItem("token");


            // =================================================
            // REQUEST PAYLOAD
            // =================================================

            const ledgerData = {
                id: ledgerId.trim(),
                description: description.trim(),
                createdAt: createdAt || null
            };


            /*
             * =================================================
             * CREATE LEDGER
             * =================================================
             *
             * IMPORTANT:
             *
             * Old:
             *     /api/ledgers
             *
             * This goes to:
             *     http://localhost:3000/api/ledgers
             *
             * Correct:
             *     http://localhost:8080/api/ledgers
             *
             * Spring Boot owns this endpoint.
             */

            await axios.post(
                `${API_BASE_URL}/ledgers`,
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

            setErrorMessage("");


            // Clear form after successful creation.
            setLedgerId("");
            setDescription("");
            setCreatedAt("");


            /*
             * Give the user enough time to see the success
             * notification before returning to Ledgers.
             */

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
            // BACKEND ERROR MESSAGE
            // =================================================

            const responseData =
                error?.response?.data;


            if (responseData) {

                // Spring Boot may return:
                //
                // "Some error message"

                if (
                    typeof responseData ===
                    "string"
                ) {

                    /*
                     * Ignore raw HTML error pages.
                     * They are not useful to the user.
                     */

                    if (
                        responseData
                            .toLowerCase()
                            .includes("<!doctype html>") ||
                        responseData
                            .toLowerCase()
                            .includes("<html")
                    ) {

                        setErrorMessage(
                            "Unable to connect to the ledger service. Please make sure the backend is running."
                        );

                        return;
                    }


                    setErrorMessage(
                        responseData
                    );

                    return;
                }


                // Spring Boot JSON error:
                //
                // {
                //     "message": "..."
                // }

                if (
                    typeof responseData.message ===
                    "string" &&
                    responseData.message.trim()
                ) {

                    setErrorMessage(
                        responseData.message
                    );

                    return;
                }


                // Alternative error fields.
                if (
                    typeof responseData.error ===
                    "string" &&
                    responseData.error.trim()
                ) {

                    setErrorMessage(
                        responseData.error
                    );

                    return;
                }
            }


            // =================================================
            // NETWORK ERROR
            // =================================================

            if (
                error?.code === "ERR_NETWORK" ||
                !error?.response
            ) {

                setErrorMessage(
                    "Unable to connect to the ledger service. Please make sure the backend is running on port 8080."
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
    // UNAUTHORIZED STATE
    // =========================================================

    if (!canCreate) {

        return (
            <main className="ledger-create-page">

                <div className="ledger-create-shell">

                    <header className="ledger-create-topbar">

                        <div className="ledger-brand">

                            <div className="ledger-brand-logo">
                                VF
                            </div>

                            <div>
                                <strong>
                                    VaultFlow
                                </strong>

                                <span>
                                    FINANCIAL OPERATIONS
                                </span>
                            </div>

                        </div>


                        <div className="ledger-role-pill">

                            <span></span>

                            {role}

                        </div>

                    </header>


                    <section className="ledger-unauthorized">

                        <div className="ledger-unauthorized-icon">
                            !
                        </div>

                        <h1>
                            Access Restricted
                        </h1>

                        <p>
                            Your current role does not have
                            permission to create financial ledgers.
                        </p>

                        <button
                            type="button"
                            className="ledger-secondary-button"
                            onClick={() =>
                                navigate("/ledgers")
                            }
                        >
                            ← Back to Ledgers
                        </button>

                    </section>

                </div>

            </main>
        );
    }


    // =========================================================
    // MAIN UI
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
                            ← Back to Ledgers
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
                    ALERTS
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


                        <div className="ledger-form-divider">
                        </div>


                        <form
                            className="ledger-form"
                            onSubmit={handleSubmit}
                            noValidate
                        >


                            {/* =====================================
                                LEDGER ID
                            ===================================== */}

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
                                        maxLength={100}
                                    />

                                </div>


                                <p className="ledger-field-help">
                                    Use a unique identifier for
                                    this financial ledger.
                                </p>

                            </div>


                            {/* =====================================
                                DESCRIPTION
                            ===================================== */}

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
                                        maxLength={255}
                                    />

                                </div>


                                <p className="ledger-field-help">
                                    Give this ledger a clear and
                                    meaningful business description.
                                </p>

                            </div>


                            {/* =====================================
                                CREATED DATE
                            ===================================== */}

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


                            {/* =====================================
                                ACTIONS
                            ===================================== */}

                            <div className="ledger-form-actions">


                                {/* CANCEL */}

                                <button
                                    type="button"
                                    className="ledger-secondary-button"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>


                                {/* =================================
                                    EDIT LEDGER

                                    IMPORTANT:
                                    Keep this button for T12.
                                ================================= */}

                                <button
                                    type="button"
                                    className="ledger-edit-button"
                                    onClick={handleEdit}
                                    disabled={loading}
                                >
                                    ✎ Edit Ledger
                                </button>


                                {/* =================================
                                    SUBMIT
                                ================================= */}

                                <button
                                    type="submit"
                                    className="ledger-submit-button"
                                    disabled={loading}
                                >

                                    {loading ? (

                                        <>
                                            <span
                                                className="ledger-spinner"
                                                aria-hidden="true"
                                            >
                                            </span>

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