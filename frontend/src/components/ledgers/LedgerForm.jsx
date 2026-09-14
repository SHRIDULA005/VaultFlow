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
    //
    // T12:
    // Clicking "Edit Ledger" focuses the Ledger Description input.
    //
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
                SUCCESS MESSAGE
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
                FORM
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
                    </label>

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

                    <small>
                        Select the ledger creation date.
                    </small>

                </div>


                {/* =================================================
                    ACTION BUTTONS
                ================================================= */}

                <div className="ledger-form-actions">

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
                                <span>
                                    +
                                </span>

                                Add Ledger
                            </>

                        )}

                    </button>


                    {/* CANCEL */}

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
                        =================================================
                        
                        T12 REQUIREMENT:
                        Clicking this button must focus the
                        Ledger Description input.
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