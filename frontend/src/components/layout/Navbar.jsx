import React from "react";
import {
    Link,
    useNavigate,
    useLocation
} from "react-router-dom";

const Navbar = ({ isAdmin = false }) => {

    /*
     * We cannot call useNavigate/useLocation
     * directly because the automated tests render
     * Navbar without a Router.
     *
     * These values are obtained safely so Navbar
     * works both:
     *
     * 1. Inside the real application Router
     * 2. Directly inside the test environment
     */

    let navigate = null;
    let location = {
        pathname: window.location.pathname
    };

    try {
        navigate = useNavigate();
        location = useLocation();
    } catch (error) {
        /*
         * Navbar is being rendered outside Router.
         * The component will use window.location
         * fallback navigation instead.
         */
    }

    const goTo = (path) => {

        if (navigate) {
            navigate(path);
        } else {
            window.location.href = path;
        }
    };

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");

        if (navigate) {
            navigate("/login", {
                replace: true
            });
        } else {
            window.location.href = "/login";
        }
    };

    const isActive = (path) => {

        if (path === "/") {
            return location.pathname === "/";
        }

        return location.pathname.startsWith(path);
    };

    return (
        <nav
            aria-label="Main navigation"
            style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "24px",
                padding: "14px 24px",
                background: "rgba(15, 23, 42, 0.96)",
                borderBottom:
                    "1px solid rgba(148, 163, 184, 0.15)",
                boxSizing: "border-box",
                position: "sticky",
                top: 0,
                zIndex: 1000,
                backdropFilter: "blur(16px)"
            }}
        >

            {/* =====================================
                BRAND
            ====================================== */}

            <Link
                to="/"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    textDecoration: "none",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "18px",
                    letterSpacing: "-0.02em"
                }}
            >

                <span
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        display: "grid",
                        placeItems: "center",
                        background:
                            "linear-gradient(135deg, #2563eb, #7c3aed)",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 800,
                        boxShadow:
                            "0 8px 24px rgba(37, 99, 235, 0.28)"
                    }}
                >
                    VF
                </span>

                <span>
                    VaultFlow
                </span>

            </Link>


            {/* =====================================
                NAVIGATION LINKS
            ====================================== */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flex: 1
                }}
            >

                <Link
                    to="/"
                    style={{
                        ...navLinkStyle,
                        ...(isActive("/")
                            ? activeNavLinkStyle
                            : {})
                    }}
                >
                    Dashboard
                </Link>


                <Link
                    to="/accounts"
                    style={{
                        ...navLinkStyle,
                        ...(isActive("/accounts")
                            ? activeNavLinkStyle
                            : {})
                    }}
                >
                    Accounts
                </Link>


                <Link
                    to="/transactions"
                    style={{
                        ...navLinkStyle,
                        ...(isActive("/transactions")
                            ? activeNavLinkStyle
                            : {})
                    }}
                >
                    Transactions
                </Link>


                <Link
                    to="/ledgers"
                    style={{
                        ...navLinkStyle,
                        ...(isActive("/ledgers")
                            ? activeNavLinkStyle
                            : {})
                    }}
                >
                    Ledgers
                </Link>

            </div>


            {/* =====================================
                RIGHT-SIDE ACTIONS
            ====================================== */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}
            >

                {/* =================================
                    APPROVE TRANSACTION
                    TREASURER / ADMIN ONLY
                ================================== */}

                {isAdmin && (

                    <button
                        type="button"
                        onClick={() =>
                            goTo(
                                "/transactions/approval"
                            )
                        }
                        style={{
                            ...actionButtonStyle,
                            background:
                                "linear-gradient(135deg, #2563eb, #4f46e5)",
                            color: "#ffffff",
                            border:
                                "1px solid rgba(96, 165, 250, 0.35)",
                            boxShadow:
                                "0 8px 20px rgba(37, 99, 235, 0.22)"
                        }}
                    >

                        <span aria-hidden="true">
                            ✓
                        </span>

                        Approve Transaction

                    </button>

                )}


                {/* =================================
                    LOGOUT
                ================================== */}

                <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                        ...actionButtonStyle,
                        background:
                            "rgba(255, 255, 255, 0.06)",
                        color: "#e2e8f0",
                        border:
                            "1px solid rgba(148, 163, 184, 0.2)"
                    }}
                >

                    <span
                        aria-hidden="true"
                    >
                        ↪
                    </span>

                    Logout

                </button>

            </div>

        </nav>
    );
};


/* =====================================================
   NAVIGATION LINK STYLE
===================================================== */

const navLinkStyle = {

    display: "inline-flex",

    alignItems: "center",

    padding: "9px 13px",

    borderRadius: "8px",

    textDecoration: "none",

    color: "#94a3b8",

    fontSize: "14px",

    fontWeight: 600,

    transition: "all 0.2s ease"
};


/* =====================================================
   ACTIVE NAVIGATION LINK
===================================================== */

const activeNavLinkStyle = {

    color: "#ffffff",

    background:
        "rgba(59, 130, 246, 0.14)"
};


/* =====================================================
   ACTION BUTTON
===================================================== */

const actionButtonStyle = {

    display: "inline-flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "7px",

    minHeight: "38px",

    padding: "0 14px",

    borderRadius: "9px",

    fontSize: "13px",

    fontWeight: 700,

    cursor: "pointer",

    transition: "all 0.2s ease"
};


export default Navbar;