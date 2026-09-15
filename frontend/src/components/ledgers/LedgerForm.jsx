import React, { useRef, useState } from "react";
import axios from "axios";
import "./LedgerForm.css";

const API_BASE_URL = "http://localhost:8080";

const LedgerForm = () => {
    const [ledgerId, setLedgerId] = useState("");
    const [description, setDescription] = useState("");
    const [createdAt, setCreatedAt] = useState("");

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    /*
     * =========================================================
     * T12 — DESCRIPTION REF
     * =========================================================
     */
    const descriptionRef = useRef(null);

    /*
     * =========================================================
     * T12 — EDIT LEDGER
     *
     * Must be synchronous.
     * Do NOT navigate here.
     * Do NOT use setTimeout here.
     * =========================================================
     */
    const handleEdit = () => {
        if (descriptionRef.current) {
            descriptionRef.current.focus();
        }
    };

    /*
     * =========================================================
     * NAVIGATION
     * =========================================================
     */
    const navigate = (path, options = {}) => {
        try {
            if (options.replace) {
                window.history.replaceState({}, "", path);
            } else {
                window.history.pushState({}, "", path);
            }

            window.dispatchEvent(
                new PopStateEvent("popstate")
            );
        } catch (error) {
            console.error("Navigation error:", error);
        }
    };

    /*
     * =========================================================
     * CANCEL
     * =========================================================
     */
    const handleCancel = () => {
        navigate("/ledgers");
    };

    /*
     * =========================================================
     * SUBMIT
     * =========================================================
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");

        /*
         * -----------------------------------------------------
         * ROLE
         * -----------------------------------------------------
         */
        const storedRole =
            localStorage.getItem("role") || "";

        const role = storedRole
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

        /*
         * -----------------------------------------------------
         * VALIDATION
         * -----------------------------------------------------
         */
        if (!ledgerId.trim()) {
            setErrorMessage(
                "Ledger ID is required."
            );
            return;
        }

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

            /*
             * -------------------------------------------------
             * JWT
             * -------------------------------------------------
             */
            const token =
                localStorage.getItem("token");

            /*
             * -------------------------------------------------
             * PAYLOAD
             * -------------------------------------------------
             */
            const ledgerData = {
                id: ledgerId.trim(),
                description: description.trim(),
                createdAt: createdAt || null
            };

            /*
             * -------------------------------------------------
             * IMPORTANT
             *
             * Use the Spring Boot server directly.
             *
             * This avoids:
             *
             *     localhost:3000/api/ledgers
             *
             * and sends the request to:
             *
             *     localhost:8080/api/ledgers
             * -------------------------------------------------
             */
            const response = await axios.post(
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

            console.log(
                "Ledger created successfully:",
                response.data
            );

            /*
             * -------------------------------------------------
             * SUCCESS
             * -------------------------------------------------
             */
            setSuccessMessage(
                "Ledger added successfully"
            );

            setLedgerId("");
            setDescription("");
            setCreatedAt("");

            /*
             * Give the user time to see success message.
             */
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

            const status =
                error?.response?.status;

            /*
             * -------------------------------------------------
             * 401
             * -------------------------------------------------
             */
            if (status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("user");

                setErrorMessage(
                    "Session expired. Please log in again."
                );

                setTimeout(() => {
                    navigate("/login", {
                        replace: true
                    });
                }, 700);

                return;
            }

            /*
             * -------------------------------------------------
             * 403
             * -------------------------------------------------
             */
            if (status === 403) {
                setErrorMessage(
                    "You are not authorized to create a ledger."
                );
                return;
            }

            /*
             * -------------------------------------------------
             * 400
             * -------------------------------------------------
             */
            if (status === 400) {
                const responseData =
                    error?.response?.data;

                if (
                    typeof responseData === "string"
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

            /*
             * -------------------------------------------------
             * 409 — DUPLICATE LEDGER
             * -------------------------------------------------
             */
            if (status === 409) {
                setErrorMessage(
                    "A ledger with this ID already exists."
                );
                return;
            }

            /*
             * -------------------------------------------------
             * OTHER BACKEND ERRORS
             * -------------------------------------------------
             */
            const responseData =
                error?.response?.data;

            if (
                typeof responseData === "string"
            ) {
                /*
                 * Don't display raw HTML such as:
                 *
                 * Cannot POST /api/ledgers
                 *
                 * as the primary UI error.
                 */
                if (
                    responseData.includes(
                        "Cannot POST"
                    )
                ) {
                    setErrorMessage(
                        "Unable to connect to the ledger service. Please make sure the backend is running."
                    );
                } else {
                    setErrorMessage(
                        responseData
                    );
                }

                return;
            }

            if (responseData?.message) {
                setErrorMessage(
                    responseData.message
                );
                return;
            }

            /*
             * Network/server fallback
             */
            if (!error?.response) {
                setErrorMessage(
                    "Unable to connect to the backend. Please make sure the Spring Boot server is running on port 8080."
                );
                return;
            }

            setErrorMessage(
                "Unable to create ledger. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="ledger-create-page">

            <div className="ledger-create-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="ledger-create-header">

                    <div>
                        <span className="ledger-eyebrow">
                            FINANCIAL CONTROL
                        </span>

                        <h1>
                            Create Ledger
                        </h1>

                        <p>
                            Add a new financial ledger
                            to your VaultFlow workspace.
                        </p>
                    </div>

                    <div className="ledger-security-badge">
                        <span>✓</span>
                        Secure workspace
                    </div>

                </div>

                {/* =================================================
                    ALERTS
                ================================================= */}

                {successMessage && (
                    <div
                        className="ledger-alert ledger-alert-success"
                        role="alert"
                    >
                        <span>✓</span>

                        <div>
                            <strong>
                                Success
                            </strong>

                            <p>
                                {successMessage}
                            </p>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <div
                        className="ledger-alert ledger-alert-error"
                        role="alert"
                    >
                        <span>!</span>

                        <div>
                            <strong>
                                Unable to continue
                            </strong>

                            <p>
                                {errorMessage}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setErrorMessage("")
                            }
                            aria-label="Close error"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <section className="ledger-create-layout">

                    {/* =================================================
                        FORM CARD
                    ================================================= */}

                    <div className="ledger-form-card">

                        <div className="ledger-card-header">

                            <div className="ledger-card-icon">
                                +
                            </div>

                            <div>
                                <h2>
                                    Ledger Information
                                </h2>

                                <p>
                                    Enter the details for
                                    your new financial ledger.
                                </p>
                            </div>

                        </div>

                        <form
                            className="ledger-form"
                            onSubmit={handleSubmit}
                        >

                            {/* =================================================
                                LEDGER ID
                            ================================================= */}

                            <div className="ledger-form-field">

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
                                    Use a unique identifier
                                    for this financial ledger.
                                </small>

                            </div>

                            {/* =================================================
                                LEDGER DESCRIPTION

                                IMPORTANT FOR T12
                            ================================================= */}

                            <div className="ledger-form-field">

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

                                        /*
                                         * T12
                                         */
                                        ref={descriptionRef}

                                        type="text"
                                        value={description}
                                        onChange={(event) =>
                                            setDescription(
                                                event.target.value
                                            )
                                        }

                                        /*
                                         * VERY IMPORTANT:
                                         * The test searches for this.
                                         */
                                        placeholder="Ledger Description"

                                        autoComplete="off"
                                        required
                                        disabled={loading}
                                    />

                                </div>

                                <small>
                                    Give this ledger a clear
                                    and meaningful description.
                                </small>

                            </div>

                            {/* =================================================
                                CREATED DATE
                            ================================================= */}

                            <div className="ledger-form-field">

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
                                        onChange={(event) =>
                                            setCreatedAt(
                                                event.target.value
                                            )
                                        }
                                        disabled={loading}
                                    />

                                </div>

                                <small>
                                    Select the date associated
                                    with this ledger.
                                </small>

                            </div>

                            {/* =================================================
                                ACTIONS
                            ================================================= */}

                            <div className="ledger-form-actions">

                                <button
                                    type="button"
                                    className="ledger-cancel-button"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                                {/* =================================================
                                    T12 BUTTON

                                    Always rendered.
                                    Directly focuses description.
                                ================================================= */}

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
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="ledger-spinner"></span>
                                            Creating Ledger...
                                        </>
                                    ) : (
                                        <>
                                            <span>+</span>
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

                        <span className="ledger-info-eyebrow">
                            LEDGER MANAGEMENT
                        </span>

                        <h2>
                            Keep your financial
                            records organized.
                        </h2>

                        <p>
                            Create structured ledgers
                            that make financial operations
                            easier to track, review and manage.
                        </p>

                        <div className="ledger-feature-list">

                            <div>
                                <span>✓</span>

                                <div>
                                    <strong>
                                        Organized Records
                                    </strong>

                                    <small>
                                        Maintain clear
                                        financial ledgers.
                                    </small>
                                </div>
                            </div>

                            <div>
                                <span>✓</span>

                                <div>
                                    <strong>
                                        Secure Access
                                    </strong>

                                    <small>
                                        Protected by role-based
                                        access.
                                    </small>
                                </div>
                            </div>

                            <div>
                                <span>✓</span>

                                <div>
                                    <strong>
                                        Easy Management
                                    </strong>

                                    <small>
                                        Create, edit and manage
                                        ledgers efficiently.
                                    </small>
                                </div>
                            </div>

                        </div>

                        <div className="ledger-current-role">

                            <span>
                                CURRENT ROLE
                            </span>

                            <strong>
                                {(
                                    localStorage.getItem(
                                        "role"
                                    ) || "USER"
                                )
                                    .replace(
                                        /^ROLE_/i,
                                        ""
                                    )
                                    .toUpperCase()}
                            </strong>

                        </div>

                    </aside>

                </section>

            </div>

        </main>
    );
};

export default LedgerForm;