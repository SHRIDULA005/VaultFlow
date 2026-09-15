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
    // T12 - LEDGER DESCRIPTION REF
    // =========================================================
    //
    // The Jest T12 test renders LedgerForm directly.
    // Therefore, this implementation does NOT depend on Router.
    //
    // Clicking "Edit Ledger" must focus this input.
    // =========================================================

    const descriptionRef = useRef(null);

    // =========================================================
    // ROUTER-INDEPENDENT NAVIGATION
    // =========================================================
    //
    // We intentionally avoid useNavigate() here because
    // LedgerForm can be rendered directly by tests without
    // BrowserRouter/MemoryRouter.
    // =========================================================

    const navigate = (path, options = {}) => {
        try {
            if (options.replace) {
                window.history.replaceState({}, "", path);
            } else {
                window.history.pushState({}, "", path);
            }

            window.dispatchEvent(new PopStateEvent("popstate"));
        } catch (error) {
            console.error("Navigation error:", error);
        }
    };

    // =========================================================
    // T12 - EDIT LEDGER
    // =========================================================
    //
    // Clicking this button directly focuses the Ledger
    // Description input.
    // =========================================================

    const handleEdit = () => {
        if (descriptionRef.current) {
            descriptionRef.current.focus();
        }
    };

    // =========================================================
    // SUBMIT LEDGER
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Clear previous notifications
        setSuccessMessage("");
        setErrorMessage("");

        // =====================================================
        // ROLE CHECK
        // =====================================================

        const storedRole =
            localStorage.getItem("role") || "";

        const role = storedRole
            .replace(/^ROLE_/i, "")
            .trim()
            .toUpperCase();

        if (
            role &&
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
            // REQUEST DATA
            // =================================================

            const ledgerData = {
                id: ledgerId.trim(),
                description: description.trim(),
                createdAt: createdAt || null
            };

            // =================================================
            // CREATE LEDGER
            // =================================================

            await axios.post(
                `${API_BASE_URL}/api/ledgers`,
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
                "Ledger added successfully"
            );

            // Clear form
            setLedgerId("");
            setDescription("");
            setCreatedAt("");

            // Return to ledger list
            setTimeout(() => {
                navigate("/ledgers", {
                    replace: true
                });
            }, 700);

        } catch (error) {
            console.error(
                "Unable to create ledger:",
                error
            );

            // =================================================
            // 401 - SESSION EXPIRED
            // =================================================

            if (
                error?.response?.status === 401
            ) {
                localStorage.removeItem("token");

                setErrorMessage(
                    "Session expired. Please log in again"
                );

                setTimeout(() => {
                    navigate("/login", {
                        replace: true
                    });
                }, 700);

                return;
            }

            // =================================================
            // 403 - FORBIDDEN
            // =================================================

            if (
                error?.response?.status === 403
            ) {
                setErrorMessage(
                    "You are not authorized to create a ledger."
                );

                return;
            }

            // =================================================
            // BACKEND ERROR MESSAGE
            // =================================================

            if (error?.response?.data) {
                const responseData =
                    error.response.data;

                if (
                    typeof responseData === "string"
                ) {
                    setErrorMessage(responseData);
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
                HEADER
            ================================================= */}

            <div className="ledger-form-header">

                <div>

                    <span className="ledger-form-eyebrow">
                        VAULTFLOW
                    </span>

                    <h2>
                        Create Ledger
                    </h2>

                    <p>
                        Add a new financial ledger
                        to the system.
                    </p>

                </div>

            </div>

            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {successMessage && (
                <div
                    className="ledger-form-success"
                    role="alert"
                >

                    <span className="ledger-success-icon">
                        ✓
                    </span>

                    <span>
                        {successMessage}
                    </span>

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

                    <span>
                        {errorMessage}
                    </span>

                </div>
            )}

            {/* =================================================
                LEDGER FORM
            ================================================= */}

            <form
                className="ledger-form"
                onSubmit={handleSubmit}
            >

                {/* =================================================
                    LEDGER ID
                ================================================= */}

                <div className="ledger-form-field">

                    <label htmlFor="ledger-id">
                        Ledger ID
                    </label>

                    <input
                        id="ledger-id"
                        name="ledgerId"
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
                    />

                    <small>
                        Enter a unique identifier
                        for this ledger.
                    </small>

                </div>

                {/* =================================================
                    LEDGER DESCRIPTION
                    =================================================
                    
                    T12 IMPORTANT:
                    ref={descriptionRef}
                    
                    This is the element that receives
                    focus when "Edit Ledger" is clicked.
                ================================================= */}

                <div className="ledger-form-field">

                    <label htmlFor="ledger-description">
                        Ledger Description
                    </label>

                    <input
                        id="ledger-description"
                        name="description"
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
                    />

                    <small>
                        Describe the purpose
                        of this financial ledger.
                    </small>

                </div>

                {/* =================================================
                    CREATED DATE
                ================================================= */}

                <div className="ledger-form-field">

                    <label htmlFor="created-date">
                        Created Date
                    </label>

                    <input
                        id="created-date"
                        name="createdAt"
                        type="date"
                        value={createdAt}
                        onChange={(event) =>
                            setCreatedAt(
                                event.target.value
                            )
                        }
                    />

                    <small>
                        Select the ledger creation date.
                    </small>

                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="ledger-form-actions">

                    {/* =================================================
                        ADD LEDGER
                    ================================================= */}

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
                                ></span>

                                Creating Ledger...
                            </>
                        ) : (
                            <>
                                <span aria-hidden="true">
                                    +
                                </span>

                                Add Ledger
                            </>
                        )}

                    </button>

                    {/* =================================================
                        CANCEL
                    ================================================= */}

                    <button
                        type="button"
                        className="ledger-cancel-button"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    {/* =================================================
                        T12 - EDIT LEDGER

                        IMPORTANT:
                        type="button"

                        NOT type="submit".

                        Clicking this button calls handleEdit()
                        and focuses descriptionRef.
                    ================================================= */}

                    <button
                        type="button"
                        className="ledger-edit-button"
                        onClick={handleEdit}
                        disabled={loading}
                    >
                        Edit Ledger
                    </button>

                </div>

            </form>

        </div>
    );
};

export default LedgerForm;