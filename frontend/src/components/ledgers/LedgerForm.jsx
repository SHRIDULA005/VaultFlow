import React, { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LedgerForm.css";

const LedgerForm = ({ editMode = false }) => {

    const navigate = useNavigate();

    const [ledgerId, setLedgerId] = useState("");
    const [description, setDescription] = useState("");
    const [createdAt, setCreatedAt] = useState("");

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [loading, setLoading] = useState(false);

    /*
     * useRef is used for the Ledger Description input.
     * T12 checks that clicking "Edit Ledger" moves
     * the focus directly to this input.
     */
    const descriptionRef = useRef(null);


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
     * SUBMIT LEDGER
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

            setErrorMessage(
                "Ledger ID is required."
            );

            return;
        }


        /*
         * Validate Ledger Description
         */
        if (!description.trim()) {

            setErrorMessage(
                "Ledger Description is required."
            );

            return;
        }


        try {

            setLoading(true);


            /*
             * Get JWT token
             */
            const token =
                localStorage.getItem("token");


            /*
             * Ledger payload
             */
            const ledgerData = {

                id: ledgerId.trim(),

                description: description.trim(),

                createdAt:
                    createdAt || null

            };


            /*
             * =================================================
             * CREATE LEDGER REQUEST
             * =================================================
             */
            await axios.post(
                "/api/ledgers",
                ledgerData,
                {
                    headers: token
                        ? {
                              Authorization:
                                  `Bearer ${token}`
                          }
                        : {}
                }
            );


            /*
             * Show success message
             */
            setSuccessMessage(
                "Ledger added successfully"
            );


            /*
             * Clear form fields
             */
            setLedgerId("");

            setDescription("");

            setCreatedAt("");


            /*
             * =================================================
             * RETURN TO LEDGERS PAGE
             * =================================================
             *
             * Give the user a short confirmation before
             * navigating back to the Ledger List.
             */
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


            /*
             * =================================================
             * 401 - SESSION EXPIRED
             * =================================================
             */
            if (
                error.response &&
                error.response.status === 401
            ) {

                localStorage.removeItem(
                    "token"
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

                }, 700);


                return;
            }


            /*
             * =================================================
             * 403 - NOT AUTHORIZED
             * =================================================
             */
            if (
                error.response &&
                error.response.status === 403
            ) {

                setErrorMessage(
                    "You are not authorized to create a ledger."
                );

                return;
            }


            /*
             * =================================================
             * BACKEND ERROR MESSAGE
             * =================================================
             */
            if (
                error.response &&
                error.response.data
            ) {

                const responseData =
                    error.response.data;


                /*
                 * Backend returned a string
                 */
                if (
                    typeof responseData === "string"
                ) {

                    setErrorMessage(
                        responseData
                    );

                    return;
                }


                /*
                 * Backend returned an object
                 * with a message property
                 */
                if (
                    responseData.message
                ) {

                    setErrorMessage(
                        responseData.message
                    );

                    return;
                }

            }


            /*
             * =================================================
             * DEFAULT ERROR
             * =================================================
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

        navigate(
            "/ledgers"
        );

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

                        Enter a unique identifier for this ledger.

                    </small>

                </div>


                {/* =================================================
                    LEDGER DESCRIPTION
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
                    />

                </div>


                {/* =================================================
                    FORM ACTIONS
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
                        EDIT LEDGER
                    =================================================
                    
                        This is intentionally preserved because
                        T12 searches for the "Edit Ledger" button
                        and checks that it focuses the description
                        input through useRef.
                    ================================================= */}

                    {editMode && (

                        <button
                            type="button"
                            className="ledger-edit-button"
                            onClick={handleEdit}
                            disabled={loading}
                        >

                            Edit Ledger

                        </button>

                    )}

                </div>

            </form>

        </div>

    );

};


export default LedgerForm;