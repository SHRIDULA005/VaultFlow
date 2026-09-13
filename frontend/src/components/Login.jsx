import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

const getRoleFromToken = (token) => {
    try {

        const parts = token.split(".");

        if (parts.length < 2) {
            return null;
        }

        const base64 = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const padded = base64.padEnd(
            base64.length +
                (4 - (base64.length % 4)) % 4,
            "="
        );

        const payload = JSON.parse(atob(padded));

        let role =
            payload.role ||
            payload.roles ||
            payload.authorities ||
            payload.authority;

        if (Array.isArray(role)) {
            role = role[0];
        }

        if (typeof role === "string") {
            role = role.replace(/^ROLE_/, "");
        }

        return role || null;

    } catch (error) {

        console.error(
            "Unable to read role from JWT:",
            error
        );

        return null;
    }
};


const Login = ({ onLogin }) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleLogin = () => {

        setLoading(true);
        setError("");

        axios
            .post("/auth/login", {
                email,
                password
            })
            .then((response) => {

                const data = response.data;

                const token =
                    typeof data === "string"
                        ? data
                        : data?.token;

                if (!token) {

                    setError(
                        "Invalid email or password"
                    );

                    return;
                }


                /*
                 * Store JWT token
                 */

                localStorage.setItem(
                    "token",
                    token
                );


                /*
                 * Get role from login response first.
                 */

                let role =
                    typeof data === "object"
                        ? (
                            data.role ||
                            data.user?.role ||
                            data.user?.roles?.[0] ||
                            data.authorities?.[0] ||
                            data.authority
                        )
                        : null;


                /*
                 * Handle role returned as an array.
                 */

                if (Array.isArray(role)) {
                    role = role[0];
                }


                /*
                 * If role is not supplied by the API,
                 * attempt to read it from the JWT.
                 */

                if (!role) {
                    role = getRoleFromToken(token);
                }


                /*
                 * Normalize role.
                 *
                 * ROLE_TREASURER
                 *       ↓
                 * TREASURER
                 */

                if (typeof role === "string") {

                    role = role
                        .replace(/^ROLE_/, "")
                        .toUpperCase();
                }


                /*
                 * Store role.
                 */

                if (role) {

                    localStorage.setItem(
                        "role",
                        role
                    );

                } else {

                    localStorage.removeItem(
                        "role"
                    );
                }


                /*
                 * Store user information when
                 * supplied by the backend.
                 */

                if (data?.user) {

                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );
                }


                setError("");


                /*
                 * Notify parent application.
                 */

                if (onLogin) {
                    onLogin();
                }


                /*
                 * Navigate to dashboard without
                 * requiring React Router inside
                 * this component.
                 */

                window.history.pushState(
                    {},
                    "",
                    "/"
                );

                window.dispatchEvent(
                    new Event("popstate")
                );

            })
            .catch((err) => {

                console.error(
                    "Login error:",
                    err
                );

                setError(
                    "Invalid email or password"
                );

            })
            .finally(() => {

                setLoading(false);

            });
    };


    const handleSubmit = (event) => {

        event.preventDefault();

        if (!loading) {
            handleLogin();
        }
    };


    /*
     * Navigate to registration page.
     */

    const handleRegister = () => {

        window.history.pushState(
            {},
            "",
            "/register"
        );

        window.dispatchEvent(
            new Event("popstate")
        );
    };


    return (

        <main className="login-page">

            {/* Background decoration */}

            <div
                className="login-background-grid"
                aria-hidden="true"
            />

            <div
                className="login-glow login-glow-one"
                aria-hidden="true"
            />

            <div
                className="login-glow login-glow-two"
                aria-hidden="true"
            />


            {/* Login card */}

            <section
                className="login-card"
                aria-label="VaultFlow login"
            >


                {/* Brand */}

                <div className="login-brand">

                    <div className="login-logo">
                        VF
                    </div>

                    <div>

                        <div className="login-brand-name">
                            VaultFlow
                        </div>

                        <div className="login-brand-label">
                            FINANCIAL OPERATIONS
                        </div>

                    </div>

                </div>


                {/* Heading */}

                <div className="login-heading">

                    <div className="login-eyebrow">
                        SECURE ACCESS
                    </div>

                    <h1>
                        Welcome back
                    </h1>

                    <p>
                        Sign in to securely manage your
                        financial operations and transactions.
                    </p>

                </div>


                {/* Form */}

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >


                    {/* Email */}

                    <div className="login-field">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <div className="login-input-wrapper">

                            <span
                                className="login-input-icon"
                                aria-hidden="true"
                            >
                                @
                            </span>

                            <input
                                id="email"
                                type="email"
                                placeholder="Email (auditor@vaultflow.io)"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                autoComplete="email"
                            />

                        </div>

                    </div>


                    {/* Password */}

                    <div className="login-field">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="login-input-wrapper">

                            <span
                                className="login-input-icon"
                                aria-hidden="true"
                            >
                                •
                            </span>

                            <input
                                id="password"
                                type="password"
                                placeholder="Password (Enter your secure account password)"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                autoComplete="current-password"
                            />

                        </div>

                    </div>


                    {/* Session information */}

                    <div className="login-options">

                        <span>
                            Protected session
                        </span>

                        <span className="login-session-status">

                            <span
                                className="login-status-dot"
                                aria-hidden="true"
                            />

                            JWT secured

                        </span>

                    </div>


                    {/* Login button */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                        aria-busy={loading}
                        aria-label={
                            loading
                                ? "Login in progress"
                                : "Login"
                        }
                    >

                        {loading ? (

                            <>
                                <span
                                    className="login-spinner"
                                    aria-hidden="true"
                                />

                                <span>
                                    Signing in...
                                </span>
                            </>

                        ) : (

                            <>

                                <span>
                                    Login
                                </span>

                                <span
                                    className="login-button-arrow"
                                    aria-hidden="true"
                                >
                                    →
                                </span>

                            </>

                        )}

                    </button>


                    {/* =================================================
                        REGISTER BUTTON
                    ================================================= */}

                    <div className="login-register-section">

                        <span>
                            Don't have a VaultFlow account?
                        </span>

                        <button
                            type="button"
                            className="login-register-button"
                            onClick={handleRegister}
                        >
                            Register
                        </button>

                    </div>


                    {/* Error */}

                    {error && (

                        <div
                            className="login-error"
                            role="alert"
                        >

                            <span
                                className="login-error-icon"
                                aria-hidden="true"
                            >
                                !
                            </span>

                            <span>
                                {error}
                            </span>

                        </div>

                    )}

                </form>


                {/* Security information */}

                <div className="login-security">

                    <div
                        className="login-security-icon"
                        aria-hidden="true"
                    >
                        🔒
                    </div>

                    <div>

                        <strong>
                            Secure authentication
                        </strong>

                        <span>
                            Your session is protected using
                            JWT-based authentication.
                        </span>

                    </div>

                </div>


                {/* Footer */}

                <div className="login-footer">

                    <span>
                        VaultFlow
                    </span>

                    <span className="login-footer-separator">
                        •
                    </span>

                    <span>
                        Secure Financial Management
                    </span>

                </div>

            </section>

        </main>
    );
};

export default Login;