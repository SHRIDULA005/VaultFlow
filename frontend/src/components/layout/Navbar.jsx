import React from "react";
import {
    Link,
    useInRouterContext,
    useLocation,
    useNavigate
} from "react-router-dom";

const Navbar = ({ isAdmin = false }) => {
    const inRouter = useInRouterContext();

    /*
     * Get the logged-in user's role.
     *
     * The login process stores the role in localStorage:
     *
     *     localStorage.setItem("role", role)
     *
     * Supported roles:
     *
     *     TREASURER
     *     ADMIN
     */
    const storedRole =
        localStorage.getItem("role")?.trim().toUpperCase() || "";

    /*
     * The Approve Transaction button should be visible
     * to both TREASURER and ADMIN.
     */
    const canApproveTransactions =
        isAdmin ||
        storedRole === "TREASURER" ||
        storedRole === "ADMIN";

    if (inRouter) {
        return (
            <RouterNavbar
                isAdmin={isAdmin}
                role={storedRole}
                canApproveTransactions={canApproveTransactions}
            />
        );
    }

    return (
        <NavbarContent
            isAdmin={isAdmin}
            role={storedRole}
            canApproveTransactions={canApproveTransactions}
            pathname={window.location.pathname}
            navigate={null}
        />
    );
};


/*
 * =========================================================
 * ROUTER NAVBAR
 * =========================================================
 */

const RouterNavbar = ({
    isAdmin,
    role,
    canApproveTransactions
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <NavbarContent
            isAdmin={isAdmin}
            role={role}
            canApproveTransactions={canApproveTransactions}
            pathname={location.pathname}
            navigate={navigate}
        />
    );
};


/*
 * =========================================================
 * NAVBAR CONTENT
 * =========================================================
 */

const NavbarContent = ({
    isAdmin = false,
    role = "",
    canApproveTransactions = false,
    pathname = "/",
    navigate = null
}) => {

    /*
     * Safe navigation helper.
     *
     * When React Router is available, use navigate().
     * Otherwise use normal browser navigation.
     */
    const goTo = (path) => {
        if (navigate) {
            navigate(path);
        } else {
            window.location.href = path;
        }
    };


    /*
     * =====================================================
     * LOGOUT
     * =====================================================
     */

    const handleLogout = () => {

        /*
         * Remove all authentication information
         * stored by the application.
         */
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        /*
         * Return to login page.
         */
        if (navigate) {
            navigate("/login", {
                replace: true
            });
        } else {
            window.location.href = "/login";
        }
    };


    /*
     * =====================================================
     * ACTIVE NAVIGATION
     * =====================================================
     */

    const isActive = (path) => {

        /*
         * Dashboard should only be active on "/".
         */
        if (path === "/") {
            return pathname === "/";
        }

        return pathname.startsWith(path);
    };


    /*
     * =====================================================
     * SAFE LINK
     * =====================================================
     *
     * React Router <Link> requires a Router.
     *
     * Some tests render Navbar without a Router,
     * so use <a> in that situation.
     */

    const SafeLink = ({
        to,
        children,
        style
    }) => {

        if (navigate) {
            return (
                <Link
                    to={to}
                    style={style}
                >
                    {children}
                </Link>
            );
        }

        return (
            <a
                href={to}
                style={style}
            >
                {children}
            </a>
        );
    };


    /*
     * =====================================================
     * NAVBAR UI
     * =====================================================
     */

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

            {/* =================================================
                BRAND
            ================================================= */}

            <SafeLink
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

            </SafeLink>


            {/* =================================================
                MAIN NAVIGATION
            ================================================= */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flex: 1
                }}
            >

                {/* DASHBOARD */}

                <SafeLink
                    to="/"
                    style={{
                        ...navLinkStyle,
                        ...(isActive("/")
                            ? activeNavLinkStyle
                            : {})
                    }}
                >
                    Dashboard
                </SafeLink>


                {/* ACCOUNTS */}

                <SafeLink
                    to="/accounts"
                    style={{
                        ...navLinkStyle,
                        ...(isActive("/accounts")
                            ? activeNavLinkStyle
                            : {})
                    }}
                >
                    Accounts
                </SafeLink>


                {/* TRANSACTIONS */}

                <SafeLink
                    to="/transactions"
                    style={{
                        ...navLinkStyle,
                        ...(isActive("/transactions")
                            ? activeNavLinkStyle
                            : {})
                    }}
                >
                    Transactions
                </SafeLink>


                {/* LEDGERS */}

                <SafeLink
                    to="/ledgers"
                    style={{
                        ...navLinkStyle,
                        ...(isActive("/ledgers")
                            ? activeNavLinkStyle
                            : {})
                    }}
                >
                    Ledgers
                </SafeLink>

            </div>


            {/* =================================================
                ACTIONS
            ================================================= */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}
            >

                {/* =================================================
                    APPROVE TRANSACTION
                    TREASURER + ADMIN
                ================================================= */}

                {canApproveTransactions && (

                    <button
                        type="button"
                        onClick={() =>
                            goTo("/transactions/approval")
                        }
                        aria-label="Approve Transaction"
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


                {/* =================================================
                    LOGOUT
                ================================================= */}

                <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Logout"
                    style={{
                        ...actionButtonStyle,
                        background:
                            "rgba(255, 255, 255, 0.06)",
                        color: "#e2e8f0",
                        border:
                            "1px solid rgba(148, 163, 184, 0.2)"
                    }}
                >

                    <span aria-hidden="true">
                        ↪
                    </span>

                    Logout

                </button>

            </div>

        </nav>
    );
};


/*
 * =========================================================
 * NAVIGATION STYLES
 * =========================================================
 */

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


const activeNavLinkStyle = {
    color: "#ffffff",
    background:
        "rgba(59, 130, 246, 0.14)"
};


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