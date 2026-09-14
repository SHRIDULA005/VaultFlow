import React, { useRef, useState } from "react";
import axios from "axios";
import "./LedgerForm.css";

const LedgerForm = () => {
    const [ledgerId, setLedgerId] = useState("");
    const [description, setDescription] = useState("");
    const [createdAt, setCreatedAt] = useState("");

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [loading, setLoading] = useState(false);

    /*
     * =========================================================
     * DESCRIPTION INPUT REF
     * =========================================================
     *
     * T12:
     * Clicking "Edit Ledger" should focus the
     * Ledger Description input.
     */
    const descriptionRef = useRef(null);

    /*
     * =========================================================
     * NAVIGATION
     * =========================================================
     *
     * We are not using useNavigate() here because the component
     * is also rendered directly by the Jest test without a Router.
     *
     * This keeps LedgerForm test-safe while still allowing the
     * application to move to the requested route.
     */
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

    /*
     * =========================================================
     * EDIT LEDGER
     * =========================================================
     */
    const handleEdit = () => {
        if (descriptionRef.current) {
            descriptionRef.current.focus();
        }
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
         * Validate Ledger ID
         */
        if (!ledgerId.trim()) {
            setErrorMessage("Ledger ID is required.");
            return;
        }

        /*
         * Validate Description
         */
        if (!description.trim()) {
            setErrorMessage("Ledger Description is required.");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const ledgerData = {
                id: ledgerId.trim(),
                description: description.trim(),
                createdAt: createdAt || null
            };

            await axios.post(
                "/api/ledgers",
                ledgerData,
                {
                    headers: token
                        ? {
                              Authorization: `Bearer ${token}`
                          }
                        : {}
                }
            );

            /*
             * Success
             */
            setSuccessMessage("Ledger added successfully");

            setLedgerId("");
            setDescription("");
            setCreatedAt("");

            setTimeout(() => {
                navigate("/ledgers", {
                    replace: true
                });
            }, 700);

        } catch (error) {
            console.error("Unable to create ledger:", error);

            /*
             * 401 - Session expired
             */
            if (error?.response?.status === 401) {
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

            /*
             * 403 - Unauthorized
             */
            if (error?.response?.status === 403) {
                setErrorMessage(
                    "You are not authorized to create a ledger."
                );

                return;
            }

            /*
             * Backend error response
             */
            if (error?.response?.data) {
                const responseData = error.response.data;

                if (typeof responseData === "string") {
                    setErrorMessage(responseData);
                    return;
                }

                if (responseData.message) {
                    setErrorMessage(responseData.message);
                    return;
                }
            }

            /*
             * Generic error
             */
            setErrorMessage(
                "Unable to create ledger. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    /*
     * =========================================================
     * CANCEL
     * =========================================================
     */
    const handleCancel = () => {
        if (loading) {
            return;
        }

        navigate("/ledgers");
    };

    /*
     * =========================================================
     * RENDER
     * =========================================================
     */
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
                        Add a new financial ledger to the system.
                    </p>

                </div>

            </div>

            {/* =================================================
                SUCCESS
            ================================================= */}

            {successMessage && (
                <div className="ledger-form-success">

                    <span className="ledger-success-icon">
                        ✓
                    </span>

                    <span>
                        {successMessage}
                    </span>

                </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {errorMessage && (
                <div className="ledger-form-error">

                    <span className="ledger-error-icon">
                        !
                    </span>

                    <span>
                        {errorMessage}
                    </span>

                </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            <form
                className="ledger-form"
                onSubmit={handleSubmit}
            >

                {/* Ledger ID */}

                <div className="ledger-form-field">

                    <label htmlFor="ledger-id">
                        Ledger ID
                    </label>

                    <input
                        id="ledger-id"
                        type="text"
                        value={ledgerId}
                        onChange={(event) =>
                            setLedgerId(event.target.value)
                        }
                        placeholder="Enter Ledger ID"
                        autoComplete="off"
                        required
                    />

                    <small>
                        Enter a unique identifier for this ledger.
                    </small>

                </div>

                {/* Ledger Description */}

                <div className="ledger-form-field">

                    <label htmlFor="ledger-description">
                        Ledger Description
                    </label>

                    <input
                        id="ledger-description"
                        ref={descriptionRef}
                        type="text"
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                        placeholder="Ledger Description"
                        autoComplete="off"
                        required
                    />

                    <small>
                        Describe the purpose of this financial ledger.
                    </small>

                </div>

                {/* Created Date */}

                <div className="ledger-form-field">

                    <label htmlFor="created-date">
                        Created Date
                    </label>

                    <input
                        id="created-date"
                        type="date"
                        value={createdAt}
                        onChange={(event) =>
                            setCreatedAt(event.target.value)
                        }
                    />

                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="ledger-form-actions">

                    {/* Add Ledger */}

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

                    {/* Cancel */}

                    <button
                        type="button"
                        className="ledger-cancel-button"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    {/* =================================================
                        EDIT LEDGER

                        IMPORTANT:
                        This button is intentionally rendered directly
                        so T12 can find it immediately.
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