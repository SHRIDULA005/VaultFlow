import React, { useState } from "react";
import axios from "axios";
import "./Register.css";

const Register = () => {

    const [userId, setUserId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [organizationId, setOrganizationId] = useState("");
    const [role, setRole] = useState("AUDITOR");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);


    const handleRegister = () => {

        setError("");
        setSuccess("");


        if (!userId.trim()) {

            setError("User ID is required.");

            return;
        }


        if (!email.trim()) {

            setError("Email is required.");

            return;
        }


        if (!password.trim()) {

            setError("Password is required.");

            return;
        }


        if (password.length < 6) {

            setError(
                "Password must contain at least 6 characters."
            );

            return;
        }


        if (!organizationId.trim()) {

            setError("Organization ID is required.");

            return;
        }


        setLoading(true);


        axios
            .post("/users/register", {

                userId: userId,

                email: email,

                password: password,

                role: role,

                organizationId: organizationId

            })
            .then((response) => {

                console.log(
                    "Registration successful:",
                    response.data
                );

                setSuccess(
                    "Registration successful. You can now login."
                );

                setUserId("");
                setEmail("");
                setPassword("");
                setOrganizationId("");
                setRole("AUDITOR");

            })
            .catch((err) => {

                console.error(
                    "Registration error:",
                    err
                );


                if (err?.response?.status === 409) {

                    setError(
                        "An account with this email already exists."
                    );

                } else if (
                    err?.response?.data?.message
                ) {

                    setError(
                        err.response.data.message
                    );

                } else {

                    setError(
                        "Unable to register user. Please try again."
                    );
                }

            })
            .finally(() => {

                setLoading(false);

            });
    };


    const handleLogin = () => {

        window.location.href = "/login";

    };


    return (

        <div className="register-page">

            <div className="register-card">

                {/* =================================================
                    BRAND
                ================================================= */}

                <div className="register-brand">

                    <div className="register-logo">
                        VF
                    </div>

                    <div>

                        <h1>
                            VaultFlow
                        </h1>

                        <span>
                            FINANCIAL OPERATIONS
                        </span>

                    </div>

                </div>


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="register-header">

                    <span className="register-eyebrow">
                        SECURE REGISTRATION
                    </span>

                    <h2>
                        Create your account
                    </h2>

                    <p>
                        Register a VaultFlow user and assign
                        the appropriate organizational role.
                    </p>

                </div>


                {/* =================================================
                    FORM
                ================================================= */}

                <div className="register-form">


                    {/* USER ID */}

                    <div className="register-field">

                        <label htmlFor="userId">
                            User ID
                        </label>

                        <input
                            id="userId"
                            type="text"
                            placeholder="Enter user ID"
                            value={userId}
                            onChange={(e) =>
                                setUserId(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="register-field">

                        <label htmlFor="registerEmail">
                            Email Address
                        </label>

                        <input
                            id="registerEmail"
                            type="email"
                            placeholder="e.g. auditor@vaultflow.io"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="register-field">

                        <label htmlFor="registerPassword">
                            Password
                        </label>

                        <input
                            id="registerPassword"
                            type="password"
                            placeholder="Create a secure password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                        />

                        <span className="register-help">
                            Minimum 6 characters
                        </span>

                    </div>


                    {/* ORGANIZATION */}

                    <div className="register-field">

                        <label htmlFor="organizationId">
                            Organization ID
                        </label>

                        <input
                            id="organizationId"
                            type="text"
                            placeholder="Enter organization ID"
                            value={organizationId}
                            onChange={(e) =>
                                setOrganizationId(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* ROLE */}

                    <div className="register-field">

                        <label htmlFor="role">
                            User Role
                        </label>

                        <select
                            id="role"
                            value={role}
                            onChange={(e) =>
                                setRole(
                                    e.target.value
                                )
                            }
                        >

                            <option value="AUDITOR">
                                AUDITOR
                            </option>

                            <option value="TREASURER">
                                TREASURER
                            </option>

                            <option value="ADMIN">
                                ADMIN
                            </option>

                        </select>

                        <span className="register-help">
                            Select the role assigned to this user.
                        </span>

                    </div>


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (

                        <div
                            className="register-error"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}


                    {/* =================================================
                        SUCCESS
                    ================================================= */}

                    {success && (

                        <div
                            className="register-success"
                            role="status"
                        >
                            {success}
                        </div>

                    )}


                    {/* =================================================
                        REGISTER BUTTON
                    ================================================= */}

                    <button
                        type="button"
                        className="register-button"
                        onClick={handleRegister}
                        disabled={loading}
                    >

                        {loading ? (

                            <>
                                <span className="register-spinner"></span>
                                Creating Account...
                            </>

                        ) : (

                            "Create Account"

                        )}

                    </button>


                    {/* =================================================
                        LOGIN BUTTON
                    ================================================= */}

                    <div className="register-login">

                        <span>
                            Already have an account?
                        </span>

                        <button
                            type="button"
                            onClick={handleLogin}
                        >
                            Login
                        </button>

                    </div>


                </div>


                {/* =================================================
                    SECURITY
                ================================================= */}

                <div className="register-security">

                    <span className="register-security-icon">
                        🔒
                    </span>

                    <div>

                        <strong>
                            Secure registration
                        </strong>

                        <span>
                            Passwords are protected using
                            BCrypt encryption.
                        </span>

                    </div>

                </div>


                {/* FOOTER */}

                <div className="register-footer">

                    <span>
                        VaultFlow
                    </span>

                    <span>
                        •
                    </span>

                    <span>
                        Secure Financial Management
                    </span>

                </div>

            </div>

        </div>

    );
};

export default Register;