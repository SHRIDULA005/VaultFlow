import React, { useRef, useState } from "react";
import axios from "axios";
import "./LedgerForm.css";

const API_BASE_URL = "http://localhost:8080";

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
    // T12:
    // Clicking "Edit Ledger" focuses the Ledger Description input.
    // =========================================================

    const descriptionRef = useRef(null);

    // =========================================================
    // NAVIGATION
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
    // EDIT LEDGER BUTTON
    // =========================================================

    const handleEdit = () => {

        if (descriptionRef.current) {

            descriptionRef.current.focus();

        }
    };

    // =========================================================
    // SUBMIT FORM
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        // Clear old messages
        setSuccessMessage("");
        setErrorMessage("");

        // =====================================================
        // CHECK ROLE
        // =====================================================

        const storedRole =
            localStorage.getItem("role") || "";

        const role =
            storedRole
                .replace(/^ROLE_/i, "")
                .trim()
                .toUpperCase();

        if (
            role !== "AUDITOR" &&
            role !== "ADMIN"
        ) {

            setErrorMessage(
                "You are not authorized to create a ledger."
            );

            return;
        }

        // =====================================================
        // VALIDATE LEDGER ID
        // =====================================================

        if (!ledgerId.trim()) {

            setErrorMessage(
                "Ledger ID is required."
            );

            return;
        }

        // =====================================================
        // VALIDATE DESCRIPTION
        // =====================================================

        if (!description.trim()) {

            setErrorMessage(
                "Ledger Description is required."
            );

            if (descriptionRef.current) {
                descriptionRef.current.focus();
            }

            return;
        }

        try {

            setLoading(true);

            // =================================================
            // GET JWT TOKEN
            // =================================================

            const token =
                localStorage.getItem("token");

            // =================================================
            // REQUEST PAYLOAD
            // =================================================

            const ledgerData = {

                id: ledgerId.trim(),

                description:
                    description.trim(),

                createdAt:
                    createdAt || null
            };

            // =================================================
            // CREATE LEDGER
            // =================================================

            await axios.post(
                `${API_BASE_URL}/api/ledgers`,
                ledgerData,
                {
                    headers: token
                        ? {
                            Authorization:
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        }
                        : {
                            "Content-Type":
                                "application/json"
                        }
                }
            );

            // =================================================
            // SUCCESS
            // =================================================

            setSuccessMessage(
                "Ledger added successfully"
            );

            // Clear form
            setLedgerId("");
            setDescription("");
            setCreatedAt("");

            // Go back to ledger list
            setTimeout(() => {

                navigate(
                    "/ledgers",
                    {
                        replace: true
                    }
                );

            }, 700);

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
                    "Session expired. Please log in again."
                );

                setTimeout(() => {

                    navigate(
                        "/login",
                        {
                            replace: true
                        }
                    );

                }, 700);

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

                const responseData =
                    error?.response?.data;

                if (
                    typeof responseData ===
                    "string"
                ) {

                    setErrorMessage(
                        responseData
                    );

                } else if (
                    responseData?.message
                ) {

                    setErrorMessage(
                        responseData.message
                    );

                } else {

                    setErrorMessage(
                        "Invalid ledger information."
                    );
                }

                return;
            }

            // =================================================
            // BACKEND ERROR
            // =================================================

            if (
                error?.response?.data
            ) {

                const responseData =
                    error.response.data;

                if (
                    typeof responseData ===
                    "string"
                ) {

                    setErrorMessage(
                        responseData
                    );

                    return;
                }

                if (
                    responseData.message
                ) {

                    setErrorMessage(
                        responseData.message
                    );

                    return;
                }
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

        <div className="ledger-form-container">

            {/* =================================================
                TOP BRAND
            ================================================= */}

            <div className="ledger-form-top">

                <div className="ledger-form-brand">
                    <span className="ledger-brand-dot"></span>

                    <span>
                        VAULTFLOW
                    </span>
                </div>

                <div className="ledger-form-security">
                    <span className="security-dot"></span>
                    Secure Financial Management
                </div>

            </div>


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="ledger-form-header">

                <div>

                    <span className="ledger-form-eyebrow">
                        LEDGER MANAGEMENT
                    </span>

                    <h2>
                        Create Ledger
                    </h2>

                    <p>
                        Add a new financial ledger to your
                        VaultFlow account.
                    </p>

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


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {successMessage && (

                <div className="ledger-form-success">

                    <span className="ledger-success-icon">
                        ✓
                    </span>

                    <div>
                        <strong>
                            Success
                        </strong>

                        <span>
                            {successMessage}
                        </span>
                    </div>

                </div>
            )}


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {errorMessage && (

                <div
                    className="ledger-form-error"
                    role="alert"
                >

                    <span className="ledger-error-icon">
                        !
                    </span>

                    <div>
                        <strong>
                            Unable to continue
                        </strong>

                        <span>
                            {errorMessage}
                        </span>
                    </div>

                </div>
            )}


            {/* =================================================
                MAIN FORM CARD
            ================================================= */}

            <div className="ledger-form-layout">

                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    className="ledger-form"
                    onSubmit={handleSubmit}
                >

                    {/* =================================================
                        CARD HEADER
                    ================================================= */}

                    <div className="ledger-form-card-header">

                        <div className="ledger-form-card-icon">
                            +
                        </div>

                        <div>

                            <h3>
                                Ledger Information
                            </h3>

                            <p>
                                Enter the details for your new
                                financial ledger.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        LEDGER PREVIEW
                    ================================================= */}

                    <div className="ledger-preview">

                        <div className="ledger-preview-icon">
                            L
                        </div>

                        <div>

                            <span>
                                NEW LEDGER
                            </span>

                            <strong>
                                {ledgerId
                                    ? `#${ledgerId}`
                                    : "#—"}
                            </strong>

                        </div>

                        <div className="ledger-preview-status">
                            <span></span>
                            Draft
                        </div>

                    </div>


                    {/* =================================================
                        LEDGER ID
                    ================================================= */}

                    <div className="ledger-form-field">

                        <label htmlFor="ledger-id">
                            Ledger ID
                            <span>*</span>
                        </label>

                        <div className="ledger-input-wrapper">

                            <span className="input-prefix">
                                #
                            </span>

                            <input
                                id="ledger-id"
                                type="text"
                                value={ledgerId}
                                onChange={(event) =>
                                    setLedgerId(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter Ledger ID"
                                autoComplete="off"
                                required
                                disabled={loading}
                            />

                        </div>

                        <small>
                            Enter a unique identifier for this ledger.
                        </small>

                    </div>


                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <div className="ledger-form-field">

                        <label htmlFor="ledger-description">
                            Ledger Description
                            <span>*</span>
                        </label>

                        <div className="ledger-input-wrapper">

                            <span className="input-description-icon">
                                ≡
                            </span>

                            <input
                                id="ledger-description"
                                ref={descriptionRef}
                                type="text"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Ledger Description"
                                autoComplete="off"
                                required
                                disabled={loading}
                            />

                        </div>

                        <small>
                            Describe the purpose of this financial ledger.
                        </small>

                    </div>


                    {/* =================================================
                        CREATED DATE
                    ================================================= */}

                    <div className="ledger-form-field">

                        <label htmlFor="created-date">
                            Created Date
                        </label>

                        <div className="ledger-input-wrapper">

                            <input
                                id="created-date"
                                type="date"
                                value={createdAt}
                                onChange={(event) =>
                                    setCreatedAt(
                                        event.target.value
                                    )
                                }
                                disabled={loading}
                            />

                        </div>

                        <small>
                            Select the ledger creation date.
                        </small>

                    </div>


                    {/* =================================================
                        DIVIDER
                    ================================================= */}

                    <div className="ledger-form-divider"></div>


                    {/* =================================================
                        ACTION BUTTONS
                    ================================================= */}

                    <div className="ledger-form-actions">

                        {/* CANCEL */}

                        <button
                            type="button"
                            className="ledger-cancel-button"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>


                        {/* EDIT LEDGER */}
                        {/* T12 preserved */}

                        <button
                            type="button"
                            className="ledger-edit-button"
                            onClick={handleEdit}
                            disabled={loading}
                        >
                            <span>✎</span>
                            Edit Ledger
                        </button>


                        {/* ADD LEDGER */}

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
                                    <span className="submit-plus">
                                        +
                                    </span>

                                    Add Ledger
                                </>

                            )}

                        </button>

                    </div>

                </form>


                {/* =================================================
                    RIGHT INFORMATION PANEL
                ================================================= */}

                <aside className="ledger-info-panel">

                    <div className="info-panel-icon">
                        ▱
                    </div>

                    <h3>
                        Ledger Management
                    </h3>

                    <p>
                        Keep your financial records organized
                        and easy to manage.
                    </p>


                    <div className="info-feature">

                        <div className="feature-icon">
                            ✓
                        </div>

                        <div>
                            <strong>
                                Organized Records
                            </strong>

                            <span>
                                Maintain clear financial ledgers.
                            </span>
                        </div>

                    </div>


                    <div className="info-feature">

                        <div className="feature-icon">
                            ✓
                        </div>

                        <div>
                            <strong>
                                Secure Access
                            </strong>

                            <span>
                                Protected with role-based access.
                            </span>
                        </div>

                    </div>


                    <div className="info-feature">

                        <div className="feature-icon">
                            ✓
                        </div>

                        <div>
                            <strong>
                                Easy Management
                            </strong>

                            <span>
                                Create, edit and manage ledgers.
                            </span>
                        </div>

                    </div>


                    {/* ROLE */}

                    <div className="role-card">

                        <span>
                            CURRENT ROLE
                        </span>

                        <strong>
                            {(localStorage.getItem("role") || "USER")
                                .replace(/^ROLE_/i, "")
                                .toUpperCase()}
                        </strong>

                    </div>

                </aside>

            </div>

        </div>
    );
};

export default LedgerForm;