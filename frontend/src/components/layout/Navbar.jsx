import React from "react";

const Navbar = ({ isAdmin = false }) => {
    return (
        <nav>
            <a href="/">Home</a>
            <a href="/login">Login</a>

            {isAdmin && (
                <button type="button">
                    Approve Transaction
                </button>
            )}
        </nav>
    );
};

export default Navbar;