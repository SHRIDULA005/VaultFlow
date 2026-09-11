// Delete account
const handleDelete = async (id) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this account?"
    );

    if (!confirmed) {
        return;
    }

    try {
        setErrorMessage("");
        setSuccessMessage("");

        await accountService.deleteAccount(id);

        setSuccessMessage("Account deleted successfully.");

        // Refresh account list
        await loadAccounts();
    } catch (error) {
        console.error("Error deleting account:", error);

        setErrorMessage(
            "Unable to delete account. Please try again."
        );
    }
};