const handleLogin = (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    axios
        .post("http://localhost:8080/auth/login", {
            email: email,
            password: password
        })
        .then((response) => {
            console.log("LOGIN SUCCESS:", response.data);

            const data = response.data;

            // Get JWT token
            const token =
                typeof data === "string"
                    ? data
                    : data?.token;

            if (!token) {
                console.error("No token received:", data);
                setError("Invalid email or password");
                return;
            }

            // Save JWT token
            localStorage.setItem("token", token);

            // Get role
            let role = null;

            if (typeof data === "object") {
                role =
                    data.role ||
                    data.user?.role ||
                    data.user?.roles?.[0] ||
                    data.authorities?.[0] ||
                    data.authority;
            }

            // Save role
            if (role) {
                localStorage.setItem("role", role);
            } else {
                localStorage.removeItem("role");
            }

            // Save user information if available
            if (data?.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );
            }

            console.log("Token saved:", localStorage.getItem("token"));
            console.log("Role saved:", localStorage.getItem("role"));

            // Notify parent component
            if (onLogin) {
                onLogin();
            }

            // Navigate to home/dashboard
            window.history.pushState({}, "", "/");
            window.dispatchEvent(new Event("popstate"));
        })
        .catch((err) => {
            console.error("LOGIN ERROR:", err);

            console.error(
                "Status:",
                err.response?.status
            );

            console.error(
                "Response:",
                err.response?.data
            );

            console.error(
                "Headers:",
                err.response?.headers
            );

            setError("Invalid email or password");
        })
        .finally(() => {
            setLoading(false);
        });
};