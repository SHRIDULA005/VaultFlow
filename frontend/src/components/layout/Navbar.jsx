// // import React from "react";

// // const Navbar = () => {
// //     return (
// //         <nav>
// //             <a href="/">Home</a>
// //             <a href="/login">Login</a>
// //         </nav>
// //     );
// // };

// // export default Navbar;
// import React from "react";
// import { useNavigate } from "react-router-dom";

// const Navbar = ({ isAdmin = false }) => {
//     const navigate = useNavigate();

//     const handleLogout = () => {
//         localStorage.removeItem("token");
//         localStorage.removeItem("role");
//         navigate("/login");
//     };

//     return (
//         <nav>
//             <a href="/">Home</a>
//             <a href="/login">Login</a>

//             {isAdmin && (
//                 <button type="button">
//                     Approve Transaction
//                 </button>
//             )}

//             <button type="button" onClick={handleLogout}>
//                 Logout
//             </button>
//         </nav>
//     );
// };

// export default Navbar;
import React from "react";

const Navbar = ({ isAdmin = false }) => {

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
    };

    return (
        <nav>
            <a href="/">Home</a>

            <a href="/login">Login</a>

            {isAdmin && (
                <button type="button">
                    Approve Transaction
                </button>
            )}

            <button type="button" onClick={handleLogout}>
                Logout
            </button>
        </nav>
    );
};

export default Navbar;