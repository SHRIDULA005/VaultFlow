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

        const payload = JSON.parse(
            atob(padded)
        );

        let role =
            payload.role ||
            payload.roles ||
            payload.authorities ||
            payload.authority;

        if (Array.isArray(role)) {
            role = role[0];
        }

        if (typeof role === "string") {
            role = role.replace(
                /^ROLE_/,
                ""
            );
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

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


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
                 * Get role from login response
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


                if (Array.isArray(role)) {
                    role = role[0];
                }


                /*
                 * If role is not returned directly,
                 * read it from the JWT.
                 */

                if (!role) {

                    role =
                        getRoleFromToken(token);

                }


                /*
                 * Normalize role
                 */

                if (typeof role === "string") {

                    role = role
                        .replace(
                            /^ROLE_/,
                            ""
                        )
                        .toUpperCase();

                }


                /*
                 * Store role
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
                 * Store user information
                 */

                if (data?.user) {

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            data.user
                        )
                    );

                }


                setError("");


                /*
                 * Notify parent
                 */

                if (onLogin) {
                    onLogin();
                }


                /*
                 * Navigate to dashboard
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
     * Navigate to registration
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


            {/* =================================================
                BACKGROUND
            ================================================= */}

            <div
                className="login-bg-grid"
                aria-hidden="true"
            />

            <div
                className="login-bg-glow login-bg-glow-blue"
                aria-hidden="true"
            />

            <div
                className="login-bg-glow login-bg-glow-purple"
                aria-hidden="true"
            />


            {/* =================================================
                MAIN LAYOUT
            ================================================= */}

            <div className="login-layout">


                {/* =================================================
                    LEFT BRAND PANEL
                ================================================= */}

                <section className="login-brand-panel">


                    {/* BRAND */}

                    <div className="login-brand">

                        <div className="login-logo">
                            VF
                        </div>


                        <div className="login-brand-details">

                            <div className="login-brand-name">
                                VaultFlow
                            </div>

                            <div className="login-brand-subtitle">
                                FINANCIAL OPERATIONS
                            </div>

                        </div>

                    </div>


                    {/* HERO */}

                    <div className="login-hero">

                        <div className="login-hero-label">

                            <span className="login-hero-dot" />

                            SECURE FINANCIAL PLATFORM

                        </div>


                        <h1>

                            Financial operations.
                            <br />

                            <span>
                                Simplified.
                            </span>

                        </h1>


                        <p>

                            Manage accounts, transactions,
                            ledgers and audit activity from
                            one secure financial operations
                            platform.

                        </p>

                    </div>


                    {/* =================================================
                        FINANCIAL VISUAL
                    ================================================= */}

                    <div
                        className="login-financial-visual"
                        aria-hidden="true"
                    >


                        <div className="visual-header">

                            <span>
                                TRANSACTION ACTIVITY
                            </span>

                            <span className="visual-live">
                                LIVE
                            </span>

                        </div>


                        <div className="visual-chart">

                            <div className="chart-line chart-line-one" />
                            <div className="chart-line chart-line-two" />
                            <div className="chart-line chart-line-three" />

                            <div className="chart-point chart-point-one" />
                            <div className="chart-point chart-point-two" />
                            <div className="chart-point chart-point-three" />
                            <div className="chart-point chart-point-four" />
                            <div className="chart-point chart-point-five" />

                        </div>


                        <div className="visual-stats">

                            <div>

                                <span>
                                    SECURE
                                </span>

                                <strong>
                                    99.9%
                                </strong>

                            </div>


                            <div>

                                <span>
                                    ACCESS
                                </span>

                                <strong>
                                    RBAC
                                </strong>

                            </div>


                            <div>

                                <span>
                                    AUDIT
                                </span>

                                <strong>
                                    ACTIVE
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        FEATURES
                    ================================================= */}

                    <div className="login-features">


                        <div className="login-feature">

                            <div className="feature-icon">
                                ✓
                            </div>

                            <div>

                                <strong>
                                    Role-based access
                                </strong>

                                <span>
                                    Permissions designed around your role.
                                </span>

                            </div>

                        </div>


                        <div className="login-feature">

                            <div className="feature-icon">
                                ✓
                            </div>

                            <div>

                                <strong>
                                    Secure transactions
                                </strong>

                                <span>
                                    Controlled financial transaction processing.
                                </span>

                            </div>

                        </div>


                        <div className="login-feature">

                            <div className="feature-icon">
                                ✓
                            </div>

                            <div>

                                <strong>
                                    Complete audit visibility
                                </strong>

                                <span>
                                    Track important financial activity.
                                </span>

                            </div>

                        </div>


                    </div>


                    {/* LEFT FOOTER */}

                    <div className="login-brand-footer">

                        <span>
                            VaultFlow
                        </span>

                        <span>
                            Secure Financial Management
                        </span>

                    </div>

                </section>


                {/* =================================================
                    RIGHT LOGIN PANEL
                ================================================= */}

                <section className="login-form-panel">


                    <div className="login-form-container">


                        {/* MOBILE BRAND */}

                        <div className="mobile-login-brand">

                            <div className="login-logo">
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


                        {/* FORM HEADER */}

                        <div className="login-heading">

                            <div className="login-eyebrow">
                                SECURE ACCESS
                            </div>


                            <h2>
                                Welcome back
                            </h2>


                            <p>
                                Sign in to securely manage your
                                financial operations and transactions.
                            </p>

                        </div>


                        {/* =================================================
                            LOGIN FORM
                        ================================================= */}

                        <form
                            className="login-form"
                            onSubmit={handleSubmit}
                        >


                            {/* EMAIL */}

                            <div className="login-field">

                                <label htmlFor="email">
                                    Email Address
                                </label>


                                <div className="login-input">

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
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        autoComplete="email"
                                    />

                                </div>

                            </div>


                            {/* PASSWORD */}

                            <div className="login-field">

                                <label htmlFor="password">
                                    Password
                                </label>


                                <div className="login-input">

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
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value
                                            )
                                        }
                                        autoComplete="current-password"
                                    />

                                </div>

                            </div>


                            {/* SESSION STATUS */}

                            <div className="login-session-row">

                                <span>
                                    Protected session
                                </span>


                                <span className="session-secure">

                                    <span className="session-dot" />

                                    JWT secured

                                </span>

                            </div>


                            {/* LOGIN BUTTON */}

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

                                        <span className="login-spinner" />

                                        <span>
                                            Signing in...
                                        </span>

                                    </>

                                ) : (

                                    <>

                                        <span>
                                            Login
                                        </span>

                                        <span className="login-arrow">
                                            →
                                        </span>

                                    </>

                                )}

                            </button>


                            {/* ERROR */}

                            {error && (

                                <div
                                    className="login-error"
                                    role="alert"
                                >

                                    <span className="error-icon">
                                        !
                                    </span>

                                    <span>
                                        {error}
                                    </span>

                                </div>

                            )}

                        </form>


                        {/* =================================================
                            REGISTER
                        ================================================= */}

                        <div className="register-section">


                            <div className="register-divider">

                                <span>
                                    NEW TO VAULTFLOW?
                                </span>

                            </div>


                            <button
                                type="button"
                                className="register-button"
                                onClick={handleRegister}
                            >

                                <span className="register-symbol">
                                    +
                                </span>


                                <span className="register-text">

                                    <strong>
                                        Create your account
                                    </strong>

                                    <small>
                                        Set up your profile and access role
                                    </small>

                                </span>


                                <span className="register-arrow">
                                    →
                                </span>

                            </button>

                        </div>


                        {/* =================================================
                            SECURITY
                        ================================================= */}

                        <div className="security-panel">

                            <div className="security-icon">
                                <span>
                                    🔒
                                </span>
                            </div>


                            <div className="security-content">

                                <strong>
                                    Secure authentication
                                </strong>

                                <span>
                                    Your session is protected using
                                    JWT-based authentication.
                                </span>

                            </div>


                            <span className="security-status">
                                SECURE
                            </span>

                        </div>


                        {/* FOOTER */}

                        <div className="login-footer">

                            <span>
                                © VaultFlow
                            </span>

                            <span>
                                •
                            </span>

                            <span>
                                Secure Financial Management
                            </span>

                        </div>

                    </div>

                </section>

            </div>

        </main>
    );
};


export default Login;