import React, { useEffect, useState } from "react";
import accountService from "../../services/accountService";
import "./AccountForm.css";

const AccountForm = () => {
    const [accountName, setAccountName] = useState("");
    const [accountType, setAccountType] = useState("Checking");
    const [interestRate, setInterestRate] = useState("");

    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // EDIT STATE
    const [editingAccount, setEditingAccount] = useState(null);
    const [editAccountName, setEditAccountName] = useState("");
    const [editAccountType, setEditAccountType] = useState("Checking");
    const [editBalance, setEditBalance] = useState("");
    const [editInterestRate, setEditInterestRate] = useState("");

    const loadAccounts = async () => {
        try {
            setLoading(true);

            const data = await accountService.getAccounts();

            setAccounts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading accounts:", error);
            setErrorMessage("Unable to load accounts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAccounts();
    }, []);

    // =========================================================
    // CREATE ACCOUNT
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");

        if (!accountName.trim()) {
            setErrorMessage("Please enter an account name.");
            return;
        }

        try {
            setSaving(true);

            const accountData = {
                accountName: accountName.trim(),
                accountType: accountType.toUpperCase()
            };

            if (
                accountType === "Savings" &&
                interestRate !== ""
            ) {
                accountData.interestRate =
                    Number(interestRate);
            }

            await accountService.createAccount(accountData);

            setSuccessMessage(
                "Account created successfully."
            );

            setAccountName("");
            setAccountType("Checking");
            setInterestRate("");

            await loadAccounts();

        } catch (error) {
            console.error(
                "Error creating account:",
                error
            );

            setErrorMessage(
                "Unable to create an account."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // DELETE ACCOUNT
    // =========================================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this account?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setSuccessMessage("");
            setErrorMessage("");

            await accountService.deleteAccount(id);

            setSuccessMessage(
                "Account deleted successfully."
            );

            await loadAccounts();

        } catch (error) {
            console.error(
                "Error deleting account:",
                error
            );

            setErrorMessage(
                "Unable to delete account. Please try again."
            );
        }
    };

    // =========================================================
    // OPEN EDIT
    // =========================================================

    const handleEdit = (account) => {
        setSuccessMessage("");
        setErrorMessage("");

        setEditingAccount(account);

        setEditAccountName(
            account.accountName ||
            account.name ||
            ""
        );

        setEditAccountType(
            account.accountType
                ? formatAccountType(account.accountType)
                : "Checking"
        );

        setEditBalance(
            account.balance !== null &&
            account.balance !== undefined
                ? String(account.balance)
                : "0"
        );

        setEditInterestRate(
            account.interestRate !== null &&
            account.interestRate !== undefined
                ? String(account.interestRate)
                : ""
        );

        // Scroll the editor into view
        setTimeout(() => {
            const editor =
                document.getElementById(
                    "account-edit-panel"
                );

            if (editor) {
                editor.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }
        }, 50);
    };

    // =========================================================
    // CLOSE EDIT
    // =========================================================

    const handleCancelEdit = () => {
        setEditingAccount(null);

        setEditAccountName("");
        setEditAccountType("Checking");
        setEditBalance("");
        setEditInterestRate("");
    };

    // =========================================================
    // SAVE EDIT
    // =========================================================

    const handleUpdate = async (event) => {
        event.preventDefault();

        if (!editingAccount) {
            return;
        }

        setSuccessMessage("");
        setErrorMessage("");

        if (!editAccountName.trim()) {
            setErrorMessage(
                "Please enter an account name."
            );
            return;
        }

        try {
            setSaving(true);

            const accountData = {
                accountName:
                    editAccountName.trim(),

                accountType:
                    editAccountType.toUpperCase(),

                balance:
                    editBalance === ""
                        ? 0
                        : Number(editBalance),

                interestRate:
                    editInterestRate === ""
                        ? null
                        : Number(editInterestRate)
            };

            await accountService.updateAccount(
                editingAccount.id,
                accountData
            );

            setSuccessMessage(
                "Account updated successfully."
            );

            handleCancelEdit();

            await loadAccounts();

        } catch (error) {
            console.error(
                "Error updating account:",
                error
            );

            setErrorMessage(
                "Unable to update account. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // DATE / TIME
    // =========================================================

    const formatDateTime = (account) => {
        const possibleDate =
            account.updatedAt ||
            account.updatedDate ||
            account.createdAt ||
            account.createdDate;

        if (possibleDate) {
            const date = new Date(possibleDate);

            if (!Number.isNaN(date.getTime())) {
                return date.toLocaleString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );
            }
        }

        return "Recently updated";
    };

    // =========================================================
    // ACCOUNT TYPE
    // =========================================================

    const formatAccountType = (type) => {
        if (!type) {
            return "Checking";
        }

        const normalized =
            String(type).toUpperCase();

        switch (normalized) {
            case "SAVINGS":
                return "Savings";

            case "LOAN":
                return "Loan";

            case "INVESTMENT":
                return "Investment";

            case "PAYROLL":
                return "Payroll";

            default:
                return "Checking";
        }
    };

    const getAccountIcon = (type) => {
        switch (
            String(type || "").toUpperCase()
        ) {
            case "SAVINGS":
                return "S";

            case "LOAN":
                return "L";

            case "INVESTMENT":
                return "I";

            case "PAYROLL":
                return "P";

            default:
                return "C";
        }
    };

    return (
        <div className="account-page">

            {/* =================================================
                CREATE ACCOUNT
            ================================================= */}

            <section className="account-create-section">

                <div className="account-section-heading">

                    <div>
                        <span className="section-eyebrow">
                            VAULTFLOW
                        </span>

                        <h2>
                            Create Account
                        </h2>

                        <p>
                            Create and configure a new
                            financial account.
                        </p>
                    </div>

                </div>

                {successMessage && (
                    <div
                        className="account-alert account-success"
                        role="alert"
                    >
                        <span>✓</span>

                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div
                        className="account-alert account-error"
                        role="alert"
                    >
                        <span>!</span>

                        {errorMessage}
                    </div>
                )}

                <form
                    className="account-form"
                    onSubmit={handleSubmit}
                >

                    {/* ACCOUNT NAME */}

                    <div className="form-field">

                        <label htmlFor="accountName">
                            Account Name
                        </label>

                        <input
                            id="accountName"
                            type="text"
                            placeholder="Enter account name"
                            value={accountName}
                            onChange={(event) =>
                                setAccountName(
                                    event.target.value
                                )
                            }
                        />

                        {accountName.trim() && (
                            <div
                                className="field-preview"
                                data-testid="account-name-preview"
                            >
                                <span>
                                    Preview:
                                </span>

                                <strong>
                                    {accountName}
                                </strong>
                            </div>
                        )}

                    </div>

                    {/* ACCOUNT TYPE */}

                    <div className="form-field">

                        <label htmlFor="accountType">
                            Account Type
                        </label>

                        <select
                            id="accountType"
                            value={accountType}
                            onChange={(event) =>
                                setAccountType(
                                    event.target.value
                                )
                            }
                        >
                            <option value="Checking">
                                Checking
                            </option>

                            <option value="Savings">
                                Savings
                            </option>

                            <option value="Loan">
                                Loan
                            </option>

                            <option value="Investment">
                                Investment
                            </option>

                            <option value="Payroll">
                                Payroll
                            </option>
                        </select>

                    </div>

                    {/* INTEREST RATE */}

                    {accountType === "Savings" && (
                        <div className="form-field">

                            <label htmlFor="interestRate">
                                Interest Rate
                            </label>

                            <div className="input-with-suffix">

                                <input
                                    id="interestRate"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Enter interest rate"
                                    value={interestRate}
                                    onChange={(event) =>
                                        setInterestRate(
                                            event.target.value
                                        )
                                    }
                                />

                                <span>
                                    %
                                </span>

                            </div>

                        </div>
                    )}

                    {/* CREATE BUTTON */}

                    <div className="account-form-actions">

                        <button
                            type="submit"
                            className="account-create-button"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Creating...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>

                    </div>

                </form>

            </section>

            {/* =================================================
                EDIT ACCOUNT PANEL
            ================================================= */}

            {editingAccount && (
                <section
                    id="account-edit-panel"
                    className="account-edit-section"
                >

                    <div className="account-edit-header">

                        <div>
                            <span className="section-eyebrow">
                                ACCOUNT SETTINGS
                            </span>

                            <h2>
                                Edit Account
                            </h2>

                            <p>
                                Update the account details,
                                balance and interest rate.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="account-close-button"
                            onClick={handleCancelEdit}
                            aria-label="Close edit account"
                        >
                            ×
                        </button>

                    </div>

                    <form
                        className="account-edit-form"
                        onSubmit={handleUpdate}
                    >

                        {/* NAME */}

                        <div className="form-field">

                            <label htmlFor="editAccountName">
                                Account Name
                            </label>

                            <input
                                id="editAccountName"
                                type="text"
                                value={editAccountName}
                                onChange={(event) =>
                                    setEditAccountName(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                        {/* TYPE */}

                        <div className="form-field">

                            <label htmlFor="editAccountType">
                                Account Type
                            </label>

                            <select
                                id="editAccountType"
                                value={editAccountType}
                                onChange={(event) =>
                                    setEditAccountType(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="Checking">
                                    Checking
                                </option>

                                <option value="Savings">
                                    Savings
                                </option>

                                <option value="Loan">
                                    Loan
                                </option>

                                <option value="Investment">
                                    Investment
                                </option>

                                <option value="Payroll">
                                    Payroll
                                </option>
                            </select>

                        </div>

                        {/* BALANCE */}

                        <div className="form-field">

                            <label htmlFor="editBalance">
                                Balance
                            </label>

                            <div className="input-with-prefix">

                                <span>
                                    ₹
                                </span>

                                <input
                                    id="editBalance"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editBalance}
                                    onChange={(event) =>
                                        setEditBalance(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>

                        {/* INTEREST */}

                        <div className="form-field">

                            <label htmlFor="editInterestRate">
                                Interest Rate
                            </label>

                            <div className="input-with-suffix">

                                <input
                                    id="editInterestRate"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editInterestRate}
                                    onChange={(event) =>
                                        setEditInterestRate(
                                            event.target.value
                                        )
                                    }
                                />

                                <span>
                                    %
                                </span>

                            </div>

                        </div>

                        {/* ACTIONS */}

                        <div className="account-edit-actions">

                            <button
                                type="button"
                                className="account-cancel-button"
                                onClick={handleCancelEdit}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="account-save-button"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="button-spinner"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <span>
                                            ✓
                                        </span>

                                        Save Changes
                                    </>
                                )}
                            </button>

                        </div>

                    </form>

                </section>
            )}

            {/* =================================================
                ACCOUNTS LIST
            ================================================= */}

            <section className="accounts-list-section">

                <div className="account-section-heading">

                    <div>
                        <span className="section-eyebrow">
                            VAULTFLOW
                        </span>

                        <h2>
                            Accounts
                        </h2>

                        <p>
                            {accounts.length}{" "}
                            {accounts.length === 1
                                ? "account"
                                : "accounts"}{" "}
                            available
                        </p>
                    </div>

                    <div className="account-count">

                        {accounts.length}

                        <span>
                            {accounts.length === 1
                                ? "Account"
                                : "Accounts"}
                        </span>

                    </div>

                </div>

                {loading ? (

                    <div className="accounts-state">

                        <div className="loading-spinner"></div>

                        <p>
                            Loading accounts...
                        </p>

                    </div>

                ) : accounts.length === 0 ? (

                    <div className="accounts-empty">

                        <div className="empty-account-icon">
                            +
                        </div>

                        <h3>
                            No accounts found
                        </h3>

                        <p>
                            Create your first account
                            using the form above.
                        </p>

                    </div>

                ) : (

                    <div className="accounts-grid">

                        {accounts.map((account) => {

                            const type =
                                formatAccountType(
                                    account.accountType
                                );

                            return (
                                <div
                                    className="account-card"
                                    key={account.id}
                                >

                                    {/* CARD TOP */}

                                    <div className="account-card-top">

                                        <div className="account-icon">
                                            {getAccountIcon(
                                                account.accountType
                                            )}
                                        </div>

                                        <span className="account-status">
                                            ACTIVE
                                        </span>

                                    </div>

                                    {/* CARD BODY */}

                                    <div className="account-card-body">

                                        <h3>
                                            {account.accountName ||
                                                account.name}
                                        </h3>

                                        <span className="account-type">
                                            {type.toUpperCase()}
                                        </span>

                                        {/* BALANCE */}

                                        <div className="account-card-balance">

                                            <span>
                                                BALANCE
                                            </span>

                                            <strong>
                                                {Number(
                                                    account.balance || 0
                                                ).toLocaleString(
                                                    "en-IN",
                                                    {
                                                        style: "currency",
                                                        currency: "INR",
                                                        minimumFractionDigits: 2
                                                    }
                                                )}
                                            </strong>

                                        </div>

                                        {/* INTEREST */}

                                        {account.interestRate !== null &&
                                            account.interestRate !==
                                                undefined && (

                                            <div className="account-interest">

                                                <span>
                                                    Interest Rate
                                                </span>

                                                <strong>
                                                    {
                                                        account.interestRate
                                                    }
                                                    %
                                                </strong>

                                            </div>
                                        )}

                                        {/* DATE / TIME */}

                                        <div className="account-updated">

                                            <span className="account-updated-icon">
                                                ◷
                                            </span>

                                            <div>
                                                <span>
                                                    LAST UPDATED
                                                </span>

                                                <strong>
                                                    {formatDateTime(
                                                        account
                                                    )}
                                                </strong>
                                            </div>

                                        </div>

                                        {/* ACTIONS */}

                                        <div className="account-card-actions">

                                            <button
                                                type="button"
                                                className="account-edit-button"
                                                onClick={() =>
                                                    handleEdit(
                                                        account
                                                    )
                                                }
                                            >
                                                <span>
                                                    ✎
                                                </span>

                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="account-delete-button"
                                                onClick={() =>
                                                    handleDelete(
                                                        account.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                )}

            </section>

        </div>
    );
};

export default AccountForm;