// import React from "react";

// const Navbar = () => {
//     return (
//         <nav>
//             <a href="/">Home</a>
//             <a href="/login">Login</a>
//         </nav>
//     );
// };

// export default Navbar;
import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/dashboard">Banking System</Link>
            </div>

            <div className="navbar-links">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/accounts">Accounts</Link>
                <Link to="/transactions">Transactions</Link>
                <Link to="/ledger">Ledger</Link>
                <Link to="/audit">Audit Logs</Link>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;